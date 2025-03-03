import * as events from './main/modules/events';

export type Events = typeof events;

export interface EventData {
  eventName: keyof Events;
  data?: any;
}
