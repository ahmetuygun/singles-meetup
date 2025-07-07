import { IEvent } from '../event/event.model';

export interface ITicket {
  id: number;
  name?: string | null;
  description?: string | null;
  price?: number | null;
  quantityAvailable?: number | null;
  quantitySold?: number | null;
  isActive?: boolean | null;
  genderRestriction?: string | null;
  earlyBird?: boolean | null;
  event?: Pick<IEvent, 'id' | 'name'> | null;
}

export type NewTicket = Omit<ITicket, 'id'> & { id: null }; 