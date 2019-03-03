import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FacesService} from './faces.service';
import {QueryService} from '../../model/query.service';


@Component({
  selector: 'app-faces',
  templateUrl: './faces.component.html',
  styleUrls: ['./faces.component.css']
})
export class FacesComponent implements OnInit {
  @ViewChild('container') container: ElementRef;
  public size: number;

  constructor(public facesService: FacesService,
              public queryService: QueryService) {
    this.facesService.getPersons().catch(console.error);
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

