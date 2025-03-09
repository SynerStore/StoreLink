import { EChannels, Events } from '../../types';

const dispatch = window?.electronBridge?.dispatch;

export const events: Events = new Proxy(
  {},
  {
    get(_target, key: keyof Events) {
      return (params: any): Promise<any> =>
        dispatch(EChannels.eventsX, {
          eventName: key,
          data: params,
        });
    },
  },
) as Events;
