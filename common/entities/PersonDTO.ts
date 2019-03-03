export interface PersonDTO {
  id: number;
  name: string;
  count: number;
  readyThumbnail: boolean;
}


export class Person implements PersonDTO {
  count: number;
  id: number;
  name: string;
  readyThumbnail: boolean;


  constructor() {
  }

  public static getThumbnailUrl(that: PersonDTO): string {
    return '/api/person/' + that.name + '/thumbnail';
  }
}
