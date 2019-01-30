import {Pipe, PipeTransform} from '@angular/core';
import {SortingMethods} from '../../../common/entities/SortingMethods';


@Pipe({name: 'iconizeSorting'})
export class IconizeSortingMethod implements PipeTransform {
  transform(method: SortingMethods): string {
    switch (method) {
      case SortingMethods.ascName:
        return '<span class="oi oi-sort-ascending"></span><strong>A</strong>';
      case SortingMethods.descName:
        return '<span class="oi oi-sort-descending"></span><strong>A</strong>';
      case SortingMethods.ascDate:
        return '<span class="oi oi-sort-ascending"></span>';
      case SortingMethods.descDate:
        return '<span class="oi oi-sort-descending"></span>';
      case SortingMethods.random:
        return '<span class="oi oi-random"></span>';
    }
  }
}

