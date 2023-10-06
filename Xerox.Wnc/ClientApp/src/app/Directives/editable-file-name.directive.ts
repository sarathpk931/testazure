/**
 *  This directive is used to show a control as button and on its click as an input control
 * on click the entered values are selected. A glyph is also shown with the text.
 */
import { Directive, ElementRef, HostListener, Input, OnInit, Renderer2, Inject, HostBinding, ViewChild, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FileFormat, FileFormatOption } from '../model/global';
import { ScanOptionsService } from '../services/scan-options.service';
import { ResourcestringService } from '../services/resourcestring.service';


@Directive({
  selector: '[editableField]'
})

export class EditableFieldDirective {

  @Input() placeholder: string;
  @Input() additionalText: string;
  @Input() preventDirectiveInit: boolean;

  private inputField: HTMLInputElement | null;
  private buttonElement: HTMLButtonElement;
  private isInputFocused = false;

  private defaultText: string;
  private inputPlaceholder: string;
  private btnPaperClip: string;

  selectedFileFormat: FileFormat;
  selectedFileFormatOptions: FileFormatOption;
  anyFileFormat = { from: 'fileFormat' };
  extension: string;
  filePlaceHolder: string;

  constructor(
    private resourceStringService: ResourcestringService,
    private elementRef: ElementRef<HTMLInputElement>,
    private scanOptionService: ScanOptionsService,
    private renderer: Renderer2,
    private sanitizer: DomSanitizer
  ) { }


  ngOnInit() {

    this.inputField = document.querySelector('input[type="text"]');
    if (this.inputField) {
      this.inputField.style.display = 'none';
      this.inputField.value = this.placeholder;
    }

    if (!this.preventDirectiveInit) {
      this.scanOptionService.isPlaceholderVisible = true;
      this.selectedFileFormat = this.scanOptionService.getFileFormat(this.anyFileFormat);
      this.selectedFileFormatOptions = this.selectedFileFormat.options.find(item => item.isDefault === true);
      this.extension = this.selectedFileFormatOptions.title;
      this.extension = this.extension.replace('.', '');
      this.defaultText = this.placeholder;
      var newValue: string = '';
      newValue = this.additionalText;
      newValue = newValue.replace('{0}', (this.placeholder || ''));
      newValue = newValue.replace('{1}', this.extension);
      this.btnPaperClip = '<span id="_glyph" class="xrx-paperclip" style="line-height: 100%;"></span>&nbsp;&nbsp;';
      //const sanitizedContent : SafeHtml = this.sanitizer.bypassSecurityTrustHtml(this.btnPaperClip + newValue)

      this.buttonElement = this.renderer.selectRootElement('.subjectButton');
      this.buttonElement.innerHTML = this.sanitizer.sanitize(SecurityContext.HTML, this.btnPaperClip + newValue);
      //this.buttonElement.innerText = newValue;
      //this.renderer.setProperty(this.buttonElement,'innerHTML',sanitizedContent);

      this.appendGlyphToInput();

    }

    this.scanOptionService.selectedFileFormatC.subscribe(object => {
      if (object) {
        this.selectedFileFormatOptions = object;
        this.extension = this.selectedFileFormatOptions.title;
        if (this.inputField.value.includes('.')) {
          this.inputField.value = this.inputField.value.substring(0, this.inputField.value.lastIndexOf('.')) + this.extension;
        }

        if (this.buttonElement.innerText.includes('.')) {
          const cleanBtnPaperClip = this.btnPaperClip.replace(/&nbsp;/g, '');
          this.buttonElement.innerHTML = this.sanitizer.sanitize(SecurityContext.HTML, cleanBtnPaperClip + this.buttonElement.innerText.substring(0, this.buttonElement.innerText.lastIndexOf('.')) + this.extension);
        }
      }
    })
    this.resourceStringService.loadResources().then(response => {
      this.filePlaceHolder = response.SDE_ENTER_FILE_NAME1;
    }).catch(error => {
      console.log(' cannot load resource strings');
    });

  }

  private appendGlyphToInput() {

    const existingGlyph = this.inputField.parentNode.querySelector('#_glyphTextbox') as HTMLElement;
    if (existingGlyph) {
      //existingGlyph.style.display = 'inline-block';
      return;
    }

    const attachmentGlyph = this.renderer.createElement('span');
    attachmentGlyph.id = '_glyphTextbox';
    attachmentGlyph.className = 'xrx-paperclip xrs-papericon';
    attachmentGlyph.style.lineHeight = '100%';
    attachmentGlyph.innerHTML = '&nbsp;';
    attachmentGlyph.style.display = 'none';
    this.inputField.parentNode.insertBefore(attachmentGlyph, this.inputField.nextSibling);
  }

