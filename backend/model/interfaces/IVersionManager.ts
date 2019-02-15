export interface IVersionManager {
  getDataVersion(): Promise<string>;

  updateDataVersion(): Promise<void>;
}
