import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';

import { getBytes, getDownloadURL, getStorage, ref } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class WasmFetchService {
  constructor(private store: AngularFireStorage) { }

  async getURL(file_name: string = "VIRELANG.wasm"): Promise<string>
  {
    const storage=getStorage();
    const gs_ref=ref(storage, 'vire-wasm/'+file_name);
    let url=await getDownloadURL(gs_ref);

    return url;
  }

  async downloadURL(file_name: string = "VIRELANG.wasm"): Promise<ArrayBuffer>
  {
    const storage=getStorage();
    const gs_ref=ref(storage, 'vire-wasm/'+file_name);
    let bytes=await getBytes(gs_ref);

    return bytes;
  }
}