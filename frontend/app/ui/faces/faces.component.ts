import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FacesService} from './faces.service';
import {QueryService} from '../../model/query.service';
import {map} from 'rxjs/operators';
import {PersonDTO} from '../../../../common/entities/PersonDTO';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-faces',
  templateUrl: './faces.component.html',
  styleUrls: ['./faces.component.css']
})
export class FacesComponent implements OnInit {
  @ViewChild('container', {static: true}) container: ElementRef;
  public size: number;
  favourites: Observable<PersonDTO[]>;
  nonFavourites: Observable<PersonDTO[]>;

  constructor(public facesService: FacesService,
              public queryService: QueryService) {
    this.facesService.getPersons().catch(console.error);
    const personCmp = (p1: PersonDTO, p2: PersonDTO) => {
      return p1.name.localeCompare(p2.name);
    };
    this.favourites = this.facesService.persons.pipe(
      map(value => value.filter(p => p.isFavourite)
        .sort(personCmp))
    );
    this.nonFavourites = this.facesService.persons.pipe(
      map(value =>
        value.filter(p => !p.isFavourite)
          .sort(personCmp))
    );
  }


  ngOnInit() {
    this.updateSize();
  }

  private updateSize() {
    const size = 220 + 5;
    // body - container margin
    const containerWidth = this.container.nativeElement.clientWidth - 30;
    this.size = (containerWidth / Math.round((containerWidth / size))) - 5;
  }


}

