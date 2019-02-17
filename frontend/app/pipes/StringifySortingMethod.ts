import {Pipe, PipeTransform} from '@angular/core';
import {I18n} from '@ngx-translate/i18n-polyfill';
import {SortingMethods} from '../../../common/entities/SortingMethods';


@Pipe({name: 'stringifySorting'})
export class StringifySortingMethod implements PipeTransform {
  constructor(private i18n: I18n) {
  }

  transform(method: SortingMethods): string {
    switch (method) {
      case SortingMethods.ascName:
        return this.i18n('ascending name');
      case SortingMethods.descName:
        return this.i18n('descending name');
      case SortingMethods.ascDate:
        return this.i18n('ascending date');
      case SortingMethods.descDate:
        return this.i18n('descending date');
      case SortingMethods.random:
        return this.i18n('random');
    }
  }
}

