import createGlobalModule from "./VIRELANG";
import { setPath as setPathJS } from "./VIRELANG";

export async function instantiateGlobalModule()
{
    return await createGlobalModule();
}

export function setPath(path)
{
    setPathJS(path);
}