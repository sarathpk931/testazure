/**
 *  This directive is used to manipulate the placeholder string in email text field
 */
import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';

@Directive({
  selector: '[xasPlaceholder]'
})
export class XasPlaceholderDirective {

  @Input() xasPlaceholder: string;

  private onFocus = (e: Event) => {
    const target = e.target as HTMLElement;
    if (target['value'] == null || target['value'] == "" || target['value'] == undefined) {
      this.elementRef.nativeElement.classList.add('keepPlaceHolder');
      this.elementRef.nativeElement.classList.add('showPlaceHolder');
      this.elementRef.nativeElement.classList.remove('hiddenPlaceHolder');
    } else {
      this.elementRef.nativeElement.classList.remove('keepPlaceHolder');
      target.classList.add('hiddenPlaceHolder');
      target.classList.remove('showPlaceHolder');
    }
  };

  private onBlur = (e: Event) => {
    const target = e.target as HTMLElement;
    //target.classList.remove('keepPlaceHolder');
    //target.classList.remove('removePlaceholder');
    //target.classList.remove('placeholderFont');
    if (target['value'] == null || target['value'] == "" || target['value'] == undefined) {
      this.elementRef.nativeElement.classList.add('keepPlaceHolder');
      this.elementRef.nativeElement.classList.add('showPlaceHolder');
      this.elementRef.nativeElement.classList.remove('hiddenPlaceHolder');
    } else {
      this.elementRef.nativeElement.classList.remove('keepPlaceHolder');
      target.classList.add('hiddenPlaceHolder');
      target.classList.remove('showPlaceHolder');
    }
  };

  private onKeyPress = (e: Event) => {
    const target = e.target as HTMLElement;
    if (target['value'] != null && target['value'] != "" && target['value'] != undefined) {
      target.classList.add('hiddenPlaceHolder');
      target.classList.remove('showPlaceHolder');
      this.elementRef.nativeElement.classList.remove('keepPlaceHolder');
    } else {
      target.classList.remove('hiddenPlaceHolder');
      target.classList.add('showPlaceHolder');
      this.elementRef.nativeElement.classList.add('keepPlaceHolder');
    }
  };

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    this.elementRef.nativeElement.addEventListener('focus', this.onFocus);
    this.elementRef.nativeElement.addEventListener('blur', this.onBlur);
    this.elementRef.nativeElement.addEventListener('input', this.onKeyPress);
  }

  ngOnDestroy() {
    this.elementRef.nativeElement.removeEventListener('focus', this.onFocus);
    this.elementRef.nativeElement.removeEventListener('blur', this.onBlur);
    this.elementRef.nativeElement.removeEventListener('input', this.onKeyPress);
  }

}
