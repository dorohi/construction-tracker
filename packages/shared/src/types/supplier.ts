export interface Supplier {
  id: string;
  name: string;
  contactName?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  hasDelivery?: boolean;
  isFavorite?: boolean;
  notes?: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierInput {
  name: string;
  contactName?: string;
  phone?: string;
  website?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  hasDelivery?: boolean;
  isFavorite?: boolean;
  notes?: string;
}

export interface UpdateSupplierInput extends Partial<CreateSupplierInput> {}
