export interface IVenue {
  id: number;
  name?: string | null;
  address?: string | null;
  city?: string | null;
  capacity?: number | null;
  contactInfo?: string | null;
  photoUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export type NewVenue = Omit<IVenue, 'id'> & { id: null };
