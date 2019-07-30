import {IPersonManager} from '../interfaces/IPersonManager';
import {SQLConnection} from './SQLConnection';
import {PersonEntry} from './enitites/PersonEntry';
import {MediaDTO} from '../../../common/entities/MediaDTO';
import {PhotoDTO} from '../../../common/entities/PhotoDTO';
import {MediaEntity} from './enitites/MediaEntity';
import {FaceRegionEntry} from './enitites/FaceRegionEntry';
import {PersonDTO} from '../../../common/entities/PersonDTO';

const LOG_TAG = '[PersonManager]';

export class PersonManager implements IPersonManager {
  persons: PersonEntry[] = [];

  async updatePerson(name: string, partialPerson: PersonDTO): Promise<PersonEntry> {
    const connection = await SQLConnection.getConnection();
    const repository = connection.getRepository(PersonEntry);
    const person = await repository.createQueryBuilder('person')
      .limit(1)
      .where('person.name LIKE :name COLLATE utf8_general_ci', {name: name}).getOne();


    if (typeof partialPerson.name !== 'undefined') {
      person.name = partialPerson.name;
    }
    if (typeof partialPerson.isFavourite !== 'undefined') {
      person.isFavourite = partialPerson.isFavourite;
    }
    await repository.save(person);

    await this.loadAll();

    return person;
  }

  async getSamplePhoto(name: string): Promise<PhotoDTO> {
    const connection = await SQLConnection.getConnection();
    const rawAndEntities = await connection.getRepository(MediaEntity).createQueryBuilder('media')
      .limit(1)
      .leftJoinAndSelect('media.directory', 'directory')
      .leftJoinAndSelect('media.metadata.faces', 'faces')
      .leftJoinAndSelect('faces.person', 'person')
      .where('person.name LIKE :name COLLATE utf8_general_ci', {name: name}).getRawAndEntities();

    if (rawAndEntities.entities.length === 0) {
      return null;
    }
    const media: PhotoDTO = rawAndEntities.entities[0];

    media.metadata.faces = [FaceRegionEntry.fromRawToDTO(rawAndEntities.raw[0])];

    return media;

  }

  async loadAll(): Promise<void> {
    const connection = await SQLConnection.getConnection();
    const personRepository = connection.getRepository(PersonEntry);
    this.persons = await personRepository.find();

  }

  async getAll(): Promise<PersonEntry[]> {
    await this.loadAll();
    return this.persons;
  }

  // TODO dead code, remove it
  async keywordsToPerson(media: MediaDTO[]) {
    await this.loadAll();
    const personFilter = (keyword: string) => this.persons.find(p => p.name.toLowerCase() === keyword.toLowerCase());
    (<PhotoDTO[]>media).forEach(m => {
      if (!m.metadata.keywords || m.metadata.keywords.length === 0) {
        return;
      }

      const personKeywords = m.metadata.keywords.filter(k => personFilter(k));
      if (personKeywords.length === 0) {
        return;
      }
      // remove persons from keywords
      m.metadata.keywords = m.metadata.keywords.filter(k => !personFilter(k));
      m.metadata.faces = m.metadata.faces || [];
      personKeywords.forEach((pk: string) => {
        m.metadata.faces.push({
          name: pk
        });
      });

    });
  }

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
    await this.loadAll();

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

  public async updateCounts() {
    const connection = await SQLConnection.getConnection();
    await connection.query('update person_entry set count = ' +
      ' (select COUNT(1) from face_region_entry where face_region_entry.personId = person_entry.id)');

    // remove persons without photo
    await connection.getRepository(PersonEntry)
      .createQueryBuilder()
      .where('count = 0')
      .delete()
      .execute();
  }

}
