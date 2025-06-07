import dayjs from 'dayjs/esm';

import { IEvent, NewEvent } from './event.model';

export const sampleWithRequiredData: IEvent = {
  id: 18174,
  name: 'scent yum',
  eventDate: dayjs('2025-06-06T21:24'),
  price: 1439.13,
};

export const sampleWithPartialData: IEvent = {
  id: 23203,
  name: 'ugh',
  eventDate: dayjs('2025-06-06T12:44'),
  maxParticipants: 19381,
  price: 1192.88,
};

export const sampleWithFullData: IEvent = {
  id: 14744,
  name: 'know yahoo',
  description: 'opera overstay',
  eventDate: dayjs('2025-06-07T01:02'),
  maxParticipants: 31380,
  status: 'psst',
  price: 4253.03,
  image: '../fake-data/blob/hipster.png',
  imageContentType: 'unknown',
};

export const sampleWithNewData: NewEvent = {
  name: 'throughout solder aw',
  eventDate: dayjs('2025-06-07T05:53'),
  price: 23953.47,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
