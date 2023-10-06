import { Injectable, SecurityContext } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { StorageService } from './storage.service';


import * as _ from 'lodash';


@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {
  private storageProvider = this.storageService.getLocalStorage(true);

  constructor(
    private location: Location, 
    private storageService: StorageService,
    private route: ActivatedRoute,
    private sanitizer : DomSanitizer
    ) {}

  parseUrlParams() {
    // function fullyDecode(urlParam: string) {
    //   let result = urlParam;
    //   while (result !== decodeURIComponent(result)) {
    //     result = decodeURIComponent(result);
    //   }
    //   return result;
    // }

    // const qs = this.sanitizer.sanitize(SecurityContext.HTML, window.location.search).toString();

    

    // if (!qs) { return this.route.queryParams.subscribe(); } //do with params like subscribe(params => {const userId = params['userId'];});

    // const result: any[] = [];
    // if (qs[0] === "?") {
    //   const params = qs.slice(1).split('&');
    //   for (let i = 0; i < params.length; i++) {
    //     const param = params[i].split('=');
    //     result.push(param[0]);
    //     result[param[0]] = fullyDecode(param[1]);
    //   }
    // }

    // return result;
  }

  getSetting(settingName: string) {
    // const params = this.parseUrlParams();
    // let setting = params[settingName];

    // if (setting) {
    //   this.cacheSetting(settingName, setting);
    // } else {
    //   setting = this.storageProvider.getItem(settingName);
    // }

    // return setting;
  }

  cacheSetting(settingName: string, setting: any) {
    this.storageProvider.setItem(settingName, setting);
  }

  clearQueryString() {
    this.route.queryParams.subscribe({}); 
  }
}
