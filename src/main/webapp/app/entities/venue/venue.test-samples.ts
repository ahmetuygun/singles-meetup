import { IVenue, NewVenue } from './venue.model';

export const sampleWithRequiredData: IVenue = {
  id: 26103,
  name: 'past like corner',
  address: 'wherever old-fashioned pave',
};

export const sampleWithPartialData: IVenue = {
  id: 30216,
  name: 'huzzah',
  address: 'spork',
  city: 'Fort London',
  capacity: 2167,
};

export const sampleWithFullData: IVenue = {
  id: 26635,
  name: 'whoa creator chap',
  address: 'while',
  city: 'Darrellbury',
  capacity: 23299,
  contactInfo: 'sequester dearest ack',
  photoUrl: 'colligate',
};

export const sampleWithNewData: NewVenue = {
  name: 'now',
  address: 'brightly mispronounce sonnet',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
