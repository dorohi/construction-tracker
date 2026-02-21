export interface Carrier {
  id: string;
  name: string;
  phone?: string | null;
  vehicle?: string | null;
  licensePlate?: string | null;
  notes?: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCarrierInput {
  name: string;
  phone?: string;
  vehicle?: string;
  licensePlate?: string;
  notes?: string;
}

export interface UpdateCarrierInput extends Partial<CreateCarrierInput> {}
