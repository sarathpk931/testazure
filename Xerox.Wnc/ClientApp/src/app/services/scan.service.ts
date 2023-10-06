/**
 * This sevice contains functions used for scan functionality
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError ,Subject} from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatDialogRef } from '@angular/material/dialog';

import { ScanOptionsService } from '../../app/services/scan-options.service';
import { JobService } from './job.service';
import { ModalService } from '../../app/services/modal.service';
import { LogService } from './log.service';
import { ErrorHandlerService } from '../../app/services/error-handler.service';
import { ScanTemplateService } from '../../app/services/scan-template.service';
import { ResourcestringService} from '../services/resourcestring.service';

import {xrxTemplatePutTemplate,xrxTemplateDeleteTemplate}  from  '../../assets/Xrx/XRXTemplate';
import {xrxStringToDom,xrxGetElementValue} from '../../assets/Xrx/XRXXmlHandler';
import {xrxScanV2InitiateScanJobWithTemplate,xrxScanV2ParseInitiateScanJobWithTemplate} from '../../assets/Xrx/XRXScanV2';
import {xrxJobMgmtGetJobDetails,xrxJobMgmtParseGetJobDetails,xrxJobMgmtParseJobStateReasons} from '../../assets/Xrx/XRXJobManagement';
import {xrxParseJobStateReasons} from '../../assets/Xrx/XRX_EIPWSHelpers';

import {environment} from '../../environments/environment';
import {AppModule} from '../../app/app.module';
import {scanTemplate} from '../../app/model/scantemplate.model';

import {BasicAlertComponent} from '../views/basic-alert/basic-alert.component';
import { resourceString} from '../model/global';


@Injectable({
  providedIn: 'root'
})
export class ScanService {

  private startScanTime: Date | null = null;
  private stopScanTime: Date | null = null;
  private timeoutInMinutes = 1;
  
  isScanning: boolean = false;
  isComplete: boolean = false;
  progress: MatDialogRef<any>;

  env = environment;
  scanTemplate : scanTemplate;

  resourceString : resourceString[];

  private printerUrl = this.env.deviceUrl;//127.0.0.1
  private sessionUrl = 'http://127.0.0.1';//http://localhost

  private jobStateSubject  = new Subject<any>();
  jobStateSubjectSuccess = this.jobStateSubject.asObservable();

  isVersaLink : boolean = AppModule.isVersalink;
  isAltaLink : boolean = AppModule.isAltalink;

  private completeScanPromise: any = null;
  private jobid: any = null;
  promiseResolve : any;
  promiseReject : any;
  
  constructor(
    
    private http: HttpClient,
    private modalService: ModalService,
    private scanOptionsService: ScanOptionsService,
    private scanTemplateService: ScanTemplateService,
    private logService: LogService,
    private jobService: JobService,
    private errorHandlerService: ErrorHandlerService,
    private resourceStringService : ResourcestringService, 
  ) {
    this.resourceString = this.resourceStringService.getObjStrings();
  }

 broadcastJobState (jobId : string, state :string, reason : string){
  this.jobStateSubject.next({jobId,state,reason});
 }

  public callbacks = {
    handleScanException: (message: string) => {
      this.callbacks.completeScan({ error: true, message: message });
    },
    handleJobCanceled: () => {
      this.callbacks.completeScan({ error: true, message: 'canceled' });
    },
    handleJobAbortedBySystem: () => {
      this.callbacks.completeScan({ message: 'Scan Job Aborted By System' });
    },
    handleInputSizeNotDetermined: () => {
      this.callbacks.completeScan({ error: true, message: 'Input size not determined' });
    },
    handleJobComplete: () => {
      this.callbacks.completeScan({ message: 'complete' });
    },
    handleFinishPutTemplateError: () => {
      this.callbacks.completeScan({ error: true, message: 'Error sending template to device' });
    },
    handleBeginCheckFailure: (request: any, response: any) => {
      this.logService.trackException(response);
      this.logService.trackException(request);
      this.callbacks.completeScan({ error: true, deviceDetails: response });
    },
    handlePutTemplateFailure: (message: string) => {
      this.callbacks.completeScan({ error: true, deviceDetails: message });
    },
    completeScan: (detail: any) => {
      this.logService.trackException(detail);
      this.isScanning = false;
      this.isComplete = true;
      if (detail.error) {
        this.promiseReject(detail);
        this.progress.close();
      } else {
        this.promiseResolve(detail);
        this.progress.close();
      }
    }
  };



  public isExistingEmail(email: string): Observable<any> {
    const config = {
      headers: {
        'Content-Type': 'text/json; charset=utf-8',
        Authorization: 'ED803572-7B6B-4E56-8DCB-9F9C22C679FA'
      }
    };

    return this.http
      .get(`api/IsExistingEmail?email=${email}`, config)
      .pipe(catchError((error) => throwError(error)));
  }



  public scan(model): Promise<void> {
      this.progress = this.modalService.showProgressAlert(this.resourceString['SDE_SCANNING1'], '');
      //this.logService.trackTrace('service.scan');
      if (this.isScanning) {
        //this.logService.trackTrace('service.scan -> isScanning : Please wait!!!!');
        throw this.resourceString['SDE_PLEASE_WAIT_UNTIL'];
      }

      this.jobid = this.jobService.generateNewJobID();
      //this.logService.trackTrace('scanService => scan => jobID:' + this.jobid);

      model.jobid = this.jobid;
      this.scanTemplate = this.scanTemplateService.scanTemplate(model);
      
  
      return this.jobService.registerJob(model).then((result)=>{      
     
          const tStr = this.scanTemplateService.objToString();
          //this.logService.trackTrace('scanService => scan => template:' + tStr);
          this.isScanning = true;
          this.isComplete = false;
          this.completeScanPromise = new Promise((resolve, reject) => {
          this.promiseResolve = resolve;
          this.promiseReject = reject;

            //this.logService.trackTrace('service.scan -> calling putTemplate()');
            this.putTemplate(tStr).then(data => {
              this.promiseResolve(data);
            })
            .catch(error => {
              this.promiseReject(error);
            })
          });
          
          

         return  this.completeScanPromise;
      });
    };
  
    putTemplate(tStr): Promise<any> {
      return  new Promise((resolve,reject)=>{
      //this.logService.trackTrace('putTemplate()...');
      const printerUrl =  this.env.apiUrl;
      const templateName= this.scanTemplate.name; //templateName
      //this.logService.trackTrace("file name in scan Template :"+this.scanTemplate.name)
      function finish (callId: any, response: any) {
        //this.logService.trackTrace('putTemplate => successCallback');
        //this.logService.trackTrace(`scanService => putTemplate => callId:${callId} response:${response}`);
        this.finishPutTemplate(callId, response,printerUrl,200);
        const result={};
        resolve (result);
      };
      function fail  (result: any)  {
        this.logService.trackException(result);
        this.modalService.closeAllModals();
        this.errorHandlerService.APP_UNAVAILABLE_AT_THIS_TIME();
        reject(result);
      };
        xrxTemplatePutTemplate(
          printerUrl,
          templateName,
          tStr,
          finish.bind(this),
          fail.bind(this),
          200
        );
      });
    }
  
   
     finishPutTemplate(callId: any, response: string, printerUrl: string,  timeoutInMinutes: number):Promise<any>{
      return new Promise((resolve,reject)=>{
        //this.logService.trackTrace(`finishPutTemplate(callId,response) -> callId: ${callId} response: ${response}`);
        const xmlDoc = xrxStringToDom(response);
        //this.logService.trackTrace(`finishPutTemplate(callId,response) -> xmlDoc: ${xmlDoc}`);
        this.scanTemplate.checkSum = xrxGetElementValue(xmlDoc, 'TemplateChecksum');
       async  function successCallback  (envelope: any, response: any)  {
          //this.logService.trackTrace(`function finish(callId, response) -> callId: ${callId} response: ${response}`);
          let responseJobId : string = xrxScanV2ParseInitiateScanJobWithTemplate(response);
          //this.logService.trackTrace("response job Id : "+ responseJobId);
          this.scanTemplate.jobId = responseJobId;
          //this.logService.trackTrace("response scan template job Id : "+ this.scanTemplate.jobId);
          // Let everyone know the job has been submitted.
        // Begin the check loop.
          const startScanTime = new Date();
          const stopScanTime = new Date();
          stopScanTime.setMinutes(stopScanTime.getMinutes() + timeoutInMinutes);       
         await this.beginCheckLoop(this.scanTemplate.jobId);
        };
        function errorCallback  (env: any,message :any)  {
          this.logService.trackTrace(`function fail(env, message) {  -> env: ${env} message: ${message}`);
          this.callbacks.handleFinishPutTemplateError();
           this.errorHandlerService.CLOUD_APP_GENERAL_ERROR(); 

        };
        xrxScanV2InitiateScanJobWithTemplate(
        printerUrl,
        this.scanTemplate.name,
        false,
        null,
        successCallback.bind(this),
        errorCallback.bind(this)
        );
      });
  }

  checkScanTimeout(): boolean {
    if (this.startScanTime !== null && this.stopScanTime !== null) {
      return (
        this.stopScanTime.getMinutes() >= this.startScanTime.getMinutes() &&
        this.stopScanTime.getSeconds() > this.startScanTime.getSeconds()
      );
    }
    return false;
  }

  beginCheckLoop(jobid:string): Promise<any> { 
    if (this.isComplete) { return Promise.resolve(jobid); } 
    //this.logService.trackTrace('beginCheckLoop()...');
    return new Promise((resolve,reject)=>{
      
      function checkLoop(request: any, response: any)  {
        //this.logService.trackTrace('checkLoop(request, response) -> request:' + request + ' response:' + response);
        let jobStateReason = '';
        let info = xrxJobMgmtParseGetJobDetails(response);
        //this.logService.trackTrace("inside checkLoop => info  : "+info);
        let jobState = xrxGetElementValue(info, 'JobState');
        //this.logService.trackTrace("inside checkLoop => jobState : "+jobState)
        const dummy = xrxJobMgmtParseJobStateReasons(response);
          //this.logService.trackTrace('checkLoop(request, response) -> jobState:' + jobState + ' dummy:' + dummy);
        if (jobState === null || jobState === 'Completed') {
          //this.logService.trackTrace('if (jobState === null || jobState === Completed)');
          jobStateReason = xrxParseJobStateReasons(response);
          //this.logService.trackTrace('jobStateReason:' + jobStateReason);
        }
      
      
        this.broadcastJobState('jobStatusCheckSuccess',jobState,jobStateReason);
      
        // Update the status of the template.
        this.scanTemplate.status = {
          lastJobState: jobState,
          lastJobStateReason: jobStateReason
        };

        // Checking if the job should be flagged as timeout
        if (this.checkScanTimeout()) {
          //this.logService.trackTrace('if (checkScanTimeout()) { ');
          this.template.jobState = 'Completed';
          jobStateReason = 'JobAborted';
          this.callbacks.handleJobAbortedBySystem();
          setTimeout(()=>{
            this.deleteScanTemplate();
          },500
          );
          this.errorHandlerService.DEVICE_EIP_INTERNAL_ERROR_TIMEOUT();
          return;
        }
        if(this.isVersaLink){
          this.broadcastJobState('jobProgress', 'Exit');
        }
      
        if (jobState === 'Completed' && jobStateReason === 'JobCompletedSuccessfully') {
          this.modalService.closeAllModals();
      
          const title = 'SDE_DOCUMENT_SUCCESSFULLY_SCANNED'; 
          const msg = 'SDE_WILL_RECEIVE_EMAIL2';
          this.modalService.openModalWithTitle(BasicAlertComponent,title,msg);
      
          //this.logService.trackTrace('if (jobState === Completed && jobStateReason == JobCompletedSuccessfully) { ');
          this.broadcastJobState('jobProgress', 'JOB_COMPLETED_SUCCESSFULLY',jobStateReason);
        }
      
        if (jobState === 'Completed' && jobStateReason === 'InputScanSizeNotDetermined') {
          //this.logService.trackTrace('if (jobState === Completed && jobStateReason === InputScanSizeNotDetermined) {  jobState:' + jobState + ' jobStateReason:' + jobStateReason);
          this.errorHandlerService.INPUT_SCAN_SIZE_NOT_DETERMINED();
          this.callbacks.handleInputSizeNotDetermined();
          setTimeout(()=>{
            this.deleteScanTemplate();
          },500
          );
          return;
        }
      
        // if (jobState === 'Completed' && jobStateReason === 'None') {
        //   // do nothing
        // } else if (jobState === 'Completed' && jobStateReason && jobStateReason != 'JobCompletedSuccessfully') {
        //   this.logService.trackTrace('if (jobState === Completed && jobStateReason && jobStateReason != JobCompletedSuccessfully) {');
        //   this.broadcastJobState('jobProgress', 'Completed',jobStateReason);
        //   this.modalService.closeAllModals();
        //   this.errorHandlerService.APP_UNAVAILABLE_AT_THIS_TIME();
        //   return;
        // } else {
        //   this.logService.trackTrace('jobProgress:' + jobState);
        //   this.broadcastJobState('jobProgress', jobState,jobStateReason);
        // }
      
        if (jobState === 'Completed' && jobStateReason == 'JobCompletedSuccessfully') {
          setTimeout(()=>{
            this.callbacks.handleJobComplete();
          },500
          );
          setTimeout(()=>{
            this.deleteScanTemplate();
          },500
          );
          return;
          }
      
          else if (jobState === 'Completed' && (jobStateReason === 'JobAborted' || jobStateReason === 'AbortBySystem')) {
            this.logService.trackTrace('else if (jobState === Completed && (jobStateReason === JobAborted || jobStateReason === AbortBySystem)) {')
            this.errorHandlerService.SDE_JOB_CANCELED1();
            this.callbacks.handleJobAbortedBySystem();
            setTimeout(()=>{
              this.deleteScanTemplate();
            },500
            );
          }
          
          else if (jobState === 'Completed' && (jobStateReason === 'JobCanceledByUser' || jobStateReason === 'CancelByUser')) {
            this.logService.trackTrace('else if (jobState === Completed && (jobStateReason === JobCanceledByUser || jobStateReason === CancelByUser)) {');
            this.errorHandlerService.SDE_JOB_CANCELED1();
            this.callbacks.handleJobCanceled();
            setTimeout(()=>{
              this.deleteScanTemplate();
            },500
            );
          }
      
          else if (jobState === 'ProcessingStopped' && (jobStateReason === 'NextOriginalWait' || jobStateReason === '')) {
            this.logService.trackTrace('else if ProcessingStopped NextOriginalWait');
            setTimeout(()=>{
              this.beginCheckLoop(jobid);
            },2000
            );
          }
          else if (!(jobState === 'Completed' && jobStateReason === "None") && (jobState === 'Completed' || jobState === 'ProcessingStopped')) {
            this.logService.trackTrace('else if Completed ProcessingStopped');
            setTimeout(()=>{
              this.callbacks.handleJobComplete();
            },500
            );
            setTimeout(()=>{
              this.deleteScanTemplate();
            },500
            );
          }
          else if (jobState === null && jobStateReason === 'JobCanceledByUser') {
            this.logService.trackTrace('else if JobCanceledBUser');
            this.broadcastJobState('jobProgress', jobState,jobStateReason);
            this.callbacks.handleJobCanceled();
            setTimeout(()=>{
              this.deleteScanTemplate();
            },500
            );
            this.errorHandlerService.SDE_JOB_CANCELED1();
          }
          else if (jobState === null && jobStateReason !== '') {
            this.logService.trackTrace('else if (jobState === null && jobStateReason !== ) {  jobStateReason:');
            this.errorHandlerService.SDE_JOB_CANCELED1();
            this.callbacks.handleScanException(jobStateReason);
            setTimeout(()=>{
              this.deleteScanTemplate();
            },500
            );
          }
          else {
            setTimeout(()=>{
              this.logService.trackTrace("inside checkloop -> else case ->"+jobid);
              this.beginCheckLoop(jobid);
            },500
            );
      
          }
        }

        xrxJobMgmtGetJobDetails(
          this.sessionUrl,
          'WorkflowScanning',
          jobid,
          checkLoop.bind(this),
          this.callbacks.handleBeginCheckFailure.bind(this),
          5000,
          true
        );
    });
    
  
  }

  

  deleteScanTemplate():void {
    // We can delete the template by checksum if we have it.
    if (this.scanTemplate.checkSum) {

      xrxTemplateDeleteTemplate(this.printerUrl, this.scanTemplate.name, this.scanTemplate.checkSum, 
         this.success,
         this.failure
        );
    }
  }

  success(message:any){
  }

  failure(message:any){
  }
}

