import {Injectable} from '@angular/core';
import {NetworkService} from '../model/network/network.service';
import {BehaviorSubject} from 'rxjs';
import {PersonDTO} from '../../../common/entities/PersonDTO';


@Injectable()
export class FacesService {

  public persons: BehaviorSubject<PersonDTO[]>;

  constructor(private networkService: NetworkService) {
    this.persons = new BehaviorSubject<PersonDTO[]>(null);
  }

  public async getPersons() {
    this.persons.next((await this.networkService.getJson<PersonDTO[]>('/person')).sort((a, b) => a.name.localeCompare(b.name)));
  }

}
