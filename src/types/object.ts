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

export interface TS3Object {
  key: string | undefined;
  name: string | undefined;
  lastModified: Date | undefined;
  size: number | undefined;
  etag: string | undefined;
  storageClass: string | undefined;
  isDirectory?: boolean;
  mime?: string | false;
}