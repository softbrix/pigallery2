import {PersonEntry} from '../sql/enitites/PersonEntry';

export interface IPersonManager {
  get(name: string): Promise<PersonEntry>;

  saveAll(names: string[]): Promise<void>;
}
