/**
 * Scan Screen Component
 *
 * Description: This component is used to get the input values such as email, file name and other scan related values
 *
 * Usage:
 * <app-scan-screen></app-scan-screen>
 *
 * Inputs:
 * - email: to which email scanned file has to be send.
 * - filename: By default Xerox scan will be the file name. If any file name given in this field then that will be the file name in email.
 * 
 *
 * Outputs:
 * - Scanned file will be sent as an attachment to the specified email id.
 *
 */

import { Component,ViewChild,ElementRef,Renderer2, OnInit,HostListener,EventEmitter  } from '@angular/core';
import { FormBuilder, FormGroup, Validators,AbstractControl, ValidationErrors } from '@angular/forms';
//scan-screen.component.ts

import {MatDialog,MatDialogRef,DialogPosition} from '@angular/material/dialog';

import {FeaturePopoverComponent} from '../feature-popover/feature-popover.component';
import { PrivacyPolicyComponent} from '../privacy-policy/privacy-policy.component';

import { ModalService} from '../../services/modal.service';
import { ScanOptionsService} from '../../services/scan-options.service';
import { ScanService } from '../../services/scan.service';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { LogService } from '../../services/log.service';
import { ResourcestringService} from '../../services/resourcestring.service';

import { FileFormat, FileFormatOption,resourceString,Strings,selectedNote,AppSetting} from '../../model/global';

import {xrxScanV2GetInterfaceVersion} from '../../../assets/Xrx/XRXScanV2';
import {xrxJobMgmtGetInterfaceVersion} from '../../../assets/Xrx/XRXJobManagement';
import {xrxTemplateGetInterfaceVersion} from '../../../assets/Xrx/XRXTemplate';
import {xrxDeviceConfigGetInterfaceVersion} from '../../../assets/Xrx/XRXDeviceConfig';

import {AppModule} from '../../app.module';
import { ScrollingModule  } from '@angular/cdk/scrolling';
import { EditableFieldDirective } from  '../../Directives/editable-file-name.directive';

declare function keyboardClose() :any;

@Component({
  selector: 'app-scan-screen',
  templateUrl: './scan-screen.component.html',
  styleUrls: ['./scan-screen.component.less'],
  
})
export class ScanScreenComponent implements OnInit{

 
  @ViewChild('button') button: ElementRef;
  @ViewChild('inputField') inputField: ElementRef;
  @ViewChild('inputTextField') inputTextField: ElementRef;
  @HostListener('window:resize', ['$event'])

  winHeight: number;
  winWidth: number;
  midHeight:number;
  midwidth:number;

  noteConvertorForm:  FormGroup;

  //constants for pop up
   const_fileFormat : string = "fileFormat";
   const_type : string = "type";
   const_size : string = 'size';

   anyFileFormat = {from : 'fileFormat'};
   anyType = {from : 'type'};
   anySize = {from : 'size'};

   //pop up related variables
  matDialogRef: MatDialogRef<any>;
  selectedFileFormat : FileFormat;
  selectedFileFormatOptions : FileFormatOption;
  selectedType : FileFormat;
  selectedTypeOptions : FileFormatOption;
  selectedSize : FileFormat;
  selectedSizeOptions : FileFormatOption;

  //device information
  generation = AppModule.Generation;
  model = AppModule.model;

  //formgroup for validation
  selectedNote : selectedNote;

  //resourcestrings used in html
  emailPlaceHolder : string;
  xeroxTitle : string;
  scanTitle : string;
  resetTitle : string;
  privacyStatementTitle : string;
  emailValidation1 : string;
  emailValidation2 : string;
  resourceString : resourceString[];

  fileName: string = '';
  resFilename :string;
  fileextension:string;
  resfilenametemp:string;
  btnGlyph : string = '<span id="_glyph" class="xrx-paperclip" style="line-height: 100%;"></span>&nbsp&nbsp';

  isbuttonVisible : boolean = true;
  preventDirectiveInit : boolean = false;

  isEmailInvalid : boolean = false;
  isEmailRequired : boolean =false;

  commonRightMarginForPopup: number = 57
  progress: MatDialogRef<any>;

  constructor(
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private modalService : ModalService,
    private scanOptionService : ScanOptionsService,
    private scanService :ScanService,
    private  logger: LogService,
    private resourceStringService : ResourcestringService,
    private errorHandlerService : ErrorHandlerService,
    private elementRef: ElementRef,
    private renderer: Renderer2
    ) {
      
      this.winHeight = window.innerHeight;
      this.winWidth = window.innerWidth;
    }

