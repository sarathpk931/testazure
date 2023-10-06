/**
 *  This directive is used to change the class of a controlon click and blur events
 */
import { Directive, ElementRef, HostBinding, HostListener, Input, } from '@angular/core';

@Directive({
  selector: 'appTextField'
})
export class TextFieldDirective {
  @Input() initialValue: string; 
  @Input() readOnlyClass: string;
  @Input() editableClass : string;

  private editMode = false; 
  private editableText: string;
  editing: boolean = false;
  currentTextField: ElementRef | null = null;
  //@HostBinding ('class') hostClasses = '';
  //@HostBinding (editableClass) editmode = true;

  constructor(private elementRef: ElementRef<HTMLInputElement>) { }

  @HostListener('tap', ['$event'])
  @HostListener('click', ['$event'])
  onTextFieldClick(event: Event) {  

    if (
      event.target instanceof Element &&
      event.target.closest('.wrapper') !== null &&
      event.type === 'click'
    ) {
      event.stopPropagation();
      event.preventDefault();
      return;
    }

    this.elementRef.nativeElement.querySelector('input').removeAttribute('readonly');

    if (!event.defaultPrevented) {
      const alreadyEditing = this.editing;
      this.scrollTextFieldIntoView();

      //setTimeout(() => {
      //  this.elementRef.nativeElement.querySelector('input').focus();
      //  if (!alreadyEditing) {
      //    this.elementRef.nativeElement.querySelector('input').select();
      //  }
      //}, 200);

      document.removeEventListener('tap', this.outsideClick);
      document.removeEventListener('click', this.outsideClick);
      document.addEventListener('tap', this.outsideClick);
      document.addEventListener('click', this.outsideClick);

      event.stopPropagation();
      event.preventDefault();
    }
  }

  outsideClick(event: MouseEvent) {
   
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
  
  scrollTextFieldIntoView() {
      const inputElement = this.elementRef.nativeElement.querySelector('input') as HTMLElement;
      const scrollContainer = inputElement.closest('div[ngScrollable]') as HTMLElement;
    
      if (window['IScroll'] && window['IScroll'].length > 0) {
        // Ensure we have an iscroll to scroll with and scroll to element with 15 px of padding above the element
        window['IScroll'][window['IScroll'].length - 1].scrollToElement(inputElement, null, 0, -15);
    
        // Scroll to element doesn't execute the scroll start and scroll end events,
        // so we have to fire them manually (or update iscroll-probe)
        setTimeout(() => {
          window['IScroll'][window['IScroll'].length - 1]._execEvent('scrollStart');
          window['IScroll'][window['IScroll'].length - 1]._execEvent('scrollEnd');
        }, 50);
      } else {
        if (window.innerHeight == 480) {
          const eighthGenKeyboardSpacer = scrollContainer.querySelector(".eighth-gen-keyboard-spacer") as HTMLElement;
          if (eighthGenKeyboardSpacer) {
            eighthGenKeyboardSpacer.classList.add("show");
          }
        }
    
        if (scrollContainer.querySelector(inputElement.tagName)) {
          // Get parent until we have a top
          let inputContainer = inputElement;
          while (inputContainer.getBoundingClientRect().top === 0) {
            inputContainer = inputContainer.parentElement as HTMLElement;
          }
    
          // Scroll the element into position if it's not already in position
          if (
            Math.round(inputContainer.getBoundingClientRect().top) !== 43 &&
            Math.round(inputContainer.getBoundingClientRect().top) !== 65
          ) {
            scrollContainer.scrollTop += inputContainer.getBoundingClientRect().top - 43;
          }
        }
      }
    }
}


