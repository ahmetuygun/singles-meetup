import { IUserEvent, NewUserEvent } from './user-event.model';

export const sampleWithRequiredData: IUserEvent = {
  id: 30415,
  paymentStatus: 'UNPAID',
};

export const sampleWithPartialData: IUserEvent = {
  id: 12611,
  status: 'lend epic malfunction',
  checkedIn: false,
  paymentStatus: 'UNPAID',
};

export const sampleWithFullData: IUserEvent = {
  id: 11878,
  status: 'lest carefully abaft',
  checkedIn: true,
  matchCompleted: false,
  paymentStatus: 'PAID',
};

export const sampleWithNewData: NewUserEvent = {
  paymentStatus: 'PENDING',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
