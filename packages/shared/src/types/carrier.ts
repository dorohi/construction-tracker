export interface Carrier {
  id: string;
  name: string;
  phone?: string | null;
  website?: string | null;
  vehicle?: string | null;
  licensePlate?: string | null;
  isFavorite?: boolean;
  notes?: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCarrierInput {
  name: string;
  phone?: string;
  website?: string;
  vehicle?: string;
  licensePlate?: string;
  isFavorite?: boolean;
  notes?: string;
}

export interface UpdateCarrierInput extends Partial<CreateCarrierInput> {}
