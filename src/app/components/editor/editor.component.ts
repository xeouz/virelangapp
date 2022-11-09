import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';

import * as ace from "ace-builds"

import { loadMainModule, compileSourceCodeFromAPI, instantiateOutputFromAPI, setSourceCode, getLLVMIROutput } from './vire-js/vire'

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {
  pre_code: string="extern puti(n: int) returns int;\n\nfunc main() returns int\n{\n\tputi(42);\n}\n";
  console_output: string="";

  @ViewChild("editor") private editor: ElementRef<HTMLElement> = {} as ElementRef;

  aceEditor: ace.Ace.Editor = {} as ace.Ace.Editor;

  constructor() {  }

  ngOnInit(): void {
    
  }

  ngAfterViewInit(): void {
    ace.config.set("fontSize", "14px");
    ace.config.set('basePath', 'https://unpkg.com/ace-builds@1.4.12/src-noconflict');

    this.aceEditor = ace.edit(this.editor.nativeElement);
    this.aceEditor.session.setValue(this.pre_code);

    this.aceEditor.setTheme('ace/theme/tomorrow_night');
  }

  compile(): void {
    
  }
}
