export interface PersonDTO {
  id: number;
  name: string;
  count: number;
  readyThumbnail?: boolean;
  isFavourite: boolean;
}


export class Person implements PersonDTO {
  isFavourite: boolean;
  count: number;
  id: number;
  name: string;


  constructor() {
  }

  public static getThumbnailUrl(that: PersonDTO): string {
    return '/api/person/' + that.name + '/thumbnail';
  }
}
