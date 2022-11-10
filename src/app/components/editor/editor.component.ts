import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';

import { Cons, Observable } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';

import * as ace from "ace-builds"

import './vire-js/vire'
import { compileSourceCodeFromAPI, instantiateOutputFromAPI, loadMainModule, moduleIsLoaded, resetModule, setSourceCode, setWASMPath } from './vire-js/vire';
import { setPath } from './vire-js/vire-emcc';
import { Console } from 'console';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {
  pre_code: string="extern puti(n: int) returns int;\n\nfunc main() returns int\n{\n\tputi(42);\n}\n";
  console_output: string="";
  old_console_log=window.console.log;
  
  readyForCompilation: boolean=false;

  @ViewChild("editor") private editor: ElementRef<HTMLElement> = {} as ElementRef;

  aceEditor: ace.Ace.Editor = {} as ace.Ace.Editor;

  constructor(private http: HttpClient) {  }

  ngOnInit(): void {
    setWASMPath("/assets/");
    this.console_output="Click on the this Console to compiled your Code";
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

  async initiateCompilation(): Promise<void> {
    if(!moduleIsLoaded())
    {
      await loadMainModule(this.getEditorContent(), "wasm32", async()=>{
        setSourceCode(this.getEditorContent());
        this.readyForCompilation=moduleIsLoaded();
      });
    }

    this.readyForCompilation=moduleIsLoaded();
  }

  async compile(): Promise<void> {
    this.console_output="Vire Version 3\n(WARNING: This is an early prototype, errors are not shown in the console as of now)\n___\nCompiling Code...\n";
    await this.initiateCompilation();
    resetModule();

    await compileSourceCodeFromAPI();
    let m=await instantiateOutputFromAPI();
    
    this.console_output+="Compiled to WASM, Calling main function...\n";
    const main_=m.instance.exports['main'] as CallableFunction;

    let def_log=console.log.bind(console);

    let consoleLogCapture: Array<any> = [];
    console.log = function () {
      consoleLogCapture.push(Array.from(arguments));
    };

    main_();

    console.log=def_log;
    
    this.console_output+="Output: \n\n"
    for(let i of consoleLogCapture)
    {
      this.console_output+=(String(i[0]))+"\n";
    }
  }
}
