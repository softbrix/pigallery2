export enum ErrorCodes {
  NOT_AUTHENTICATED = 1,
  ALREADY_AUTHENTICATED = 2,
  NOT_AUTHORISED = 3,
  PERMISSION_DENIED = 4,
  CREDENTIAL_NOT_FOUND = 5,


  USER_CREATION_ERROR = 6,


  GENERAL_ERROR = 7,
  THUMBNAIL_GENERATION_ERROR = 8,
  SERVER_ERROR = 9,

  USER_MANAGEMENT_DISABLED = 10,

  INPUT_ERROR = 11,

  SETTINGS_ERROR = 12
}

export class ErrorDTO {
  constructor(public code: ErrorCodes, public message?: string, public details?: any) {
  }

  toString(): string {
    return '[' + ErrorCodes[this.code] + '] ' + this.message + (this.details ? this.details.toString() : '');
  }
}
