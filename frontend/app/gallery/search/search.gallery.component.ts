import {Component, OnDestroy} from '@angular/core';
import {AutoCompleteService} from './autocomplete.service';
import {AutoCompleteItem, SearchTypes} from '../../../../common/entities/AutoCompleteItem';
import {ActivatedRoute, Params, RouterLink} from '@angular/router';
import {GalleryService} from '../gallery.service';
import {Subscription} from 'rxjs';
import {Config} from '../../../../common/config/public/Config';
import {NavigationService} from '../../model/navigation.service';
import {QueryParams} from '../../../../common/QueryParams';

@Component({
  selector: 'app-gallery-search',
  templateUrl: './search.gallery.component.html',
  styleUrls: ['./search.gallery.component.css'],
  providers: [AutoCompleteService, RouterLink]
})
export class GallerySearchComponent implements OnDestroy {

  autoCompleteItems: AutoCompleteRenderItem[] = [];
  public searchText = '';
  private cache = {
    lastAutocomplete: '',
    lastInstantSearch: ''
  };
  mouseOverAutoComplete = false;

  readonly SearchTypes: typeof SearchTypes;
  private readonly subscription: Subscription = null;

  constructor(private _autoCompleteService: AutoCompleteService,
              private _galleryService: GalleryService,
              private navigationService: NavigationService,
              private _route: ActivatedRoute) {

    this.SearchTypes = SearchTypes;

    this.subscription = this._route.params.subscribe((params: Params) => {
      const searchText = params[QueryParams.gallery.searchText];
      if (searchText && searchText !== '') {
        this.searchText = searchText;
      }
    });
  }


  ngOnDestroy() {
    if (this.subscription !== null) {
      this.subscription.unsubscribe();
    }
  }

  onSearchChange(event: KeyboardEvent) {


    const searchText = (<HTMLInputElement>event.target).value.trim();

    if (Config.Client.Search.AutoComplete.enabled &&
      this.cache.lastAutocomplete !== searchText) {
      this.cache.lastAutocomplete = searchText;
      this.autocomplete(searchText).catch(console.error);
    }

    if (Config.Client.Search.instantSearchEnabled &&
      this.cache.lastInstantSearch !== searchText) {
      this.cache.lastInstantSearch = searchText;
      if (searchText === '') {
        return this.navigationService.toGallery().catch(console.error);
      }
      this._galleryService.runInstantSearch(searchText);
      this.navigationService.search(searchText).catch(console.error);

    }
  }


  public setMouseOverAutoComplete(value: boolean) {
    this.mouseOverAutoComplete = value;
  }

  public onFocusLost() {
    if (this.mouseOverAutoComplete === false) {
      this.autoCompleteItems = [];
    }
  }

  public onFocus() {
    this.autocomplete(this.searchText).catch(console.error);
  }

  private emptyAutoComplete() {
    this.autoCompleteItems = [];
  }

  private async autocomplete(searchText: string) {
    if (!Config.Client.Search.AutoComplete.enabled) {
      return;
    }
    if (searchText.trim() === '.') {
      return;
    }


    if (searchText.trim().length > 0) {
      try {
        const items = await this._autoCompleteService.autoComplete(searchText);
        this.showSuggestions(items, searchText);
      } catch (error) {
        console.error(error);
      }

    } else {
      this.emptyAutoComplete();
    }
  }

  private showSuggestions(suggestions: AutoCompleteItem[], searchText: string) {
    this.emptyAutoComplete();
    suggestions.forEach((item: AutoCompleteItem) => {
      const renderItem = new AutoCompleteRenderItem(item.text, searchText, item.type);
      this.autoCompleteItems.push(renderItem);
    });
  }
}

class AutoCompleteRenderItem {
  public preText = '';
  public highLightText = '';
  public postText = '';
  public type: SearchTypes;

  constructor(public text: string, searchText: string, type: SearchTypes) {
    const preIndex = text.toLowerCase().indexOf(searchText.toLowerCase());
    if (preIndex > -1) {
      this.preText = text.substring(0, preIndex);
      this.highLightText = text.substring(preIndex, preIndex + searchText.length);
      this.postText = text.substring(preIndex + searchText.length);
    } else {
      this.postText = text;
    }
    this.type = type;
  }
}

