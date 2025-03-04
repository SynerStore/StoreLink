import path from 'path';
export const getRcloneCmdPath = () => {
  if (process.platform === 'win32') {
    return path.join('../../../bin/rclone', 'win32', 'rclone.exe');
  } else if (process.platform === 'darwin') {
    return path.join('../../../bin/rclone', 'darwin', 'rclone');
  } else if (process.platform === 'linux') {
    return path.join('../../../bin/rclone', 'linux', 'rclone');
  }
  return undefined;
};
