/**
 * Progress Alert Component
 *
 * Description: This component is used to show the progress bar
 *
 * Usage:
 * <app-progress-alert></app-progress-alert>
 *
 *
 * Outputs:
 * - A pop up will be shown with progress spinner.
 *
 */
import { Component,Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {DialogData} from '../../model/global';
import {AppModule} from '../../app.module';


@Component({
  selector: 'app-progress-alert',
  templateUrl: './progress-alert.component.html',
  styleUrls: ['./progress-alert.component.less']
})
export class ProgressAlertComponent {
  generation = AppModule.Generation;
  isThirdGenBrowser = AppModule.isThirdGenBrowser;

  constructor(
    public mtModalRef : MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data : DialogData
  )
  {}

  ngOnInit(){
    
  }
}
