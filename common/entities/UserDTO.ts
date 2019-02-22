import {DirectoryDTO} from './DirectoryDTO';
import {Utils} from '../Utils';

export enum UserRoles {
  LimitedGuest = 1,
  Guest = 2,
  User = 3,
  Admin = 4,
  Developer = 5,

}

export interface UserDTO {
  id: number;
  name: string;
  password: string;
  role: UserRoles;
  usedSharingKey?: string;
  permissions: string[]; // user can only see these permissions. if ends with *, its recursive
}

export module UserDTO {

  export const isDirectoryPathAvailable = (path: string, permissions: string[], separator = '/'): boolean => {
    if (permissions == null || permissions.length === 0 || permissions[0] === separator + '*') {
      return true;
    }
    for (let i = 0; i < permissions.length; i++) {
      let permission = permissions[i];
      if (permissions[i] === separator + '*') {
        return true;
      }
      if (permission[permission.length - 1] === '*') {
        permission = permission.slice(0, -1);
        if (path.startsWith(permission) && (!path[permission.length] || path[permission.length] === separator)) {
          return true;
        }
      } else if (path === permission) {
        return true;
      } else if (path === '.' && permission === separator) {
        return true;
      }

    }
    return false;
  };

  export const isDirectoryAvailable = (directory: DirectoryDTO, permissions: string[]): boolean => {
    return isDirectoryPathAvailable(Utils.concatUrls(directory.path, directory.name), permissions);
  };
}
