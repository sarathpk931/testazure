/**
 * App Module
 *
 * Description: This module is the root module of the application. It imports and configures
 * the necessary modules and sets up the main components and services.
 *
 * Imports:
 * - APP_INITIALIZER: A multi-provider token used in Angular to initialize an application before it is bootstrapped.
 * - BrowserModule: Required module for running the application in a browser environment.
 * - FormsModule, ReactiveFormsModule: Module for enabling two-way data binding and form handling.
 * - HttpClientModule: Module for making HTTP requests and handling responses.
 * - NgModule - A decorator function used to define an Angular module, which consolidates and organizes 
 *        related components, directives, pipes, and services.
 * - ErrorHandler - An interface that allows you to define custom error handling logic in Angular applications.
 * - ApplicationinsightsAngularpluginErrorService - A service provided by the Application Insights Angular Plugin that handles error tracking 
 *            and reporting for Angular applications.
 *  - BrowserAnimationsModule - This module provides support for animating components and elements in Angular applications. 
 *    It enables the use of Angular's built-in animations system.
 * - MatDialogModule and MatDialogRef : These modules provide functionality for displaying and managing dialog windows in Angular applications 
 *        using the Angular Material library.
 *
 * Declarations:
 * - AppComponent: The main component of the application.
 *
 * Providers:
 * - DataService: Service for managing data and communication with the backend.
 *
 * Bootstrap:
 * - AppComponent: The root component that gets bootstrapped when the application starts.
 */
import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule, ErrorHandler } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ApplicationinsightsAngularpluginErrorService } from '@microsoft/applicationinsights-angularplugin-js';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

//services
import { LogService } from '../app/services/log.service';
import { StorageService } from '../app/services/storage.service';
import { ScanOptionsService } from '../app/services/scan-options.service';
import { ErrorHandlerService } from '../app/services/error-handler.service';
import { JobService } from '../app//services/job.service';
import { ApiService } from '../app/services/api.service';
import { ConfigurationService } from '../app/services/configuration.service';
import { ScanService } from './services/scan.service';
import { ScanTemplateService } from './services/scan-template.service';
import { ResourcestringService } from './services/resourcestring.service';
import { ModalService } from './services/modal.service';

//components
import { PrivacyPolicyComponent } from './views/privacy-policy/privacy-policy.component';
import { ProgressAlertComponent } from './views/progress-alert/progress-alert.component';
import { FeaturePopoverComponent } from './views/feature-popover/feature-popover.component';
import { AlertBannerComponent } from './views/alert-banner/alert-banner.component';
import { BasicAlertComponent } from './views/basic-alert/basic-alert.component';
import { GeneralAlertComponent } from './views/general-alert/general-alert.component';
import { ScanScreenComponent } from './views/scan-screen/scan-screen.component';

//pipes
import { TranslatePipe } from './filters/translate.pipe';

//xerox javascript libraries
import { xrxDeviceConfigGetDeviceInformation } from '../assets/Xrx/XRXDeviceConfig';
import { xrxStringToDom } from '../assets/Xrx/XRXXmlHandler';
import { xrxSessionGetSessionInfo, xrxSessionParseGetSessionInfo } from '../assets/Xrx/XRXSession';
import { xrxGetElementValue } from '../assets/Xrx/XRXXmlHandler';

import * as _ from 'lodash';
import { environment } from '../environments/environment';

//Directives
import { EditableFieldDirective } from './Directives/editable-file-name.directive';
import { NgScrollableDirective } from './Directives/ng-scrollable.directive';
import { ActionBarDirective } from './Directives/action-bar.directive';
import { TextFieldDirective } from './Directives/text-field.directive';
import { XasStringDirective } from '../app/Directives/xas-string.directive';
import { XasPlaceholderDirective } from './Directives/xas-placeholder.directive';

import { ScrollingModule } from '@angular/cdk/scrolling';


@NgModule({
  declarations: [
    AppComponent,
    NgScrollableDirective,
    ScanScreenComponent,
    PrivacyPolicyComponent,
    ProgressAlertComponent,
    FeaturePopoverComponent,
    GeneralAlertComponent,
    BasicAlertComponent,
    AlertBannerComponent,
    ActionBarDirective,
    TextFieldDirective,
    XasStringDirective,
    EditableFieldDirective,
    XasPlaceholderDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    ScrollingModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: () => Device,
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: () => Session,
      multi: true,
    },
    {
      provide: ErrorHandler,
      useClass: ApplicationinsightsAngularpluginErrorService,
    },

    TranslatePipe,
    AppComponent,
  ],

  bootstrap: [AppComponent]
})
export class AppModule {
  public static Generation: any;
  public static model: string;
  public static deviceId: string;
  public static isThirdGenBrowser: boolean;
  public static isVersalink: boolean;
  public static isAltalink: boolean;
  public static email: string;
}

//get logged in user information
export async function Session(url: string, timeout: number, async: boolean, ldap: string): Promise<any> {
  return new Promise((resolve, reject) => {
    function successCallbackSession(envelope: string, response: string) {
      var data = xrxSessionParseGetSessionInfo(response);

      var userEmail = "";
      if (data.firstChild !== null) {
        var userName = xrxGetElementValue(data.firstChild, "username");

        if (userName !== null && userName.toLowerCase() !== 'guest')
          userEmail = xrxGetElementValue(data.firstChild, "from");
        if (userEmail == null) {
          AppModule.email = ''
          resolve('');
        }
        else {
          const result = {

            email: userEmail
          };
          AppModule.email = result.email.toString();
          resolve(result.email.toString());
        }
      }
    };
    function errorCallbackSession(result: any) {
      result = {
        email: ""
      };
      AppModule.email = '';
      reject(result);
    };
    xrxSessionGetSessionInfo(
      url,
      successCallbackSession,
      errorCallbackSession,
      timeout,
      async,
      ldap
    );
  });
}

//get device information
export async function Device(url: string, timeout: number, async: boolean): Promise<any> {
  return new Promise((resolve, reject) => {
    function successCallback(envelope: any, response: any) {

      const doc = xrxStringToDom(response);
      const info = doc.querySelector("devcfg\\:Information, Information");
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(info.firstChild.data, 'text/xml');
      const generation = Number(xmlDoc.getElementsByTagName('generation')[0].textContent);
      AppModule.Generation = generation;

      const model = xmlDoc.getElementsByTagName('model')[0].textContent;
      AppModule.model = model.toString();
      const deviceId = xmlDoc.getElementsByTagName('serial')[0].textContent;
      AppModule.deviceId = deviceId.toString(); 
      const isVersalink = _.includes(model.toLowerCase(), 'versalink') || _.includes(model.toLowerCase(), 'primelink');
      const isAltalink = _.includes(model.toLowerCase(), 'altalink');
      const isThirdGenBrowser = _.includes(navigator.userAgent.toLowerCase(), "x3g_");
      AppModule.isThirdGenBrowser = isThirdGenBrowser;
      AppModule.isVersalink = isVersalink;
      AppModule.isAltalink = isAltalink;
      const result = {
        isThirdGenBrowser: isThirdGenBrowser,
        generation: generation,
        isVersalink: isVersalink,
        isAltalink: isAltalink,
        isEighthGen: generation < 9.0,
        model: model
      };

      resolve(result);
    };
    function errorCallback(result: any) {
      
      reject(result);
    };
    xrxDeviceConfigGetDeviceInformation(
      url,
      successCallback,
      errorCallback,
      timeout,
      async
    );
  })
};

