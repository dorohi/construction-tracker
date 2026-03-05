export interface AuditLog {
  id: string;
  userId: string;
  user?: { name: string; email: string };
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  ip?: string;
  createdAt: string;
}

export interface AuditLogFilters {
  action?: string;
  entity?: string;
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
}

export interface AuditLogResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
}
