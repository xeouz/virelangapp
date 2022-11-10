import { Injectable } from '@angular/core';

import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from '@angular/fire/compat/storage'
import { getBytes, getDownloadURL, getStorage, ref } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class WasmFetchService {
  constructor(public afStorage: AngularFireStorage) { }

  async downloadWebAssembly(event: any)
  {
    const storage=getStorage();
    let bytes=await getBytes(ref(storage, 'vire-wasm/VIRELANG.wasm.gz'));


  }
}