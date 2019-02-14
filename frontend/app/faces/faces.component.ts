import {Component} from '@angular/core';
import {FacesService} from './faces.service';
import {QueryService} from '../model/query.service';


@Component({
  selector: 'app-faces',
  templateUrl: './faces.component.html',
  styleUrls: ['./faces.component.css']
})
export class FacesComponent {


  constructor(public facesService: FacesService,
              public queryService: QueryService) {
    this.facesService.getPersons().catch(console.error);
  }


}