    ngOnInit(){

        //load resourcestring and assign to variables
        this.resfilenametemp= '{0} [Date & Time].{1}';
        this.resourceStringService.loadResources().then(response=>{
        this.resFilename=response.SDE_XEROX_SCAN.toString();
        this.fileextension="docx";
        this.resfilenametemp=response.SDE_FMTSTR_DATE_TIMEFMTSTR.toString();
        
        this.emailPlaceHolder = response.SDE_ENTER_EMAIL_RECEIVE1;
        this.xeroxTitle = response.SDE_WRITTEN_NOTE_CONVERSION4;
        this.scanTitle = response.SDE_SCAN;
        this.resetTitle = response.SDE_RESET;
        this.privacyStatementTitle = response.SDE_XEROX_PRIVACY_STATEMENT;
        this.emailValidation1 = response.SDE_EMAIL_NOT_VALID;
        this.emailValidation2 = response.SDE_REQUIRED_FIELD1;
      }).catch(error=>{
        console.error(' cannot load resource strings');
      });
    
      this.resourceString = this.resourceStringService.getObjStrings();
  
      this.createForm();

      this.getDefaultValues();
      
      //observables to show selected values
      this.scanOptionService.selectedFileFormatC.subscribe(object =>{
        if(object){
          this.selectedFileFormatOptions = object;
          const newFileName = this.selectedFileFormatOptions.value.toString();
          this.fileName=  this.formatfilename(this.resFilename,newFileName,this.resfilenametemp);   
        }
      })

      this.scanOptionService.selectedTypeC.subscribe(type =>{
        if(type){
          this.selectedTypeOptions = type;
        }
      })

      this.scanOptionService.selectedSizeC.subscribe(size =>{
        if(size){
          this.selectedSizeOptions = size;
        }
      })

  }

  emailTextClick(event) {
    if (this.inputTextField.nativeElement.value != null && this.inputTextField.nativeElement.value != "" && this.inputTextField.nativeElement.value != undefined)
      this.inputTextField.nativeElement.select();
  }

    onResize(event: any) {
      this.winHeight = window.innerHeight;
      this.winWidth = window.innerWidth;
    }
    
    formatfilename(fileName: string, fileExtension: string,resfilename:string): string{
      const template = resfilename.replace('{0}', fileName).replace('{1}', fileExtension);
      return template;
    }
    //get default values selected
    getDefaultValues(){
      this.selectedFileFormat = this.scanOptionService.getFileFormat(this.anyFileFormat);
      this.selectedFileFormatOptions = this.selectedFileFormat.options.find(item => item.isDefault === true);
      this.selectedType = this.scanOptionService.getFileFormat(this.anyType);
      this.selectedTypeOptions = this.selectedType.options.find(item => item.isDefault === true);
      this.selectedSize = this.scanOptionService.getFileFormat(this.anySize);
      this.selectedSizeOptions = this.selectedSize.options.find(item => item.isDefault === true);
      this.scanOptionService.selectedFileFormat.next(this.selectedFileFormatOptions);
      this.scanOptionService.selectedType.next(this.selectedTypeOptions);
      this.scanOptionService.selectedSize.next(this.selectedSizeOptions);
    }

    //form group creation
    createForm(){
        this.noteConvertorForm = this.formBuilder.group({
          email:['',[Validators.required,this.emailFormatValidator]],
          fileName: [this.resFilename]
        },
      );

      if(AppModule.email !== ''){
        this.noteConvertorForm.controls["email"].setValue(AppModule.email.toString());
      }
    }

    //email validation
    emailFormatValidator(control: AbstractControl): ValidationErrors | null { 
      const email: string = control.value; 
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; 
      if (email && !emailRegex.test(email)) { 
        return { invalidEmailFormat: true }; 
      } return null; 
    }
    //email control blur event
    onEmailBlur(){
  
      const emailControl = this.f.email;
      this.isEmailRequired = emailControl.hasError('required') && emailControl.touched;
      this.isEmailInvalid = emailControl.hasError('email') && emailControl.touched;
    }
  
    //get each controls
    get f():{[key: string]: AbstractControl}{
        return this.noteConvertorForm.controls;
    }

