import Dexie, { Table } from 'dexie';

export interface WasmBinary
{
    id?: number,
    bin: ArrayBuffer,
}

export class CacheDB extends Dexie
{
    wasm_cache_table!: Table<WasmBinary>;

    constructor()
    {
        super("CachedDatabase");

        this.version(1).stores({
            wasm_cache_table: '++id, bin',
        })
    }
}

export const cache_db: CacheDB = new CacheDB();