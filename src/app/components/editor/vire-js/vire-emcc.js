import createGlobalModule from "./VIRELANG";
import { SetWASMPath as SetWASMPathJS } from "./VIRELANG";

export async function instantiateGlobalModule()
{
    return await createGlobalModule();
}

export function SetWASMPath(path)
{
    SetWASMPathJS(path);
}