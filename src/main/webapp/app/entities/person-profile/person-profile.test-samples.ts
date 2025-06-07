import dayjs from 'dayjs/esm';

import { IPersonProfile, NewPersonProfile } from './person-profile.model';

export const sampleWithRequiredData: IPersonProfile = {
  id: 20319,
  firstName: 'Elenora',
  lastName: 'Spinka-Will',
  dob: dayjs('2025-06-07'),
  gender: 'opposite righteously',
};

export const sampleWithPartialData: IPersonProfile = {
  id: 27489,
  firstName: 'Camryn',
  lastName: 'Collins',
  dob: dayjs('2025-06-07'),
  gender: 'formal seriously',
  bio: 'excluding phooey gummy',
};

export const sampleWithFullData: IPersonProfile = {
  id: 26469,
  firstName: 'Renee',
  lastName: 'Wolf',
  dob: dayjs('2025-06-06'),
  gender: 'quietly equally',
  bio: 'typewriter fair',
  interests: 'out circulate',
  location: 'whose',
};

export const sampleWithNewData: NewPersonProfile = {
  firstName: 'Jamaal',
  lastName: 'Tromp',
  dob: dayjs('2025-06-07'),
  gender: 'aw even sustenance',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