  @HostListener('click', ['$event']) onClick(event: Event) {
    event.stopPropagation();
    const isButton = this.elementRef.nativeElement.tagName.toLowerCase() === 'button';
    this.isInputFocused = true;

    if (isButton) {

      if (this.inputField) {
        this.inputField.placeholder = this.filePlaceHolder;
        this.inputField.style.display = 'inline-block';
        this.inputField.style.boxShadow = 'none';
        this.inputField.focus();

      }

      this.elementRef.nativeElement.style.display = 'none';
      this.elementRef.nativeElement.dispatchEvent(new CustomEvent('clickEvent'));
      var newValue: string = '';
      if (this.scanOptionService.isPlaceholderVisible) {

        if (this.inputField.value == '') {
          this.inputField.value = '';
        } else {
          this.inputField.value = this.placeholder;
        }

        this.inputPlaceholder = '';
        this.scanOptionService.isPlaceholderVisible = true;
      }
      else {
        this.inputField.value = this.scanOptionService.tempTextValue;
        this.scanOptionService.isPlaceholderVisible = false;
      }
      const attachmentGlyph = this.inputField.parentNode.querySelector('#_glyphTextbox') as HTMLElement;
      if (attachmentGlyph) {
        attachmentGlyph.style.display = 'inline-block';
        attachmentGlyph.classList.add('option-text');
      }
      this.inputField.focus();
      this.inputField.select();
    }
  }

  @HostListener('blur') onBlur() {
    const isTextbox = this.elementRef.nativeElement.tagName.toLowerCase() === 'input';
    this.isInputFocused = false;

    if (isTextbox) {
      this.elementRef.nativeElement.style.display = 'inline-block';
      this.buttonElement.innerHTML = this.sanitizer.sanitize(SecurityContext.HTML, this.btnPaperClip + this.inputField.value).toString();

      var enteredValue = this.elementRef.nativeElement.value.trim();
      this.scanOptionService.tempTextValue = enteredValue;
      this.extension = this.selectedFileFormatOptions.title;
      this.extension = this.extension.replace('.', '');
      newValue = this.additionalText;
      newValue = newValue.replace('{1}', this.extension);
      this.inputField.placeholder = this.filePlaceHolder;

      if ((enteredValue == this.placeholder) || (enteredValue == '')) {

        if (enteredValue == '') {
          newValue = '';
          this.inputField.value = '';
        } else {
          this.inputPlaceholder = this.defaultText;
          newValue = newValue.replace('{0}', this.defaultText);
        }

        this.scanOptionService.isPlaceholderVisible = true;
        this.inputField.value = enteredValue;
        if (newValue == '') {
          this.buttonElement.innerHTML = this.sanitizer.sanitize(SecurityContext.HTML, this.btnPaperClip + this.filePlaceHolder);
        } else {
          this.buttonElement.innerHTML = this.sanitizer.sanitize(SecurityContext.HTML, this.btnPaperClip + newValue);
        }

      }
      else {
        this.inputPlaceholder = '';
        var newValue: string;
        this.inputField.value = '';

        newValue = newValue.replace('{0}', enteredValue);
        this.inputField.value = newValue;
        this.elementRef.nativeElement.value = enteredValue;
        this.buttonElement.innerHTML = this.sanitizer.sanitize(SecurityContext.HTML, this.btnPaperClip + newValue);
        this.scanOptionService.isPlaceholderVisible = false;

      }
      const attachmentGlyph = this.inputField.parentNode.querySelector('#_glyphTextbox') as HTMLElement;
      if (attachmentGlyph) {
        attachmentGlyph.classList.remove('option-text');
        attachmentGlyph.style.display = 'none';
      }

      this.inputField.style.display = 'none';
      this.buttonElement.style.display = 'inline-block';
      //this.elementRef.nativeElement.dispatchEvent(new CustomEvent('blurEvent'));

    }

  }

  @HostListener('document:click', ['$event']) onDocumentClick(event: Event) {

    const targetNode = event.target as Node;
    if (!this.elementRef.nativeElement.contains(targetNode) && !this.isInputFocused) {
      if (this.inputField) {
        this.inputField.blur();
      }
    }
  }





}
