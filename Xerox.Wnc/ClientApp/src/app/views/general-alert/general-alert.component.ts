/**
 * General alert Component
 *
 * Description: This component is used to show general alerts from several pages
 *
 * Usage:
 * <app-general-alert></app-general-alert>
 *
 *
 * Outputs:
 * - A pop up will be shown as per the inputs provided.
 *
 */
import { Component,Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ModalService} from '../../services/modal.service';
import { ResourcestringService} from '../../services/resourcestring.service';

import {DialogDataObject,resourceString} from '../../model/global';


@Component({
  selector: 'app-general-alert',
  templateUrl: './general-alert.component.html',
  styleUrls: ['./general-alert.component.less']
})
export class GeneralAlertComponent {

  button1Classes : string;
  button2Classes : string;
  button1Text : string;
  button2Text : string;
  resourceString : resourceString[];

  constructor(
    private modalService : ModalService,
    public mtModalRef : MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data : DialogDataObject,
    private resourceStringService : ResourcestringService,
  )
  {}

  ngOnInit(){
    
    this.resourceString = this.resourceStringService.getObjStrings();
    this.button1Text = this.data.button1Text ? this.data.button1Text : 'SDE_CLOSE';
    this.button2Text = this.data.button2Text ? this.data.button2Text : 'SDE_CANCEL';
    this.button1Text = this.resourceString[this.button1Text];
    this.button2Text = this.resourceString[this.button2Text];
    if(this.data.button1Glyph){
        this.button1Classes = 'btn btn-medium btn-glyph-label btn-secondary-alert ' + this.data.button1Glyph;
    }
    else{
      this.button1Classes = 'btn btn-medium btn-glyph-label btn-secondary-alert xrx-close';
    }

    if(this.data.button2Glyph){
      this.button2Classes = 'btn btn-medium btn-glyph-label btn-secondary-alert ' + this.data.button2Glyph;
    }
    else{
      this.button2Classes = 'btn btn-medium btn-glyph-label btn-secondary-alert xrx-cancel';
    }
  }

  button1(){
    if(this.data.button1Callback != null){
      this.data.button1Callback();
    }

    this.closeModal();
  }

  button2(){
    if(this.data.button2Callback != null){
      this.data.button2Callback();
    }

    this.closeModal();
  }

  closeModal():void{
    this.modalService.closeModal(this.mtModalRef);
  }
}
