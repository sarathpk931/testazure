import { Directive, ElementRef, OnDestroy, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[action-bar]'
})
export class ActionBarDirective implements OnInit, OnDestroy {
  private resizeListener: (() => void) | null = null;

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.calculateWidth();

    this.resizeListener = this.renderer.listen('window', 'resize', () => {
      this.calculateWidth();
    });
  }

  ngOnDestroy(): void {
    if (this.resizeListener) {
      this.resizeListener();
      this.resizeListener = null;
    }
  }

  private calculateWidth(): void {
    setTimeout(() => {
      const headerDiv: HTMLElement = this.elementRef.nativeElement;
      const leftDiv: HTMLElement = headerDiv.querySelector('.header-left');
      const rightDiv: HTMLElement = headerDiv.querySelector('.header-right');
      const middleDiv: HTMLElement = headerDiv.querySelector('.header-middle');

      const totalWidth: number = headerDiv.offsetWidth;
      const mid: number = totalWidth / 2;

      const leftSpace: number = mid - leftDiv.offsetWidth;
      const rightSpace: number = mid - rightDiv.offsetWidth;

      const min: number = Math.min(leftSpace, rightSpace);
      const w: number = min * 2;

      this.renderer.setStyle(middleDiv, 'width', w + 'px');
    }, 100);
  }
}
