import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';


import { compileSourceCodeFromAPI, getLLVMIROutput, getModule, instantiateOutputFromAPI, isCompiled, loadMainModule, moduleIsLoaded, resetAPI, resetModule, setModule, setWASMPath } from './vire-js/vire';
import { WasmFetchService } from 'src/app/services/wasm-fetch.service';
import { setPath } from './vire-js/vire-emcc';
import * as ace from "ace-builds";

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {
  pre_code: string="extern puti(n: int) returns int;\n\nfunc main() returns int\n{\n\tputi(42);\n}\n";
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
    setPath('/');
    this.console_output="Click on the this Console to compile your Code";
  }

  ngAfterViewInit(): void {
    ace.config.set("fontSize", "14px");
    ace.config.set('basePath', 'https://unpkg.com/ace-builds@1.4.12/src-noconflict');

    this.aceEditor = ace.edit(this.editor.nativeElement);
    this.aceEditor.session.setValue(this.pre_code);

    this.aceEditor.setTheme('ace/theme/tomorrow_night');
  }

  getEditorContent(): string {
    return this.aceEditor.getValue();
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // WebAssembly Loading and Compilation
  async initiateCompilation(): Promise<void> {
    if(!moduleIsLoaded())
    {
      this.console_output+="> Fetching the Compiler from Firebase\n"
      let wasm_url=await this.fetch_service.getURL("VIRELANG.wasm");
      setPath(wasm_url);

      await loadMainModule(this.getEditorContent(), "wasm32", async()=>{
        this.readyForCompilation=moduleIsLoaded();
      });
    }

    this.readyForCompilation=moduleIsLoaded();
  }

  async compile(): Promise<void> {
    // this.console_output="Vire Version 3\n(WARNING: This is an early prototype, errors are not shown in the console as of now)\n___\n> Compiling Code...\n";
    this.console_output="> Compiling Code\n";
    await this.initiateCompilation();

    resetAPI(this.getEditorContent(), "wasm32");
    await compileSourceCodeFromAPI();
    
    if(!isCompiled())
    {
      this.console_output+="> Could not compile code. Errors will be displayed here in further updates\n";
      return;
    }

    let m=await instantiateOutputFromAPI();
    
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
