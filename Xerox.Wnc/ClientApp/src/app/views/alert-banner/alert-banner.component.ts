/**
 * Alert Banner Component
 *
 * Description: This component is used to show alert messages
 *
 * Usage:
 * <app-privacy-policy></app-privacy-policy>
 *
 *
 * Outputs:
 * - A pop up will be shown with privacy policy.
 *
 */
import { Component,Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ModalService} from '../../services/modal.service';
import {DialogData} from '../../model/global';

@Component({
  selector: 'app-alert-banner',
  templateUrl: './alert-banner.component.html',
  styleUrls: ['./alert-banner.component.less']
})
export class AlertBannerComponent {

  constructor(
    private modalService : ModalService,
    public mtModalRef : MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data : DialogData
  )
  {}

  closeModal():void{
    this.modalService.closeModal(this.mtModalRef);
  }
}
