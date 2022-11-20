let createGlobalModuleJS;
let setPathJS;

export async function dynamicallyImportJS(file_url="./VIRELANG.js")
{
    const mod = await import(/* webpackIgnore: true */ file_url);
    createGlobalModuleJS=mod.default;
    setPathJS=mod.setPath;
}

export async function instantiateGlobalModule()
{
    return await createGlobalModuleJS();
}

export function SetWASMPath(path)
{
    setPathJS(path);
}