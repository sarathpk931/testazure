/**
 * Feature pop over Component
 *
 * Description: This component is used to show the 3 pop ups - file format, scan and size
 *
 * Usage:
 * <app-feature-popover></app-feature-popover>
 *
 *
 * Outputs:
 * - A pop up will be shown with file format / scan/ size details.
 *
 */

import { Component, OnInit,Input, Output,EventEmitter,ChangeDetectorRef } from '@angular/core';
import {  MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { ElementRef, Renderer2, Inject  } from '@angular/core';
import { ScanOptionsService} from '../../services/scan-options.service';
import { ModalService} from '../../services/modal.service';
import { ResourcestringService} from '../../services/resourcestring.service';
import { DialogDataObject, FileFormat, FileFormatOption,resourceString} from '../../model/global';

@Component({
  selector: 'app-feature-popover',
  templateUrl: './feature-popover.component.html',
  styleUrls: ['./feature-popover.component.less']
})
export class FeaturePopoverComponent implements OnInit {

    fileFormat : FileFormat;
    fileFormatOption : FileFormatOption[];
    from : any;
    resourceString : resourceString[];
    scrollBarsFixed = false;

    @Output() objectSelected = new EventEmitter<any>();
    @Input() feature: any;
    @Input() event: MouseEvent;

    const_fileFormat : string = "fileFormat";
    const_type : string = "type";
    const_size : string = 'size';
    anyFileFormat = {from : 'fileFormat'};
    anyType = {from : 'type'};
    anySize = {from : 'size'};

    selectedFileFormat : FileFormat;
    selectedType : FileFormat;
    selectedSize : FileFormat;
    selectedFileFormatOption: FileFormatOption;
    selectedTypeOption: FileFormatOption;
    selectedSizeOption: FileFormatOption; 
    selectedOption : FileFormatOption;
    showLeftArrow: boolean = true;
    showRightArrow: boolean = false;
    testStyle: string = "";

    constructor(
                private scanOptionsService : ScanOptionsService, 
                private modalService : ModalService,
                private resourceStringService : ResourcestringService,
                public mtModalRef : MatDialogRef<any>,
                private elementRef: ElementRef,
                private renderer: Renderer2,
                private changeDetectorRef: ChangeDetectorRef,
                @Inject(MAT_DIALOG_DATA) public data : DialogDataObject
              )
              {}

    ngOnInit(){
      this.resourceString = this.resourceStringService.getObjStrings();
      this.testStyle = this.data.additionalInfo;

      this.modalService.currentValue.subscribe((data) =>{
        this.from = data;
      });
      this.fileFormat = this.scanOptionsService.getFileFormat(this.from);
      this.fileFormatOption = this.fileFormat.options;

      if(this.from.from == this.const_fileFormat)
      {
        this.selectedFileFormat = this.scanOptionsService.getFileFormat(this.anyFileFormat);
        this.selectedFileFormatOption = this.selectedFileFormat.options.find(item => item.isDefault === true);
      }
      else if (this.from.from == this.const_type){
        this.selectedType = this.scanOptionsService.getFileFormat(this.anyType);
       this.selectedTypeOption = this.selectedType.options.find(item => item.isDefault === true);
      }
      else if (this.from.from == this.const_size){
        this.selectedSize = this.scanOptionsService.getFileFormat(this.anySize);
        this.selectedSizeOption = this.selectedSize.options.find(item => item.isDefault === true);
      }
      
      this.scanOptionsService.selectedFileFormatC.subscribe(object =>{
        if(object){
          this.selectedFileFormatOption = object;
          
        }
      })

      this.scanOptionsService.selectedTypeC.subscribe(type =>{
        if(type){
          this.selectedTypeOption = type;
        }
      })

      this.scanOptionsService.selectedSizeC.subscribe(size =>{
        if(size){
          this.selectedSizeOption = size;
        }
      })
    }

    ngAfterViewInit(): void {
      this.changeDetectorRef.detectChanges(); // Trigger change detection
  
      setTimeout(() => {
        this.modalService.emitViewVisible(); // Call the emitViewVisible method after a delay
      });
    }

    //default selection
    getNgClass(option: any): any{

      if(this.from.from == this.const_fileFormat)
        {
          return { selected : option === this.selectedFileFormatOption };
        }
        else if (this.from.from == this.const_type){
          return { selected : option === this.selectedTypeOption };
        }
        else if (this.from.from == this.const_size){
          return { selected : option === this.selectedSizeOption};
        }
      return ;
    }

    //when an option is selected
    selectOption(option : any){
      this.selectOption = option;
      this.scanOptionsService.setSelectedOption(option,this.from);
      this.objectSelected.emit(option);
      
      document.querySelectorAll("#modal_arrow").forEach(e => e.parentNode.removeChild(e));
      document.querySelector('.cdk-overlay-backdrop-showing').classList.add('cdk-overlay-backdrop-hide');
      this.closeModal();
    }

    closeModal():void{
      this.modalService.closeModal(this.mtModalRef);
      this.modalService.removeArrow();
    }
    
}
