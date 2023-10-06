/**
 * This sevice contains functions used to open components as a pop up 
 * 
 */
import { Injectable,EventEmitter  } from '@angular/core';
import {MatDialog,MatDialogRef,MatDialogConfig,DialogPosition,MAT_DIALOG_DATA} from '@angular/material/dialog';
import { BehaviorSubject,Subject, finalize, timer} from 'rxjs';
import { Overlay, OverlayPositionBuilder,NoopScrollStrategy  } from '@angular/cdk/overlay';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { ProgressAlertComponent} from '../views/progress-alert/progress-alert.component'; 
import {AppComponent} from '../app.component';
import {AppModule} from '../../app/app.module';


@Injectable({
  providedIn: 'root'
})
export class ModalService {
  deviceInformation:any;
  isThirdGenBrowser : boolean = AppModule.isThirdGenBrowser;

  private fromData = new BehaviorSubject<string>('');
  viewVisible: EventEmitter<void> = new EventEmitter<void>();
  currentValue = this.fromData.asObservable();
  arrIds: string[] = ["#btn_openFileFormat", "#btn_openScan", "#btn_openSize"];

  constructor(
    public dialog : MatDialog,
    public  app : AppComponent,
    private overlay: Overlay,
    private positionBuilder: OverlayPositionBuilder,
    private sanitizer : DomSanitizer 
    ) {}
  

    private centerDialog(dialogElement: HTMLElement): DialogPosition {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const dialogWidth = dialogElement.offsetWidth;
      const dialogHeight = dialogElement.offsetHeight;
    
      const topPosition = Math.max(0, (viewportHeight - dialogHeight) / 2);
      const leftPosition = Math.max(0, (viewportWidth - dialogWidth) / 2);
    
      return { top: topPosition + 'px', left: leftPosition + 'px' };
    }
    

  //function to show progress alert as a pop up
  showProgressAlert(title: string, message : string):MatDialogRef<ProgressAlertComponent>{
    this.dialog.closeAll();
    this.removeArrow();

    // Check if title is null or undefined and replace with an empty string if needed
    title = title !== null && title !== undefined ? title : '';
    // Check if message is null or undefined and replace with an empty string if needed
    message = message !== null && message !== undefined ? message : '';

    return this.dialog.open(ProgressAlertComponent, {
      data :{'title': title,'message':message},
      height: '100vh',
      width: '100vw',
      scrollStrategy: new NoopScrollStrategy()
    });
  }

  //function to close the passed reference of modal pop up
  closeModal(modalRef :MatDialogRef<any>){
    if(modalRef){
      modalRef.close();
    }
    this.removeArrow();
   }

   //function to open large pop up 
   public openLargeModal(component: any): void {
    const windowWidth = window.innerWidth;
    const popupWidth = 1023;
    const leftPosition = Math.max((windowWidth / 2) - (popupWidth / 2), 0) + 'px';
    const rightPosition = Math.max((windowWidth / 2) + (popupWidth / 2), windowWidth - popupWidth) + 'px';
  
    const dialogRef = this.dialog.open(component, {
      data: { closeBtnName: 'Close' },
      hasBackdrop: false,
      disableClose: true,
      minWidth: '100vw',
      position: {
        left: leftPosition,
        right: rightPosition,
      },
      //scrollStrategy: new NoopScrollStrategy()
    });
   
  }


  //function to open a pop up without a close button
  emitViewVisible(): void {
    this.viewVisible.emit();
  }

  public openModalWithoutClose(component : any,title: string,message : string)
  {
    this.removeArrow();

    // Check if title is null or undefined and replace with an empty string if needed
    title = title !== null && title !== undefined ? title : '';
    // Check if message is null or undefined and replace with an empty string if needed
    message = message !== null && message !== undefined ? message : '';

    return this.dialog.open(component, {
      data :{'title': title,'message':message},
      height: '100vh',
      width: '100vw',
      // position: {
      //   top: '',
      //   left: 'calc(50% - 512px)',
      // },    
    });

  }

  //set data to fromData
  setData(data:any){
    this.fromData.next(data);
  }
  
