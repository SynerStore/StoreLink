import { connectionsDBRegistory } from './connectionsData';
import { settingDBRegistory } from './settingData';
import { viewerDBRegistory } from './viewerData';

export * from './connectionsData';
export * from './settingData';
export * from './viewerData';

export const dbRegistory = async () => {
  await connectionsDBRegistory();
  await settingDBRegistory();
  await viewerDBRegistory();
};
