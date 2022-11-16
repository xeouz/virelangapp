import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';

import { CompileSourceCode, getCompiledIR, InstantiateCompiledOutput, is_compiled, LoadMainModule, isModuleLoaded, ResetAPI, Module} from './vire-js/vire';
import { WasmFetchService } from 'src/app/services/wasm-fetch.service';
import { SetWASMPath } from './vire-js/vire-emcc';
import { cache_db, WasmBinary } from './vire-js/cache-db'

import * as ace from "ace-builds";
import 'brace';
import 'brace/ext/language_tools';

import { liveQuery } from 'dexie';
import { gunzip } from 'zlib';

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
  wasm_url: string = "";
  wasm_db: IDBOpenDBRequest = {} as IDBOpenDBRequest;

  @ViewChild("editor") private editor: ElementRef<HTMLElement> = {} as ElementRef;

  aceEditor: ace.Ace.Editor = {} as ace.Ace.Editor;

  constructor(private fetch_service: WasmFetchService) {  }

  ngOnInit() {
    SetWASMPath('/');
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
    })
  }

  getEditorContent(): string {
    return this.aceEditor.getValue();
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // WebAssembly Loading and Compilation
  async initiateCompilation(): Promise<void> {
    if(!isModuleLoaded())
    {
      // Try to load from IndexedDB Cache
      await cache_db.wasm_cache_table.clear();
      let cnt=await cache_db.wasm_cache_table.count();
      
      let wasm_bytes: ArrayBuffer={} as ArrayBuffer;
      let wasm_url: string="";
      if(cnt==0)
      {
        // Fetch from Firebase Storage
        this.console_output+="> Fetching the Compiler from Firebase\n"
        let wasm_bytes_zipped=await this.fetch_service.downloadURL("VIRELANG.wasm.gz");

        gunzip(wasm_bytes_zipped, (errs, buff:ArrayBuffer)=>{
          wasm_bytes=buff;
        });

        await cache_db.wasm_cache_table.clear();
        await cache_db.wasm_cache_table.put({
          bin: wasm_bytes,
        });
      }
      else
      {
        let fetch_req=await cache_db.wasm_cache_table.get(0);
        wasm_bytes=fetch_req!.bin;
      }

      let blob=new Blob([wasm_bytes]);
      wasm_url=URL.createObjectURL(blob);
      console.log(wasm_url);

      SetWASMPath(wasm_url);

      if(cnt==0)
      {
        cache_db.wasm_cache_table.put({
          bin: await this.fetch_service.downloadURL("VIRELANG.wasm.gz"),
        });
      }

      await LoadMainModule(this.getEditorContent(), "wasm32", async()=>{
        this.readyForCompilation=isModuleLoaded();
      });
    }

    this.readyForCompilation=isModuleLoaded();
  }

  async compile(): Promise<void> {
    // this.console_output="Vire Version 3\n(WARNING: This is an early prototype, errors are not shown in the console as of now)\n___\n> Compiling Code...\n";
    this.console_output="> Compiling Code\n";
    await this.initiateCompilation();

    ResetAPI(this.getEditorContent(), "wasm32");
    await CompileSourceCode();
    
    if(!is_compiled)
    {
      this.console_output+="> Could not compile code. Errors will be displayed here in further updates\n";
      return;
    }

    let m=await InstantiateCompiledOutput();

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
