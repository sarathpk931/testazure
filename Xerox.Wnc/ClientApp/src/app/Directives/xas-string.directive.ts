
/**
 *  This directive is used to chnage the entered string into printer local language
 */
import { Directive,Input,ElementRef,Renderer2 } from '@angular/core';
import { ResourcestringService} from '../services/resourcestring.service';
import { resourceString} from '../model/global';

@Directive({
  selector: '[xasString]'
})
export class XasStringDirective {

  @Input('xasString') xasString : string;
  @Input() formatValues : string;
  resourceString : resourceString[];

  constructor(
    private el : ElementRef, 
    private renderer : Renderer2, 
    private resourceStringService : ResourcestringService
    ) { 

  }

  ngOnInit(){
    this.resourceString = this.resourceStringService.getObjStrings();
    this.renderer.setProperty(this.el.nativeElement,'innerHTML', this.replaceString());
  }

  ngOnChanges(){
    this.renderer.setProperty(this.el.nativeElement,'innerHTML',this.replaceString());
  }

  private replaceString():string{
    let string = this.xasString;
    return this.resourceString[string];
  }

}