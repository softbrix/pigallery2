import {Component, ElementRef} from '@angular/core';
import {FacesService} from './faces.service';
import {QueryService} from '../../model/query.service';


@Component({
  selector: 'app-faces',
  templateUrl: './faces.component.html',
  styleUrls: ['./faces.component.css']
})
export class FacesComponent {


  size: number;

  constructor(public facesService: FacesService,
              public queryService: QueryService,
              private container: ElementRef) {
    this.facesService.getPersons().catch(console.error);
  }


  ngOnChanges() {
    this.updateSize();
  }

  private updateSize() {
    const size = 220 + 5;
    const containerWidth = this.container.nativeElement.parentElement.clientWidth;
    this.size = (containerWidth / Math.round((containerWidth / size))) - 5;
    console.log(containerWidth, this.size);
  }


}

