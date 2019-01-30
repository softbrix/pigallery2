import {IPersonManager} from '../interfaces/IPersonManager';
import {PersonEntry} from './enitites/PersonEntry';
import {SQLConnection} from './SQLConnection';

const LOG_TAG = '[PersonManager]';

export class PersonManager implements IPersonManager {

  persons: PersonEntry[] = [];

  async get(name: string): Promise<PersonEntry> {

    let person = this.persons.find(p => p.name === name);
    if (!person) {
      const connection = await SQLConnection.getConnection();
      const personRepository = connection.getRepository(PersonEntry);
      person = await personRepository.findOne({name: name});
      if (!person) {
        person = await personRepository.save(<PersonEntry>{name: name});
      }
      this.persons.push(person);
    }
    return person;
  }


  async saveAll(names: string[]): Promise<void> {
    const toSave: { name: string }[] = [];
    const connection = await SQLConnection.getConnection();
    const personRepository = connection.getRepository(PersonEntry);
    this.persons = await personRepository.find();

    for (let i = 0; i < names.length; i++) {

      const person = this.persons.find(p => p.name === names[i]);
      if (!person) {
        toSave.push({name: names[i]});
      }
    }

    if (toSave.length > 0) {
      for (let i = 0; i < toSave.length / 200; i++) {
        await personRepository.insert(toSave.slice(i * 200, (i + 1) * 200));
      }
       this.persons = await personRepository.find();
    }

  }

}
