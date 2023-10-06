import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

import {ResourcestringService} from '../app/services/resourcestring.service';
import {ModalService} from '../app/services/modal.service';


declare const _: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {

  constructor(
    
    private router : Router,
    private resourceStringService : ResourcestringService,
    private modalService: ModalService,
    ) 
    { 
    }

  
    ngOnInit() { 
      this.routeScanScreen(); 
    } 
    async routeScanScreen() 
    { 
      this.modalService.showProgressAlert('','');
      try { 
        await this.resourceStringService.loadResources(); 
        this.router.navigate(['scanScreen']); 
        this.modalService.closeAllModals();
      } 
      catch (error) 
      { 
        
      } 
    } 
       
  }
  

  


