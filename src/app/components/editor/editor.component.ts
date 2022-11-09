import { Component, OnInit } from '@angular/core';

import { loadMainModule, compileSourceCodeFromAPI, instantiateOutputFromAPI, setSourceCode, getLLVMIROutput } from './vire-js/vire'

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {
  pre_code: string="func main() returns int{}";
  console_output: string="";

  constructor() {  }

  ngOnInit(): void {

  }

  log(event:any, txt:string) {
    console.log('ace event', event, txt);
  }
}
