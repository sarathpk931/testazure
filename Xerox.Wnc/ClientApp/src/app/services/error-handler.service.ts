/**
 * This sevice contains functions for showing specific alerts for errors occuring during scan
 * 
 */
import { Injectable } from '@angular/core';
import { ModalService } from './modal.service';
import { MatDialog } from '@angular/material/dialog';
import { GeneralAlertComponent } from '../views/general-alert/general-alert.component';
import { AlertBannerComponent } from '../views/alert-banner/alert-banner.component';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  constructor(private modalService: ModalService,private dialog: MatDialog) { }

  parseError(errorSDEName: string): void {
    var localizedString = errorSDEName;
    if (localizedString == null || localizedString.length == 0) {
      localizedString = errorSDEName;
    }
    
    this.modalService.showAlert(AlertBannerComponent,'', localizedString);
  }

  showErrorAlert(
    sdeTitle: string,
    sdeAdditionalInfo: string,
    button1Callback: any,
    button2Callback: any
  ): void {
    this.modalService.closeAllModals();

    const data = {
      title: sdeTitle,
      additionalInfo: sdeAdditionalInfo,
      button1Callback:button1Callback,
      button2Callback:button2Callback
    };
    this.modalService.openComponentModal(GeneralAlertComponent, data);
  }

  // FMEA Methods
  DEVICE_EIP_SCANV2_SERVICES_DISABLED(): void {
    this.showErrorAlert(
      'SDE_TO_USE_APP',
      'SDE_SCAN_EXTENSION_SCAN1',
      null,
      null
    );
  }

  DEVICE_NETWORK_ERROR(): void {
    this.showErrorAlert(
      'SDE_WRITTEN_NOTE_CONVERSION7',
      'SDE_CHECK_DEVICES_NETWORK',
      null,
      null
    );
  }

  // TODO: Update this with a real string
  XBB_DEVICE_EIP_INTERNAL_ERROR_SCAN(): void {
    this.showErrorAlert(
      'SDE_XBB_DEVICE_EIP_INTERNAL_ERROR_SCAN',
      '',
      null,
      null
    );
  }

  DEVICE_EIP_INTERNAL_ERROR_TIMEOUT(): void {
    this.showErrorAlert(
      'SDE_JOB_TIMED_OUT',
      'SDE_PLEASE_TRY_AGAIN1',
      null,
      null
    );
  }

  CLOUD_APP_GENERAL_ERROR(): void {
    this.showErrorAlert(
      'SDE_WRITTEN_NOTE_CONVERSION6',
      'SDE_PLEASE_TRY_AGAIN1',
      null,
      null
    );
  }

  INPUT_SCAN_SIZE_NOT_DETERMINED(): void {
    this.showErrorAlert(
      'SDE_INPUT_SCAN_SIZE',
      'SDE_PLEASE_TRY_AGAIN1',
      null,
      null
    );
  }

  /* exitApp(): void {
    $rootScope.$broadcast('globalAppMessage', 'Exit');  //method to be implemented , rootscope not yet defined in Angular yet 
  } */

  SDE_JOB_CANCELED1(): void {
    this.showErrorAlert(
      'SDE_JOB_CANCELED1',
      'SDE_PLEASE_TRY_AGAIN1',
      null,
      null
    );
  }

  wncWasReset(): void {
    this.showErrorAlert('SDE_WRITTEN_NOTE_CONVERSION5', '', null, null);
  }

  /* MP3_OUT_OF_CREDIT(): void {
    this.showErrorAlert(
      'SDE_HAVE_USED_ALL',
      'SDE_GO_XEROX_APP',
      null,
      null
    ).result.then(() => {
      if (typeof ExitCUIMode === 'function') {  //method to be implemented, not sure if required for WNC
        ExitCUIMode();
      } else {
        window.location.reload();
      }
    });
  } */

  APP_UNAVAILABLE_AT_THIS_TIME(): void {
    const data = {
      title: 'SDE_WRITTEN_NOTE_CONVERSION8',
      additionalInfo: 'SDE_PLEASE_TRY_AGAIN2',
      additionalInfo2: 'SDE_IF_PROBLEM_PERSISTS3'
    };
    
    const dialogRef = this.dialog.open(GeneralAlertComponent, {
      data,
      disableClose: true
    });

    
    dialogRef.afterClosed().subscribe(result => {
      window.location.reload();
    });
  }
  

  ADMIN_ACCOUNT_ALREADY_EXISTS() {
    this.showErrorAlert('SDE_WRITTEN_NOTE_CONVERSION8', 'SDE_PLEASE_USE_DIFFERENT',null,null);
  }

  ADMIN_ACCOUNT_CREATED(emailAddress: string, callback?: () => void) {
    const data = {
      title: 'SDE_ADMINISTRATOR_ACCOUNT_CREATED',
      additionalInfo: 'SDE_EMAIL_SENT_FOLLOWING',
      additionalInfo2: emailAddress,
      button1Callback: callback
    };
    return this.modalService.openComponentModal(GeneralAlertComponent, data);
  }
  
  PASSWORD_RESET(callback?: () => void) {
    const data = {
      title: 'SDE_PASSWORD_RESET_INSTRUCTIONS1',
      additionalInfo: 'SDE_IF_DO_NOT8',
      button1Callback: callback
    };
    return this.modalService.openComponentModal(GeneralAlertComponent, data);
  }

  CONFIRM_LOGOUT(confirmCallback?: () => void,cancelCallback?: () => void) {
    const data = {
      title: 'SDE_PASSWORD_RESET_INSTRUCTIONS1',
      button1Callback : cancelCallback,
      button2Callback : confirmCallback,
      button1Text : 'SDE_CANCEL',
      button2Text : 'SDE_LOG_OUT',
      button1Glyph : 'xrx-close',
      button2Glyph : 'xrx-exit',
    };
    return this.modalService.openComponentModal(GeneralAlertComponent, data);
  }

  // End of FMEA Methods
  
}
