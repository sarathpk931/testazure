import { Injectable } from '@angular/core';
import { ConfigurationService } from './configuration.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private url: string;
  private prefix: string;

  constructor(private configurationService: ConfigurationService) {
    //this.url = this.configurationService.getSetting('apiUrl');
    //this.prefix = this.configurationService.getSetting('apiPrefix');

   }

   public apiBaseUrl(): string {
    return this.url + this.getPrefix();
  }

  public apiUrl(fragment: string): string {
    return this.apiBaseUrl() + fragment;
  }

  public apiHost(): string {
    return this.url.replace('http://', '').replace('https://', '');
  }

  public getPrefix(): string {
    if (!this.prefix || this.prefix === 'null') {
      return '';
    }
    return this.prefix;
  }
}
