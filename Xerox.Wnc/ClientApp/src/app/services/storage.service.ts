import { Injectable } from '@angular/core';
import * as CryptoJS  from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private cryptoKey = 'QkQwQTEyNDUtQzhENy00RTc5LUJEMUMtNjI5REM4MTBDRERG';
  private encrypt(value: string): string {
    return CryptoJS.AES.encrypt(value, this.cryptoKey).toString();
  }

  private decrypt(value: string): string {
    if (value) {
      try {
        const decryptedBytes = CryptoJS.AES.decrypt(value, this.cryptoKey);
        return decryptedBytes.toString(CryptoJS.enc.Utf8);
      } catch (err) {
        return value;
      }
    }
    return value;
  }

  private provider(storageProviderName: string, useEncryption: boolean): any {
    const storageProvider = (storageProviderName === 'local') ? localStorage : sessionStorage;

    return {
      getItem: (key: string) => {
        const value = storageProvider.getItem(key);

        if (useEncryption) {
          return this.decrypt(value);
        } else {
          return value;
        }
      },
      setItem: (key: string, value: string) => {
        if (useEncryption) {
          storageProvider.setItem(key, this.encrypt(value));
        } else {
          storageProvider.setItem(key, value);
        }
      }
    };
  }

  getLocalStorage(useEncryption: boolean): any {
    return this.provider('local', useEncryption);
  }

  getSessionStorage(useEncryption: boolean): any {
    return this.provider('session', useEncryption);
  }

 
}
