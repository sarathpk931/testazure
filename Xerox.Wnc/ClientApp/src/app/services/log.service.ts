/**
 * This sevice contains functions used to log traces and exception to azure environment
 * 
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AngularPlugin } from '@microsoft/applicationinsights-angularplugin-js';
import { ApplicationInsights, IExceptionTelemetry, DistributedTracingModes, Exception } from '@microsoft/applicationinsights-web';
import { Router, NavigationEnd } from '@angular/router';
import {filter} from 'rxjs/operators';
import { StorageService } from '../services/storage.service';
import {environment} from '../../environments/environment';



@Injectable({
  providedIn: 'root'
})
export class LogService {

  private storageProvider: Storage;
  private appInsights: ApplicationInsights
  env = environment;

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
    private router: Router
  )
  {
     this.appInsights = new ApplicationInsights({
      config: {
        instrumentationKey: this.env.appInsights.instrumentationKey,
        enableAutoRouteTracking: true
      },
    });
    
    this.appInsights.loadAppInsights();
    this.appInsights.trackPageView();
    this.loadCustomTelemetryProperties(); 
    this.createRouterSubscription();
    this.storageProvider = this.storageService.getLocalStorage(true);
  }


// expose methods that can be used in components and services

  private loadCustomTelemetryProperties() {
    this.appInsights.addTelemetryInitializer(envelope => {
      var item = envelope.baseData;
      item.properties = item.properties || {};
      item.properties["ApplicationPlatform"] = "Web";
      item.properties["ApplicationName"] = "ApplicationName";
    });
  }

  private createRouterSubscription() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      this.logPageView(null, event.urlAfterRedirects);
    });
  }

  logPageView(name?: string, uri?: string) {
    this.appInsights.trackPageView({
      name,
      uri
    });
  }

  trackEvent(name: string): void {
    this.appInsights.trackEvent({ name });
  }

  trackTrace(message: string): void {
    this.appInsights.trackTrace({ message });
  }

  trackException(exception: IExceptionTelemetry) { 
    this.appInsights.trackException(exception);
  } 

  public logMsg(message: string, logType?: string): void {

    const config = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': 'ED803572-7B6B-4E56-8DCB-9F9C22C679FA'
      })
    };

      const deviceID = this.storageProvider.getItem('deviceId');

      const argParms = {
        LogMessage: message,
        LogType: logType || LogTypes.Information,
        DeviceID: deviceID
      };

      this.http.post(this.env.deviceUrl+':5155/api/log', argParms, config).subscribe();
    }
  
  }

export const LogTypes = {
  Information: 'information',
  Error: 'error',
  Warning: 'warning'
};

