
/**
 * Privacy Policy Component
 *
 * Description: This component is used to show the privacy policy
 *
 * Usage:
 * <app-privacy-policy></app-privacy-policy>
 *
 *
 * Outputs:
 * - A pop up will be shown with privacy policy.
 *
 */
import { Component,OnInit,ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { MatDialogRef } from '@angular/material/dialog';

import { ModalService} from '../../services/modal.service';
import { ResourcestringService} from '../../services/resourcestring.service';
import { LogService } from '../../services/log.service';

import { environment } from '../../../environments/environment';
import { resourceString} from '../../model/global';
import { ProgressAlertComponent } from '../progress-alert/progress-alert.component';




@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.less']
})
export class PrivacyPolicyComponent implements OnInit {

  privacyPolicy: string = '';
  showVersion: string = '';
  env = environment;
  resourceString: resourceString[];


  constructor(
    private http: HttpClient,
    private modalService: ModalService,
    public modalRef: MatDialogRef<any>,
    private resourceStringService: ResourcestringService,
    private logService: LogService,
    private changeDetectorRef: ChangeDetectorRef,
    private progressAlert: MatDialogRef<any>,

  ) {

  }

  ngOnInit(): void {
    setTimeout(() => {
      this.progressAlert = this.modalService.openModalWithoutClose(ProgressAlertComponent, '', '');
      const url = this.env.privacyPolicyUrl;

      this.http.get(url,
        { responseType: 'text' })
        .subscribe({
          next: (response) => {
            this.privacyPolicy = (response as string);
            //this.showVersion = this.resourceString["VERSION"];

            this.progressAlert.close();
          },
          error: (error) => {
            this.logService.trackTrace("inside privacy policy error" + error);
            this.showVersion = 'v1.0'; //this.strings.VERSION
            this.progressAlert.close();
            //this.modalService.showGeneralError(error);
          }
        });
    }, 500);

  }

  ngAfterViewInit(): void {
    this.changeDetectorRef.detectChanges(); // Trigger change detection

    setTimeout(() => {
      this.modalService.emitViewVisible(); // Call the emitViewVisible method after a delay
    });
  }

  closeModal(): void {
    this.modalRef.close();
    this.progressAlert.close();
    this.modalService.closeModal(this.modalRef);
    //document.querySelector('.cdk-overlay-backdrop-showing').classList.add('cdk-overlay-backdrop-hide');

    //document.querySelector('.cdk-overlay-container').classList.remove('cdk-overlay-container');

  }


}

  


