import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'translate'
})
export class TranslatePipe implements PipeTransform {
  transform(input: string, strings: any): string {
    let result = "";
    if (input) {
      result = strings[input] || input;
    }
    return result;
  }
}
