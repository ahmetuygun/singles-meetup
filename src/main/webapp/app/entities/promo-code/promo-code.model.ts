import dayjs from 'dayjs/esm';
import { IEvent } from 'app/entities/event/event.model';
import { IPersonProfile } from 'app/entities/person-profile/person-profile.model';

export enum PromoCodeType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
  FREE = 'FREE'
}

export interface IPromoCode {
  id: string;
  code?: string | null;
  type?: PromoCodeType | null;
  value?: number | null;
  maxUses?: number | null;
  usedCount?: number | null;
  expiresAt?: dayjs.Dayjs | null;
  personProfile?: IPersonProfile | null;
  event?: IEvent | null;
  isActive?: boolean | null;
}

export type NewPromoCode = Omit<IPromoCode, 'id'> & { id: null }; 