  public openModal(component : any,dialog_postion:any,  clickPosition:any){
    this.removeArrow();
    this.dialog.closeAll();
    this.dialog.openDialogs.pop();

    let dialogRef = this.dialog.open(component,{
      position: { ...dialog_postion, top: '100%' },
      panelClass: `custom-dialog-position`,
      data: { clickPosition, additionalInfo: `calc(${clickPosition.y}px - ${dialog_postion.top})`},
      //scrollStrategy:  new NoopScrollStrategy()
    });

    dialogRef.afterOpened().subscribe((result => {
      setTimeout(() => {
      const customDialogPosition : HTMLElement = document.querySelector(".custom-dialog-position");
      let horizontalPosition = '';
      if(dialog_postion.left) {
        horizontalPosition = `left: ${dialog_postion.left}`;
      } else if(dialog_postion.right) {
        horizontalPosition = `right: ${dialog_postion.right}`;
      }

      customDialogPosition.style.cssText = `margin: 0!important; top: ${dialog_postion.top};${horizontalPosition};`
    
      const arrowsSize = 20;
      const common_arrow_style = `
        position: absolute; 
        width: 0; 
        height: 0; 
        border-top: ${arrowsSize}px solid transparent; 
        border-bottom: ${arrowsSize}px solid transparent; 
        z-index: 1000; 
        top: ${clickPosition.y  - arrowsSize}px;
      `
      const modalArrow = document.createElement("div");
      const modalBoxShadow = 2;
      modalArrow.id = 'modal_arrow';
  
      if (clickPosition.showLeftArrow) {
        modalArrow.style.cssText += `
        ${common_arrow_style}
        border-right: ${arrowsSize}px solid #ddd;
        left: calc(${dialog_postion.left} - ${arrowsSize}px + ${modalBoxShadow}px);
      `;
      } else {
        modalArrow.style.cssText += `
        ${common_arrow_style}
        border-left: ${arrowsSize}px solid #ddd;
        right: calc(${clickPosition.xForRightArrow}px - ${arrowsSize}px + ${modalBoxShadow}px);
      `;
      }
  
      // const popupContainer = document.querySelector('.cdk-overlay-container');
      // popupContainer.appendChild(modalArrow);

      const popupContainer : HTMLElement = document.querySelector('.cdk-overlay-container');
      popupContainer.appendChild(modalArrow);
      popupContainer.style.position = 'fixed';
      },100);
    }));
   
    dialogRef.afterClosed()
    .pipe(finalize(() => {
      this.removeArrow();
      const timeout = setTimeout(() => {
        this.enableLinks();
        clearTimeout(timeout);
      }, 100);
      // alert('closed');
    }))
    .subscribe(data => {
      this.removeArrow();
    });

    return dialogRef;
  }
  
  //function to open a modal with title
  public openModalWithTitle(component : any,title: string,message : string){
    this.removeArrow();
    this.dialog.closeAll();

    // Check if title is null or undefined and replace with an empty string if needed
    title = title !== null && title !== undefined ? title : '';
    // Check if message is null or undefined and replace with an empty string if needed
    message = message !== null && message !== undefined ? message : '';

    this.dialog.openDialogs.pop();
    return  this.dialog.open(component, {
      data :{'title': title,'message':message},
      height: '100vh',
      width: '100vw',
    scrollStrategy: new NoopScrollStrategy()
    });

  }


  public showAlert(component : any,title: string,message : string)
  {
    // Check if title is null or undefined and replace with an empty string if needed
    title = title !== null && title !== undefined ? title : '';
    // Check if message is null or undefined and replace with an empty string if needed
    message = message !== null && message !== undefined ? message : '';

    this.removeArrow();
     this.dialog.open(component, {
      data :{'title': title,'message':message},
      position: {
        top: '',
        left: 'calc(50% - 512px)',
        
    },
    scrollStrategy: new NoopScrollStrategy()
    });
    timer(3000).subscribe(()=>{
      this.dialog.closeAll();
    })
  }

  //function to close all open modals
  public closeAllModals()
  {
    this.dialog.closeAll();
    this.removeArrow();
  }

  //function to open a pop up with some paramters 
  public openComponentModal(component: any,data:any)
  {
    this.removeArrow();
    this.dialog.closeAll();
    this.dialog.open(component, {
      data : data,
      height: '98%',
      width: '100vw',
      scrollStrategy: new NoopScrollStrategy()
      
    });
  }

  removeArrow() {
    if (document.querySelectorAll("#modal_arrow").length > 0) {
      document.querySelectorAll("#modal_arrow").forEach(e => e.parentNode.removeChild(e));
    }
  }

  
disableLinks() :void {
  this.arrIds.forEach(function (btnId) {
    const button : HTMLElement = document.querySelector(btnId);
    button.style.pointerEvents = 'none';
  });
} 

enableLinks() :void {
  this.arrIds.forEach(btnId => {
    const button : HTMLElement = document.querySelector(btnId);
    button.style.pointerEvents = 'auto';
  });
} 

}

    /* private disableLinks(): void {
      const links = document.getElementsByTagName('a');
      for (let i = 0; i < links.length; i++) {
        links[i].style.pointerEvents = 'none';
      }
    } */
