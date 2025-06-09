import dayjs from 'dayjs/esm';
import { IUser } from 'app/entities/user/user.model';
import { IEvent } from 'app/entities/event/event.model';

export interface IPersonProfile {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  dob?: dayjs.Dayjs | null;
  gender?: string | null;
  bio?: string | null;
  interests?: string | null;
  location?: string | null;
  testCompleted?: boolean | null;
  internalUser?: Pick<IUser, 'id'> | null;
  events?: IEvent[] | null;
}

export type NewPersonProfile = Omit<IPersonProfile, 'id'> & { id: null };
