import {Injectable} from '@angular/core';
import {NetworkService} from '../../../model/network/network.service';
import {AutoCompleteItem} from '../../../../../common/entities/AutoCompleteItem';
import {GalleryCacheService} from '../cache.gallery.service';

@Injectable()
export class AutoCompleteService {


  constructor(private _networkService: NetworkService,
              private galleryCacheService: GalleryCacheService) {
  }

  public async autoComplete(text: string): Promise<Array<AutoCompleteItem>> {
    let items: Array<AutoCompleteItem> = this.galleryCacheService.getAutoComplete(text);
    if (items == null) {
      items = await  this._networkService.getJson<Array<AutoCompleteItem>>('/autocomplete/' + text);
      this.galleryCacheService.setAutoComplete(text, items);
    }
    return items;
  }


}
