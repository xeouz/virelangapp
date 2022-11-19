import Dexie, { Table } from 'dexie';

export interface WasmBinary
{
    id?: number,
    bin: ArrayBuffer,
    time_upload: string,
}

export class CacheDB extends Dexie
{
    wasm_cache_table!: Table<WasmBinary>;

    constructor()
    {
        super("CachedDatabase");

        this.version(1).stores({
            wasm_cache_table: '++id, bin, time_upload',
        })
    }
}

export const cache_db: CacheDB = new CacheDB();