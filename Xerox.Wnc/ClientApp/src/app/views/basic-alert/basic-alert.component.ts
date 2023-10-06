/**
 * Basic Alert Component
 *
 * Description: This component is used to show messages from several pages.
 *
 * Usage:
 * <app-basic-alert></app-basic-alert>
 *
 *
 * Outputs:
 * - A pop up will be shown with a message.
 *
 */
import { Component,Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ModalService} from '../../services/modal.service';
import { ResourcestringService} from '../../services/resourcestring.service';
import {DialogData,resourceString} from '../../model/global';

@Component({
  selector: 'app-basic-alert',
  templateUrl: './basic-alert.component.html',
  styleUrls: ['./basic-alert.component.less']
})


export class BasicAlertComponent {
  resourceString : resourceString[];
  title : string = "";
  message : string = "";

  constructor(
    private modalService : ModalService,
    public mtModalRef : MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data : DialogData,
    private resourceStringService : ResourcestringService,
  )
  {}

  ngOnInit(){
    this.resourceString = this.resourceStringService.getObjStrings();
    this.title = this.resourceString[this.data.title];
    this.message = this.resourceString[this.data.message];
    this.message = this.message.replace('{0}', 'Xerox Note Converter');
  }

  closeModal():void{
    this.modalService.closeModal(this.mtModalRef);
  }
}
