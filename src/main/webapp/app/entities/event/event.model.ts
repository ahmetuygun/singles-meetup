import dayjs from 'dayjs/esm';
import { IVenue } from 'app/entities/venue/venue.model';
import { IPersonProfile } from 'app/entities/person-profile/person-profile.model';

export interface IEvent {
  id: number;
  name?: string | null;
  description?: string | null;
  eventDate?: dayjs.Dayjs | null;
  maxParticipants?: number | null;
  status?: string | null;
  price?: number | null;
  image?: string | null;
  imageContentType?: string | null;
  venue?: IVenue | null;
  participants?: IPersonProfile[] | null;
}

export type NewEvent = Omit<IEvent, 'id'> & { id: null };
