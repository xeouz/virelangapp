import { instantiateGlobalModule, SetWASMPath } from "./vire-emcc"

export let Module: any;
export let GlobalVireAPI: any;
export let is_compiled: boolean = false;

const importObject:WebAssembly.Imports = {
    env:{
        putb: (n:number) => { console.log((n==0)?"false":"true") },
        puti: (n:number) => { console.log(n); },
        putf: (n:number) => { console.log(n); },
        putc: (n:number) => { console.log(String.fromCharCode(n)); },
        putd: (n:number) => { console.log(n); },
        __linear_memory:new WebAssembly.Memory({initial: 256, maximum:256}),
        __stack_pointer:new WebAssembly.Global({value: 'i32', mutable: true}, 1024),
        __indirect_function_table:new WebAssembly.Table({initial:2, element:'anyfunc'})
    }
}

export function isModuleLoaded(): boolean {
    if(typeof Module == "object")
    {
        return true;
    }
    else
    {
        return false;
    }
}
export function resetModule(): void {
    Module=undefined;
    is_compiled=false;
}
export function ResetAPI(source_code: string="", target_triple: string = "wasm32"): void {
    GlobalVireAPI=Module.VireAPI.loadFromText(source_code, target_triple);
    is_compiled=false;
}

export async function LoadMainModule(input_code:string = "", target_triple:string = "wasm32", _async_callback:Function = ()=>{},) {
    Module=await instantiateGlobalModule();
    GlobalVireAPI=Module.VireAPI.loadFromText(input_code, target_triple);

    await _async_callback();
}

export async function CompileSourceCode(): Promise<void> {
    let success: boolean;

    success=GlobalVireAPI.ParseSourceModule();
    if(!success)
    {
        return;
    }

    GlobalVireAPI.VerifySourceModule();

    if(!success)
    {
        return;
    }

    GlobalVireAPI.CompileSourceModule("", false);
    is_compiled=true;
}

export async function getCompiledIR(): Promise<string> {
    return GlobalVireAPI.getCompiledLLVMIR();
}

export async function InstantiateCompiledOutput() :Promise<WebAssembly.WebAssemblyInstantiatedSource> {
    let bin:any = GlobalVireAPI.getByteOutput();
    let arr:Uint8Array = new Uint8Array(bin.size());

    for(let i:number = 0; i<bin.size(); ++i)
    {
        arr[i] = bin.get(i);
    }

    let module=await WebAssembly.instantiate(arr, importObject);
    return module;
}