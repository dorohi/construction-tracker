export interface DeliveryInput {
  carrier?: string | null;
  carrierId?: string | null;
  supplierId?: string | null;
  categoryId?: string | null;
  amount: number;
}

interface InvoiceContext {
  title: string;
  planned: boolean;
  date: Date;
  projectId: string;
  invoiceId: string;
}

/** Данные расхода DELIVERY для накладной, либо null, если доставки нет. */
export function deliveryData(delivery: DeliveryInput | null | undefined, inv: InvoiceContext) {
  const amount = Number(delivery?.amount) || 0;
  if (!delivery || amount <= 0) return null;
  return {
    type: "DELIVERY",
    title: `Доставка: ${inv.title}`,
    amount,
    carrier: delivery.carrier || null,
    carrierId: delivery.carrierId || null,
    supplierId: delivery.supplierId || null,
    planned: inv.planned,
    date: inv.date,
    categoryId: delivery.categoryId || null,
    projectId: inv.projectId,
    invoiceId: inv.invoiceId,
  };
}
