export interface Worker {
  id: string;
  name: string;
  phone?: string | null;
  website?: string | null;
  notes?: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkerInput {
  name: string;
  phone?: string;
  website?: string;
  notes?: string;
}

export interface UpdateWorkerInput extends Partial<CreateWorkerInput> {}
