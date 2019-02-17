export enum SearchTypes {
  directory = 1,
  person = 2,
  keyword = 3,
  position = 5,
  photo = 6,
  video = 7
}

export class AutoCompleteItem {
  constructor(public text: string, public type: SearchTypes) {
  }

  equals(other: AutoCompleteItem) {
    return this.text === other.text && this.type === other.type;
  }
}

