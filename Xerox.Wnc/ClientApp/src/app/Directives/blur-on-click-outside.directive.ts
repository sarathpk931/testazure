import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[blurOnClickOutside]'
})
export class BlurOnClickOutsideDirective {
  constructor(private elementRef: ElementRef<HTMLInputElement>) {}

  @HostListener('document:click', ['$event.target'])
  onClick(targetElement: any) {
    const clickedInside = this.elementRef.nativeElement.contains(targetElement);
    if (!clickedInside) {
      if (this.elementRef.nativeElement.tagName.toLowerCase() === 'input') {
        this.elementRef.nativeElement.blur();
      } else if (
        this.elementRef.nativeElement.tagName.toLowerCase() === 'button' &&
        this.elementRef.nativeElement.querySelector('input')
      ) {
        const inputField = this.elementRef.nativeElement.querySelector('input');
        inputField.focus();
        inputField.blur();
      }
    }
  }

  
}
