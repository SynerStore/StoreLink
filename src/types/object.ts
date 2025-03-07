// store data

export type StoreObjectData = {
  name: String;
  isDir: boolean;
  path: String;
  encodePath: String;
  size?: number;
  lastModified?: String;
  etag?: String;
  owner?: String;
  restoreInfo?: String;
  storageClass?: String;
  type?: String;
  url?: String;
  mini: String;
};
