import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';

import * as Vire from './vire-js/vire';
import { WasmFetchService } from 'src/app/services/wasm-fetch.service';
import { SetWASMPath } from './vire-js/vire-emcc';
import { cache_db } from './vire-js/cache-db'

import * as ace from "ace-builds";
import 'brace';
import 'brace/ext/language_tools';

import { liveQuery } from 'dexie';
import * as pako from 'pako'

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {
  todoLists$ = liveQuery(() => cache_db.wasm_cache_table.toArray());
  pre_code: string="extern puti(n: int);\n\nputi(42);\n";
  console_output: string="";
  console_log_func: Function = ()=>{};
  console_log_capture: Array<any> = [];
  
  // Compilation Variables
  readyForCompilation: boolean = false;

  @ViewChild("editor") private editor: ElementRef<HTMLElement> = {} as ElementRef;

  aceEditor: ace.Ace.Editor = {} as ace.Ace.Editor;

  constructor(private fetch_service: WasmFetchService) {  }

  ngOnInit() {
    this.console_output="Click on the this Console to compile your Code";
  }

  ngAfterViewInit(): void {
    ace.require("ace/ext/language_tools");
    ace.config.set("fontSize", "14px");
    ace.config.set('basePath', 'https://unpkg.com/ace-builds@1.4.12/src-noconflict');

    this.aceEditor = ace.edit(this.editor.nativeElement);
    this.aceEditor.session.setValue(this.pre_code);

    this.aceEditor.setTheme('ace/theme/tomorrow_night');

    this.aceEditor.setOptions({
      enableBasicAutocompletion: true,
      enableLiveAutocompletion: true,
    });
  }

  getEditorContent(): string {
    return this.aceEditor.getValue();
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // WebAssembly Loading and Compilation
  async initiateCompilation(): Promise<void> {
    if(!Vire.isModuleLoaded())
    {
      let file_name = "VIRELANG.wasm.gz";
      let js_file_name = "VIRELANG.js"
      let should_download = false;
      //-- Try to load from IndexedDB Cache

      // Check if wasm is present
      let cnt = await cache_db.wasm_cache_table.count();
      if(cnt>1)
      {
        should_download=true;
        await cache_db.wasm_cache_table.clear();
      }
      else if(cnt==0)
      {
        should_download=true;
      }

      // Check if wasm present is outdated
      let wasm_req = await cache_db.wasm_cache_table.get(0);
      let wasm_time = (wasm_req==undefined)? "" : (wasm_req!.time_upload ?? "");
      if(wasm_time != await this.fetch_service.getTimeOfUpload(file_name))
      {
        should_download=true;
      }
      
      let wasm_bytes_zipped: ArrayBuffer={} as ArrayBuffer;
      let wasm_js: string;
      let wasm_url: string="";
      let wasm_js_url: string="";
      if(should_download)
      {
        // Fetch from Firebase Storage
        this.console_output+="> Fetching the Compiler from Firebase\n";
        [wasm_bytes_zipped, wasm_js]=await this.fetch_service.downloadURL(file_name, js_file_name);

        await cache_db.wasm_cache_table.clear();
        await cache_db.wasm_cache_table.put({
          id: 0,
          bin: wasm_bytes_zipped,
          js: wasm_js,
          time_upload: await this.fetch_service.getTimeOfUpload(file_name),
        });
      }
      else
      {
        this.console_output+="> Using cached compiler\n"
        let fetch_req=await cache_db.wasm_cache_table.get(0);
        wasm_bytes_zipped=fetch_req!.bin;
        wasm_js=fetch_req!.js;
      }

      let wasm_bytes: Uint8Array;
      wasm_bytes=pako.inflate(wasm_bytes_zipped);

      wasm_url=URL.createObjectURL(new Blob([wasm_bytes], {type: "application/wasm"}));
      wasm_js_url=URL.createObjectURL(new Blob([wasm_js], {type: "text/javascript"}));
      
      await Vire.ReloadJS(wasm_js_url);
      SetWASMPath(wasm_url);

      await Vire.LoadMainModule(this.getEditorContent(), "wasm32", wasm_js_url, async()=>{
        this.readyForCompilation=Vire.isModuleLoaded();
      });
    }

    this.readyForCompilation=Vire.isModuleLoaded();
  }

  async compile(): Promise<void> {
    // this.console_output="Vire Version 3\n(WARNING: This is an early prototype, errors are not shown in the console as of now)\n___\n> Compiling Code...\n";
    this.console_output="> Compiling Code\n";
    await this.initiateCompilation();

    Vire.ResetAPI(this.getEditorContent(), "wasm32");
    await Vire.CompileSourceCode();
    
    if(!Vire.is_compiled)
    {
      this.console_output+="> Could not compile code. Errors will be displayed here in further updates\n";
      return;
    }

    await console.log(Vire.getCompiledIR());
    let m=await Vire.InstantiateCompiledOutput();

    this.console_output+="> Compiled to WASM, Calling main function...\n";
    const main_=m.instance.exports['_main'] as CallableFunction;

    let def_log=console.log.bind(console);
    let consoleLogCapture: Array<any> = [];
    console.log = function () {
      consoleLogCapture.push(Array.from(arguments));
    };

    main_();

    console.log=def_log;
    this.console_output+="\n"
    for(let i of consoleLogCapture)
    {
      this.console_output+=(String(i[0]))+"\n";
    }
  }
}