    //when we click the reset button
  resetForm() {
    this.noteConvertorForm.reset();
    this.noteConvertorForm.patchValue({
      email:'',
      fileName: this.resFilename
    });
    this.fileName = this.resFilename;
    this.inputField.nativeElement.value = this.resFilename;
    this.button.nativeElement.innerHTML = this.btnGlyph + this.formatfilename(this.resFilename,this.fileextension,this.resfilenametemp);
    this.scanOptionService.isPlaceholderVisible = true;
    this.getDefaultValues();
    this.errorHandlerService.wncWasReset();
    this.inputTextField.nativeElement.classList.add('showPlaceHolder');
    this.inputTextField.nativeElement.classList.remove('hiddenPlaceHolder');
  }
    
    //show privacy statement
    showPrivacyStatement(){
      this.modalService.openLargeModal(PrivacyPolicyComponent);
    }

    openFileFormat(event: any){
      this.modalService.disableLinks();
      let popupWidth =276;
      let popupHeight=221;
      this.midwidth=this.winWidth / 2;
      let event_position: DialogPosition;
      let xForRightArrow:number;
      let showLeftArrow = false;
      let showRightArrow = true;
      if (event.clientX < this.midwidth) {
        event_position = { left: event.clientX + 'px', top: (event.clientY - 111) + 'px'};
       }
      else {
        xForRightArrow = window.innerWidth - event.clientX;
        event_position= { right: `${xForRightArrow}px`, top: (event.clientY - 111) + 'px'};
       }
      let direction:string ='rtl';
      this.modalService.setData({
        from : this.const_fileFormat
      });
      this.modalService.openModal(FeaturePopoverComponent,event_position, {x: event.clientX, y:event.clientY, showLeftArrow, showRightArrow, xForRightArrow});
    }

    openScan(event: any){
      this.modalService.disableLinks();
      let popupWidth =276;
      let popupHeight=221;
      this.midwidth=this.winWidth / 2;
      let rotationClass: string = '';
      let event_position: DialogPosition; 
      let xForRightArrow:number;
      let showLeftArrow = false;
      let showRightArrow = false;

      if (event.clientX < this.midwidth) {
       event_position = { left: event.clientX + 'px', top: (event.clientY - 111) + 'px'};
       showLeftArrow = true;
      }
      else {
        showRightArrow = true;
        xForRightArrow = window.innerWidth - event.clientX;
         event_position= { right: `${xForRightArrow}px`, top: (event.clientY - 111) + 'px'};
        }
      this.modalService.setData({
        from : this.const_type
      });

      this.modalService.openModal(FeaturePopoverComponent,event_position, {x: event.clientX, y:event.clientY, showLeftArrow, showRightArrow, xForRightArrow});
    }

  openSize(event: any) {
    this.modalService.disableLinks();
    let popupWidth = 236;
    let popupHeight = 469;
    this.midwidth = this.winWidth / 2;
    this.midHeight = this.winHeight / 2;
    //const popupTop = this.winHeight - event.clientY;
    let popupTop = "";
    let event_position: DialogPosition;
    let xForRightArrow: number;
    let showLeftArrow = false;
    let showRightArrow = false;
    if (this.winHeight > event.clientY) {
      popupTop = (this.winHeight - event.clientY) / 2 + 'px'
    } else {
      popupTop = '0px'
    }

    if (event.clientX < this.midwidth) {
      event_position = { left: event.clientX + 'px', top: '5px', bottom: '5px' };
      showLeftArrow = true;
    }
    else {
      showRightArrow = true;
      xForRightArrow = window.innerWidth - event.clientX;
      event_position = { right: `${xForRightArrow}px`, top: '5px', bottom: '5px' };
    }
    let direction: string = 'rtl'; 
    this.modalService.setData({
      from: this.const_size
    });
    this.modalService.openModal(FeaturePopoverComponent, event_position, { x: event.clientX, y: event.clientY, showLeftArrow, showRightArrow, xForRightArrow });
  }

  onKeyDown(event: KeyboardEvent) {

    const keyCode = event.keyCode || event.which;

    if (keyCode === 13) { // 13 represents the Enter key code
      event.preventDefault();
      event.stopPropagation();

      // Blur all input fields
      this.blurInputFields();
      keyboardClose(); 
      const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
      if (activeElement) {
        activeElement.blur();
      }
    }
  }

    blurInputFields() {

      // Use the Renderer2 to trigger the blur event on the input fields
      this.renderer.selectRootElement(this.inputField.nativeElement).blur();
      this.renderer.selectRootElement(this.inputTextField.nativeElement).blur();

    }
    
// scan functionalities 

scan() {
  //this.logger.trackTrace("ctrl.scan ...");
   this.mainDeviceconfig();
};

