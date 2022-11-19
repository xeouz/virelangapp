import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';

import { getBytes, getDownloadURL, getMetadata, getStorage, ref, StorageReference } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class WasmFetchService {
  gs_ref: StorageReference = {} as StorageReference
  gs_ref_init: boolean = false
  gs_ref_filename: string = "";

  constructor(private store: AngularFireStorage) { }

  private async getInternal(file_name: string): Promise<void>
  {
    if(this.gs_ref_init && this.gs_ref_filename==file_name)
      return;

    const storage=getStorage();
    this.gs_ref=ref(storage, 'vire-wasm/'+file_name);
    this.gs_ref_init=true;
    this.gs_ref_filename=file_name;
  }

  async getURL(file_name: string = "VIRELANG.wasm"): Promise<string>
  {
    this.getInternal(file_name);
    let url=await getDownloadURL(this.gs_ref);

    return url;
  }

  async getTimeOfUpload(file_name: string = "VIRELANG.wasm"): Promise<string>
  {
    this.getInternal(file_name);

    let metadata=await getMetadata(this.gs_ref);
    return metadata.timeCreated;
  }

  async downloadURL(file_name: string = "VIRELANG.wasm"): Promise<ArrayBuffer>
  {
    this.getInternal(file_name);
    let bytes=await getBytes(this.gs_ref);

    return bytes;
  }
}