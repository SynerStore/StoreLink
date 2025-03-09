export enum EOssStorageClass {
  Standard = 'Standard',
  Archive = 'Archive',
  ColdArchive = 'ColdArchive',
  DeepColdArchive = 'DeepColdArchive',
}

export const OssStorageClassMap: Record<EOssStorageClass, string> = {
  [EOssStorageClass.Standard]: '标准存储',
  [EOssStorageClass.Archive]: '归档存储',
  [EOssStorageClass.ColdArchive]: '低频访问存储',
  [EOssStorageClass.DeepColdArchive]: '深度低频访问存储',
};