 mainDeviceconfig() {
  //this.logger.trackTrace("mainDeviceconfig()...");
  const regex = /^[^\\\/\:\*\?\"\<\>\|]+$/;

  this.fileName =  this.noteConvertorForm.controls["fileName"].value == '' ? this.resFilename : this.noteConvertorForm.controls["fileName"].value;
  if (regex.test(this.fileName)) {
    //this.logger.trackTrace("mainDeviceconfig() -> if (regex.test(fileName))");
    xrxDeviceConfigGetInterfaceVersion(AppSetting.url, this.deviceCallbackSuccess.bind(this), this.deviceCallBackFailure.bind(this), null, true);
  } else {
    //this.logger.trackTrace("mainDeviceconfig() ELSE FOR if (regex.test(fileName))");
    const text = this.resourceString['SDE_CHARACTERS_CANNOT_BE'].replace('{0}', '\\ / : * ? " < > |');
    this.errorHandlerService.showErrorAlert(text, '', null, null);
  }
}

deviceCallbackSuccess() {
  //this.logger.trackTrace("DeviceCallBack_Success -> respText:");
  this.getScanStatus();
}

 deviceCallBackFailure(respText, newresp) {
  //this.logger.trackTrace("DeviceCallBack_Failure -> respText:' + respText + ' newresp:' + newresp");
  //this.errorHandlerService.XBB_DEVICE_EIP_DEVICE_CONFIG_DISABLED();
   this.progress.close();
}

getScanStatus() {
  //this.logger.trackTrace("getScanStatus()...");
  xrxScanV2GetInterfaceVersion(AppSetting.url, 
    this.callback_success.bind(this), 
    this.callback_failure.bind(this), 
    null, true);
  
}
callback_success(reqText, respText) {
  //this.logger.trackTrace("getScanStatus() -> callback_success");
  this.getjobmamt();
}
callback_failure(respText, newresp) {
  //this.logger.trackTrace('callback_failure -> respText:' + respText + ' newresp:' + newresp);
  this.errorHandlerService.DEVICE_EIP_SCANV2_SERVICES_DISABLED();
  this.progress.close();
}

 getjobmamt() {
  //this.logger.trackTrace('getjobmanagementInterfaceVersion()...');
  xrxJobMgmtGetInterfaceVersion(AppSetting.url, this.Jobcallback_success.bind(this), this.Jobcallback_failure.bind(this), null, true);
}

Jobcallback_success(reqText, respText) {
  //this.logger.trackTrace('Jobcallback_success()...');
  this.CheckTemplate();
}
Jobcallback_failure(reqText, respText) {
  //this.logger.trackTrace('Jobcallback_failure -> reqText:' + reqText + ' respText:' + respText);
  this.errorHandlerService.DEVICE_EIP_SCANV2_SERVICES_DISABLED();
  this.progress.close();
}

CheckTemplate() {
  xrxTemplateGetInterfaceVersion(AppSetting.url, this.Templatecallback_success.bind(this), this.Templatecallback_failure.bind(this), null, true);
}

Templatecallback_success() {
  //this.logger.trackTrace('Templatecallback_success()...');
  this.selectedNote={
    fileFormat : this.selectedFileFormatOptions,
    size : this.selectedSizeOptions,
    type : this.selectedTypeOptions,
    fileName : this.noteConvertorForm.controls["fileName"].value == null ? this.resFilename : this.noteConvertorForm.controls["fileName"].value,//this.fileNameSpan.nativeElement.textContent
    email :  this.noteConvertorForm.controls["email"].value
  }
  //this.logger.trackTrace('Templatecallback_success() file name before:' + this.selectedNote.fileName);
  var values = this.scanOptionService.getValues(this.selectedNote);

  //this.logger.trackTrace('Templatecallback_success() values:' + values.fileName);

  // '##############################################################################'
  // '####################              SCAN       #################################'
  // '##############################################################################'

  this.scanService.scan(values).then((res) => {
    this.progress.close();
  });
}

 Templatecallback_failure(respText, newresp) {
  this.logger.trackTrace('Templatecallback_failure -> respText:' + respText + ' newresp:' + newresp);
  this.errorHandlerService.DEVICE_EIP_SCANV2_SERVICES_DISABLED();
}

}
