# Накладные (invoices) — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: используйте superpowers:subagent-driven-development (рекомендуется) или superpowers:executing-plans для выполнения плана задача-за-задачей. Шаги используют чекбоксы (`- [ ]`).

**Goal:** Добавить документ «Накладная» — группу материальных расходов с общей шапкой (название, описание, дата, поставщик, план/факт) и множеством позиций (название, категория, кол-во, единица, цена), создаваемых/редактируемых динамическими строками; итог считается автоматически, позиции остаются обычными `MATERIAL`-расходами.

**Architecture:** Шапка — новая модель `Invoice`. Позиции — обычные `Expense` с `type=MATERIAL` и FK `invoiceId` (`onDelete: Cascade`). За счёт этого позиции автоматически попадают в существующие расходы/сводки/графики/фильтры. `total` не хранится, считается на сервере как сумма `amount` позиций.

**Tech Stack:** Next.js 15 App Router (backend API), Prisma + SQLite, React 19 + MUI 6 + MobX 6 (frontend), pnpm workspaces, TypeScript.

**Замечание о проверке (важно):** в проекте нет тест-раннера, и добавлять его — вне объёма. Верификация каждой задачи — типизация/сборка (`pnpm build` или сборка пакета; Next.js типизирует API-роуты при build) + smoke-проверки API через curl и проверка UI в запущенном приложении (как этот проект и валидируется обычно).

**Соглашение по коммитам:** каждое сообщение коммита — на русском, в конце строка-трейлер `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>` (опускается в командах ниже для краткости — добавляйте её).

**Ветка:** работаем в `feature/invoices` (уже создана; спека закоммичена). Worktree не использовать.

---

## Структура файлов

- Create: `packages/shared/src/types/invoice.ts` — типы накладной.
- Modify: `packages/shared/src/index.ts` — реэкспорт типов.
- Modify: `packages/backend/prisma/schema.prisma` — модель `Invoice` + `Expense.invoiceId` + обратные связи.
- Create: `packages/backend/src/app/api/projects/[id]/invoices/route.ts` — GET (список) + POST (создание).
- Create: `packages/backend/src/app/api/invoices/[id]/route.ts` — GET/PUT/DELETE.
- Modify: `packages/frontend/src/services/api.ts` — `invoicesApi`.
- Create: `packages/frontend/src/stores/InvoiceStore.ts` — стор накладных.
- Modify: `packages/frontend/src/stores/RootStore.ts` — регистрация стора.
- Create: `packages/frontend/src/pages/invoices/InvoiceForm.tsx` — диалог-форма.
- Create: `packages/frontend/src/pages/invoices/InvoicesPage.tsx` — список накладных.
- Modify: `packages/frontend/src/App.tsx` — маршрут `/projects/:id/invoices`.
- Modify: `packages/frontend/src/pages/projects/ProjectPage.tsx` — кнопка «Накладные».

---

## Task 1: Prisma — модель Invoice и связь с Expense

**Files:**
- Modify: `packages/backend/prisma/schema.prisma`

- [ ] **Step 1: Добавить обратную связь в модель `Project`**

В модель `Project` (после строки `expenses    Expense[]`) добавить:

```prisma
  invoices    Invoice[]
```

- [ ] **Step 2: Добавить обратную связь в модель `Supplier`**

В модель `Supplier` (после строки `expenses    Expense[]`) добавить:

```prisma
  invoices    Invoice[]
```

- [ ] **Step 3: Добавить поля в модель `Expense`**

В модель `Expense` (после строки `projectId   String`) добавить:

```prisma
  invoiceId   String?
  invoice     Invoice?  @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
```

- [ ] **Step 4: Добавить модель `Invoice`** (после модели `Expense`)

```prisma
model Invoice {
  id          String    @id @default(cuid())
  title       String
  description String?
  date        DateTime
  supplier    String?
  supplierId  String?
  supplierRef Supplier? @relation(fields: [supplierId], references: [id], onDelete: SetNull)
  planned     Boolean   @default(false)
  project     Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  projectId   String
  items       Expense[]
  createdAt   DateTime  @default(now())
}
```

- [ ] **Step 5: Применить схему к БД и сгенерировать клиент**

Run:
```bash
pnpm db:push && pnpm --filter backend prisma generate
```
Expected: `The database is now in sync with your Prisma schema` (или `already in sync`) и `Generated Prisma Client`. Без ошибок валидации схемы.

- [ ] **Step 6: Commit**

```bash
git add packages/backend/prisma/schema.prisma
git commit -m "feat(db): модель Invoice и связь Expense.invoiceId (cascade)"
```

---

## Task 2: Shared-типы накладной

**Files:**
- Create: `packages/shared/src/types/invoice.ts`
- Modify: `packages/shared/src/index.ts`

- [ ] **Step 1: Создать `packages/shared/src/types/invoice.ts`**

```ts
import type { Expense } from "./expense";

export interface Invoice {
  id: string;
  title: string;
  description?: string | null;
  date: string;
  supplier?: string | null;
  supplierId?: string | null;
  planned: boolean;
  projectId: string;
  items: Expense[];
  total: number;
  createdAt: string;
}

export interface InvoiceListItem {
  id: string;
  title: string;
  supplier?: string | null;
  date: string;
  planned: boolean;
  itemCount: number;
  total: number;
  createdAt: string;
}

export interface InvoiceItemInput {
  id?: string;
  title: string;
  categoryId?: string | null;
  quantity: number;
  unit?: string | null;
  unitPrice: number;
}

export interface CreateInvoiceInput {
  title: string;
  description?: string;
  date: string;
  supplier?: string;
  supplierId?: string | null;
  planned?: boolean;
  items: InvoiceItemInput[];
}

export type UpdateInvoiceInput = Partial<CreateInvoiceInput>;

export interface InvoiceListResponse {
  invoices: InvoiceListItem[];
  total: number;
  page: number;
  limit: number;
}
```

- [ ] **Step 2: Реэкспорт в `packages/shared/src/index.ts`** (добавить блок после экспортов expense)

```ts
export type {
  Invoice,
  InvoiceListItem,
  InvoiceItemInput,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  InvoiceListResponse,
} from "./types/invoice";
```

- [ ] **Step 3: Собрать shared**

Run: `pnpm --filter @construction-tracker/shared build`
Expected: успешная компиляция `tsc` без ошибок, обновлён `packages/shared/dist`.

- [ ] **Step 4: Commit**

```bash
git add packages/shared/src/types/invoice.ts packages/shared/src/index.ts
git commit -m "feat(shared): типы Invoice / InvoiceItemInput / Create/Update"
```

---

## Task 3: Backend — список и создание накладной

**Files:**
- Create: `packages/backend/src/app/api/projects/[id]/invoices/route.ts`

- [ ] **Step 1: Создать роут** со следующим содержимым:

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middleware";
import { logAction, getClientIp } from "@/lib/audit";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { id: projectId } = await params;

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: auth.userId },
  });
  if (!project) {
    return NextResponse.json({ error: "Проект не найден" }, { status: 404 });
  }

  const sp = new URL(request.url).searchParams;
  const all = sp.get("all") === "true";
  const page = all ? 1 : Math.max(1, parseInt(sp.get("page") || "1"));
  const limit = all ? 0 : Math.min(100, Math.max(1, parseInt(sp.get("limit") || "25")));

  const [rows, total] = await Promise.all([
    prisma.invoice.findMany({
      where: { projectId },
      include: { items: { select: { amount: true } } },
      orderBy: { date: "desc" },
      ...(all ? {} : { skip: (page - 1) * limit, take: limit }),
    }),
    prisma.invoice.count({ where: { projectId } }),
  ]);

  const invoices = rows.map((inv) => ({
    id: inv.id,
    title: inv.title,
    supplier: inv.supplier,
    date: inv.date,
    planned: inv.planned,
    itemCount: inv.items.length,
    total: inv.items.reduce((s, it) => s + it.amount, 0),
    createdAt: inv.createdAt,
  }));

  return NextResponse.json({ data: { invoices, total, page, limit } });
}

export async function POST(request: NextRequest, { params }: Params) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { id: projectId } = await params;

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: auth.userId },
  });
  if (!project) {
    return NextResponse.json({ error: "Проект не найден" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { title, description, date, supplier, supplierId, planned, items } = body;

    if (!title || !date || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Название, дата и хотя бы одна позиция обязательны" },
        { status: 400 }
      );
    }

    for (const it of items) {
      if (!it.title || it.quantity === undefined || it.unitPrice === undefined) {
        return NextResponse.json(
          { error: "У каждой позиции должны быть название, количество и цена" },
          { status: 400 }
        );
      }
    }

    const invoiceDate = new Date(date);

    const invoice = await prisma.$transaction(async (tx) => {
      const inv = await tx.invoice.create({
        data: {
          title,
          description: description || null,
          date: invoiceDate,
          supplier: supplier || null,
          supplierId: supplierId || null,
          planned: planned ?? false,
          projectId,
        },
      });

      await tx.expense.createMany({
        data: items.map(
          (it: {
            title: string;
            categoryId?: string | null;
            quantity: number;
            unit?: string | null;
            unitPrice: number;
          }) => ({
            type: "MATERIAL",
            title: it.title,
            amount: (it.quantity || 0) * (it.unitPrice || 0),
            quantity: it.quantity ?? null,
            unit: it.unit || null,
            unitPrice: it.unitPrice ?? null,
            supplier: supplier || null,
            supplierId: supplierId || null,
            planned: planned ?? false,
            date: invoiceDate,
            categoryId: it.categoryId || null,
            projectId,
            invoiceId: inv.id,
          })
        ),
      });

      return tx.invoice.findUnique({
        where: { id: inv.id },
        include: { items: { include: { category: true } } },
      });
    });

    logAction({
      userId: auth.userId,
      action: "CREATE",
      entity: "invoice",
      entityId: invoice!.id,
      details: invoice!.title,
      ip: getClientIp(request),
    });

    const total = invoice!.items.reduce((s, it) => s + it.amount, 0);
    return NextResponse.json({ data: { ...invoice, total } }, { status: 201 });
  } catch (error: unknown) {
    console.error("Create invoice error:", error);
    if (error && typeof error === "object" && "code" in error && (error as { code: string }).code === "P2003") {
      return NextResponse.json(
        { error: "Связанная запись (поставщик или категория) не найдена. Возможно, она была удалена." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Проверить сборку backend**

Run: `pnpm --filter backend build`
Expected: `Compiled successfully`, маршрут `/api/projects/[id]/invoices` присутствует в списке роутов, без ошибок типов.

- [ ] **Step 3: Commit**

```bash
git add "packages/backend/src/app/api/projects/[id]/invoices/route.ts"
git commit -m "feat(api): список и создание накладной (POST/GET invoices)"
```

---

## Task 4: Backend — чтение/обновление/удаление накладной

**Files:**
- Create: `packages/backend/src/app/api/invoices/[id]/route.ts`

- [ ] **Step 1: Создать роут** со следующим содержимым:

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middleware";
import { logAction, getClientIp } from "@/lib/audit";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { items: { include: { category: true } }, project: true },
  });
  if (!invoice || invoice.project.userId !== auth.userId) {
    return NextResponse.json({ error: "Накладная не найдена" }, { status: 404 });
  }

  const total = invoice.items.reduce((s, it) => s + it.amount, 0);
  const { project: _project, ...rest } = invoice;
  return NextResponse.json({ data: { ...rest, total } });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { project: true, items: true },
  });
  if (!invoice || invoice.project.userId !== auth.userId) {
    return NextResponse.json({ error: "Накладная не найдена" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { title, description, date, supplier, supplierId, planned, items } = body;

    const invoiceDate = date !== undefined ? new Date(date) : invoice.date;
    const newSupplier = supplier !== undefined ? supplier || null : invoice.supplier;
    const newSupplierId = supplierId !== undefined ? supplierId || null : invoice.supplierId;
    const newPlanned = planned !== undefined ? planned : invoice.planned;

    const result = await prisma.$transaction(async (tx) => {
      await tx.invoice.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description: description || null }),
          ...(date !== undefined && { date: invoiceDate }),
          ...(supplier !== undefined && { supplier: newSupplier }),
          ...(supplierId !== undefined && { supplierId: newSupplierId }),
          ...(planned !== undefined && { planned: newPlanned }),
        },
      });

      if (Array.isArray(items)) {
        const existingIds = invoice.items.map((it) => it.id);
        const keepIds = items.filter((it: { id?: string }) => it.id).map((it: { id?: string }) => it.id as string);
        const toDelete = existingIds.filter((eid) => !keepIds.includes(eid));
        if (toDelete.length) {
          await tx.expense.deleteMany({ where: { id: { in: toDelete }, invoiceId: id } });
        }

        for (const it of items as Array<{
          id?: string;
          title: string;
          categoryId?: string | null;
          quantity: number;
          unit?: string | null;
          unitPrice: number;
        }>) {
          const data = {
            type: "MATERIAL",
            title: it.title,
            amount: (it.quantity || 0) * (it.unitPrice || 0),
            quantity: it.quantity ?? null,
            unit: it.unit || null,
            unitPrice: it.unitPrice ?? null,
            supplier: newSupplier,
            supplierId: newSupplierId,
            planned: newPlanned,
            date: invoiceDate,
            categoryId: it.categoryId || null,
            projectId: invoice.projectId,
            invoiceId: id,
          };
          if (it.id && existingIds.includes(it.id)) {
            await tx.expense.update({ where: { id: it.id }, data });
          } else {
            await tx.expense.create({ data });
          }
        }
      } else {
        // позиции не переданы — обновили только шапку, распространяем общие поля на позиции
        await tx.expense.updateMany({
          where: { invoiceId: id },
          data: { supplier: newSupplier, supplierId: newSupplierId, planned: newPlanned, date: invoiceDate },
        });
      }

      return tx.invoice.findUnique({
        where: { id },
        include: { items: { include: { category: true } } },
      });
    });

    logAction({
      userId: auth.userId,
      action: "UPDATE",
      entity: "invoice",
      entityId: id,
      details: result!.title,
      ip: getClientIp(request),
    });

    const total = result!.items.reduce((s, it) => s + it.amount, 0);
    return NextResponse.json({ data: { ...result, total } });
  } catch (error: unknown) {
    console.error("Update invoice error:", error);
    if (error && typeof error === "object" && "code" in error && (error as { code: string }).code === "P2003") {
      return NextResponse.json(
        { error: "Связанная запись (поставщик или категория) не найдена. Возможно, она была удалена." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { project: true },
  });
  if (!invoice || invoice.project.userId !== auth.userId) {
    return NextResponse.json({ error: "Накладная не найдена" }, { status: 404 });
  }

  await prisma.invoice.delete({ where: { id } }); // позиции удаляются каскадом

  logAction({
    userId: auth.userId,
    action: "DELETE",
    entity: "invoice",
    entityId: id,
    details: invoice.title,
    ip: getClientIp(request),
  });

  return NextResponse.json({ data: { success: true } });
}
```

- [ ] **Step 2: Проверить сборку backend**

Run: `pnpm --filter backend build`
Expected: `Compiled successfully`, маршрут `/api/invoices/[id]` в списке, без ошибок типов.

- [ ] **Step 3: Commit**

```bash
git add "packages/backend/src/app/api/invoices/[id]/route.ts"
git commit -m "feat(api): чтение/обновление/удаление накладной (GET/PUT/DELETE)"
```

---

## Task 5: Frontend — API накладных

**Files:**
- Modify: `packages/frontend/src/services/api.ts`

- [ ] **Step 1: Добавить типы в импорт** из `@construction-tracker/shared` (в существующий список импортируемых типов добавить):

```ts
  Invoice,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  InvoiceListResponse,
```

- [ ] **Step 2: Добавить `invoicesApi`** (после блока `expensesApi`):

```ts
// Invoices
export const invoicesApi = {
  list: (projectId: string, opts: { page?: number; limit?: number; all?: boolean } = {}) => {
    const params: Record<string, string> = {};
    if (opts.all) params.all = "true";
    if (opts.page) params.page = String(opts.page);
    if (opts.limit) params.limit = String(opts.limit);
    return api
      .get<ApiResponse<InvoiceListResponse>>(`/projects/${projectId}/invoices`, { params })
      .then((r) => r.data.data!);
  },
  get: (id: string) =>
    api.get<ApiResponse<Invoice>>(`/invoices/${id}`).then((r) => r.data.data!),
  create: (projectId: string, data: CreateInvoiceInput) =>
    api.post<ApiResponse<Invoice>>(`/projects/${projectId}/invoices`, data).then((r) => r.data.data!),
  update: (id: string, data: UpdateInvoiceInput) =>
    api.put<ApiResponse<Invoice>>(`/invoices/${id}`, data).then((r) => r.data.data!),
  delete: (id: string) => api.delete(`/invoices/${id}`),
};
```

- [ ] **Step 3: Проверить сборку frontend (типы)**

Run: `pnpm --filter frontend build`
Expected: сборка проходит (или падает только на ещё не созданных файлах из последующих задач — на этом шаге `api.ts` должен типизироваться без ошибок). Если хотите изолированную проверку — `pnpm --filter @construction-tracker/shared build` уже сделан в Task 2, типы доступны.

- [ ] **Step 4: Commit**

```bash
git add packages/frontend/src/services/api.ts
git commit -m "feat(api-client): invoicesApi (list/get/create/update/delete)"
```

---

## Task 6: Frontend — InvoiceStore

**Files:**
- Create: `packages/frontend/src/stores/InvoiceStore.ts`
- Modify: `packages/frontend/src/stores/RootStore.ts`

- [ ] **Step 1: Создать `packages/frontend/src/stores/InvoiceStore.ts`**

```ts
import { makeAutoObservable, observable, runInAction } from "mobx";
import type {
  Invoice,
  InvoiceListItem,
  CreateInvoiceInput,
  UpdateInvoiceInput,
} from "@construction-tracker/shared";
import { invoicesApi } from "../services/api";
import { rootStore } from "./RootStore";

export class InvoiceStore {
  invoices: InvoiceListItem[] = [];
  total = 0;
  loading = false;
  projectId: string | null = null;

  // UI: form
  formOpen = false;
  editingInvoice: Invoice | null = null;
  loadingForm = false;

  // UI: confirmations / menu
  deletingInvoice: InvoiceListItem | null = null;
  menuAnchor: HTMLElement | null = null;
  menuInvoice: InvoiceListItem | null = null;

  constructor() {
    makeAutoObservable(this, { menuAnchor: observable.ref }, { autoBind: true });
  }

  async loadInvoices(projectId: string) {
    this.projectId = projectId;
    this.loading = true;
    try {
      const result = await invoicesApi.list(projectId, { all: true });
      runInAction(() => {
        this.invoices = result.invoices;
        this.total = result.total;
        this.loading = false;
      });
    } catch {
      runInAction(() => {
        this.loading = false;
      });
      rootStore.snackbarStore.show("Не удалось загрузить накладные", "error");
    }
  }

  reload() {
    if (this.projectId) this.loadInvoices(this.projectId);
  }

  async createInvoice(projectId: string, data: CreateInvoiceInput) {
    try {
      const inv = await invoicesApi.create(projectId, data);
      rootStore.snackbarStore.show("Накладная создана", "success");
      this.reload();
      return inv;
    } catch (e: any) {
      const msg = e.response?.data?.error || "Не удалось создать накладную";
      rootStore.snackbarStore.show(msg, "error");
      return null;
    }
  }

  async updateInvoice(id: string, data: UpdateInvoiceInput) {
    try {
      const inv = await invoicesApi.update(id, data);
      rootStore.snackbarStore.show("Накладная обновлена", "success");
      this.reload();
      return inv;
    } catch (e: any) {
      const msg = e.response?.data?.error || "Не удалось обновить накладную";
      rootStore.snackbarStore.show(msg, "error");
      return null;
    }
  }

  async deleteInvoice(id: string) {
    try {
      await invoicesApi.delete(id);
      rootStore.snackbarStore.show("Накладная удалена", "success");
      this.reload();
    } catch (e: any) {
      const msg = e.response?.data?.error || "Не удалось удалить накладную";
      rootStore.snackbarStore.show(msg, "error");
    }
  }

  // UI: form
  openAddForm() {
    this.editingInvoice = null;
    this.formOpen = true;
  }

  async openEditForm(item: InvoiceListItem) {
    this.formOpen = true;
    this.loadingForm = true;
    this.editingInvoice = null;
    try {
      const inv = await invoicesApi.get(item.id);
      runInAction(() => {
        this.editingInvoice = inv;
        this.loadingForm = false;
      });
    } catch {
      runInAction(() => {
        this.loadingForm = false;
        this.formOpen = false;
      });
      rootStore.snackbarStore.show("Не удалось загрузить накладную", "error");
    }
  }

  closeForm() {
    this.formOpen = false;
    this.editingInvoice = null;
  }

  // UI: confirmations / menu
  setDeletingInvoice(item: InvoiceListItem | null) {
    this.deletingInvoice = item;
  }

  openMenu(anchor: HTMLElement, item: InvoiceListItem) {
    this.menuAnchor = anchor;
    this.menuInvoice = item;
  }

  closeMenu() {
    this.menuAnchor = null;
    this.menuInvoice = null;
  }
}
```

- [ ] **Step 2: Зарегистрировать стор в `RootStore.ts`**

Добавить импорт (рядом с остальными):
```ts
import { InvoiceStore } from "./InvoiceStore";
```
Добавить поле в класс (после `expenseStore: ExpenseStore;`):
```ts
  invoiceStore: InvoiceStore;
```
Инициализировать в конструкторе (после `this.expenseStore = new ExpenseStore();`):
```ts
    this.invoiceStore = new InvoiceStore();
```

- [ ] **Step 3: Commit**

```bash
git add packages/frontend/src/stores/InvoiceStore.ts packages/frontend/src/stores/RootStore.ts
git commit -m "feat(store): InvoiceStore + регистрация в RootStore"
```

---

## Task 7: Frontend — форма накладной (динамические строки)

**Files:**
- Create: `packages/frontend/src/pages/invoices/InvoiceForm.tsx`

- [ ] **Step 1: Создать `packages/frontend/src/pages/invoices/InvoiceForm.tsx`**

```tsx
import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  FormControlLabel,
  Switch,
  Autocomplete,
  IconButton,
  Typography,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useStore } from "../../stores/RootStore";

interface Row {
  id?: string;
  title: string;
  categoryId: string;
  quantity: string;
  unit: string;
  unitPrice: string;
}

const emptyRow = (): Row => ({ title: "", categoryId: "", quantity: "", unit: "", unitPrice: "" });

const InvoiceForm = observer(() => {
  const { invoiceStore, projectStore, supplierStore } = useStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { formOpen, editingInvoice, loadingForm } = invoiceStore;
  const categories = projectStore.categories.filter((c) => c.type === "MATERIAL");
  const suppliers = supplierStore.suppliers;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [supplier, setSupplier] = useState("");
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [planned, setPlanned] = useState(false);
  const [rows, setRows] = useState<Row[]>([emptyRow()]);

  useEffect(() => {
    if (editingInvoice) {
      setTitle(editingInvoice.title);
      setDescription(editingInvoice.description || "");
      setDate(editingInvoice.date.split("T")[0]);
      setSupplier(editingInvoice.supplier || "");
      setSupplierId(editingInvoice.supplierId || null);
      setPlanned(editingInvoice.planned);
      setRows(
        editingInvoice.items.length
          ? editingInvoice.items.map((it) => ({
              id: it.id,
              title: it.title,
              categoryId: it.categoryId || "",
              quantity: it.quantity != null ? String(it.quantity) : "",
              unit: it.unit || "",
              unitPrice: it.unitPrice != null ? String(it.unitPrice) : "",
            }))
          : [emptyRow()]
      );
    } else {
      setTitle("");
      setDescription("");
      setDate(new Date().toISOString().split("T")[0]);
      setSupplier("");
      setSupplierId(null);
      setPlanned(false);
      setRows([emptyRow()]);
    }
  }, [editingInvoice, formOpen]);

  const updateRow = (i: number, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const addRow = () => setRows((prev) => [...prev, emptyRow()]);
  const removeRow = (i: number) =>
    setRows((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));

  const rowAmount = (r: Row) => (parseFloat(r.quantity) || 0) * (parseFloat(r.unitPrice) || 0);
  const total = rows.reduce((s, r) => s + rowAmount(r), 0);

  const validRows = rows.filter((r) => r.title.trim() && r.quantity && r.unitPrice);
  const canSubmit = Boolean(title.trim() && date && validRows.length > 0);

  const handleSubmit = () => {
    const data = {
      title: title.trim(),
      description: description || undefined,
      date,
      supplier: supplier || undefined,
      supplierId: supplierId || null,
      planned,
      items: validRows.map((r) => ({
        ...(r.id ? { id: r.id } : {}),
        title: r.title.trim(),
        categoryId: r.categoryId || null,
        quantity: parseFloat(r.quantity),
        unit: r.unit || null,
        unitPrice: parseFloat(r.unitPrice),
      })),
    };
    const projectId = projectStore.currentProject!.id;
    const editing = editingInvoice;
    invoiceStore.closeForm();
    if (editing) {
      invoiceStore.updateInvoice(editing.id, data).then(() => projectStore.loadProject(projectId));
    } else {
      invoiceStore.createInvoice(projectId, data).then(() => projectStore.loadProject(projectId));
    }
  };

  return (
    <Dialog open={formOpen} onClose={invoiceStore.closeForm} maxWidth="md" fullWidth fullScreen={isMobile}>
      <DialogTitle>{editingInvoice ? "Редактировать накладную" : "Новая накладная"}</DialogTitle>
      <DialogContent>
        {loadingForm ? (
          <Typography sx={{ py: 4 }}>Загрузка…</Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField label="Название" value={title} onChange={(e) => setTitle(e.target.value)} required fullWidth />
            <TextField
              label="Описание"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={2}
              fullWidth
            />
            <Box sx={{ display: "flex", gap: 2, flexDirection: isMobile ? "column" : "row" }}>
              <Autocomplete
                sx={{ flex: 1 }}
                freeSolo
                options={suppliers}
                getOptionLabel={(o) => (typeof o === "string" ? o : o.name)}
                value={supplierId ? suppliers.find((s) => s.id === supplierId) || supplier : supplier}
                inputValue={supplier}
                onInputChange={(_, value) => {
                  setSupplier(value);
                  const match = suppliers.find((s) => s.name === value);
                  if (!match) setSupplierId(null);
                }}
                onChange={(_, value) => {
                  if (value && typeof value !== "string") {
                    setSupplier(value.name);
                    setSupplierId(value.id);
                  } else if (typeof value === "string") {
                    setSupplier(value);
                    setSupplierId(null);
                  } else {
                    setSupplier("");
                    setSupplierId(null);
                  }
                }}
                renderInput={(params) => <TextField {...params} label="Поставщик" fullWidth />}
              />
              <TextField
                sx={{ flex: 1 }}
                label="Дата"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Box>
            <FormControlLabel
              control={<Switch checked={planned} onChange={(e) => setPlanned(e.target.checked)} />}
              label="Запланированная накладная"
            />

            <Divider>Позиции</Divider>

            {rows.map((r, i) => (
              <Box
                key={i}
                sx={{ display: "flex", gap: 1, alignItems: "flex-start", flexWrap: isMobile ? "wrap" : "nowrap" }}
              >
                <TextField
                  label="Название"
                  value={r.title}
                  onChange={(e) => updateRow(i, { title: e.target.value })}
                  sx={{ flex: 2, minWidth: 140 }}
                />
                <TextField
                  label="Категория"
                  value={r.categoryId}
                  onChange={(e) => updateRow(i, { categoryId: e.target.value })}
                  select
                  sx={{ flex: 1.2, minWidth: 120 }}
                >
                  <MenuItem value="">Без категории</MenuItem>
                  {categories.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Кол-во"
                  type="number"
                  value={r.quantity}
                  onChange={(e) => updateRow(i, { quantity: e.target.value })}
                  sx={{ flex: 0.8, minWidth: 80 }}
                />
                <TextField
                  label="Ед."
                  value={r.unit}
                  onChange={(e) => updateRow(i, { unit: e.target.value })}
                  placeholder="шт"
                  sx={{ flex: 0.7, minWidth: 70 }}
                />
                <TextField
                  label="Цена"
                  type="number"
                  value={r.unitPrice}
                  onChange={(e) => updateRow(i, { unitPrice: e.target.value })}
                  sx={{ flex: 0.9, minWidth: 90 }}
                />
                <TextField
                  label="Сумма"
                  value={rowAmount(r) ? rowAmount(r).toFixed(2) : ""}
                  sx={{ flex: 0.9, minWidth: 90 }}
                  slotProps={{ input: { readOnly: true } }}
                />
                <IconButton onClick={() => removeRow(i)} disabled={rows.length === 1} sx={{ mt: 1 }}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Button startIcon={<AddIcon />} onClick={addRow}>
                Добавить строку
              </Button>
              <Typography variant="h6">Итого: {total.toFixed(2)} ₽</Typography>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={invoiceStore.closeForm} variant="contained">
          Отмена
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!canSubmit || loadingForm}>
          {editingInvoice ? "Сохранить" : "Создать"}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default InvoiceForm;
```

- [ ] **Step 2: Проверить сборку frontend**

Run: `pnpm --filter frontend build`
Expected: компонент типизируется без ошибок (страница, импортирующая его, появится в Task 8 — на этом шаге достаточно отсутствия ошибок типов в самом файле; полная сборка завершится после Task 8).

- [ ] **Step 3: Commit**

```bash
git add packages/frontend/src/pages/invoices/InvoiceForm.tsx
git commit -m "feat(ui): форма накладной с динамическими строками позиций"
```

---

## Task 8: Frontend — страница списка, маршрут и кнопка

**Files:**
- Create: `packages/frontend/src/pages/invoices/InvoicesPage.tsx`
- Modify: `packages/frontend/src/App.tsx`
- Modify: `packages/frontend/src/pages/projects/ProjectPage.tsx`

- [ ] **Step 1: Создать `packages/frontend/src/pages/invoices/InvoicesPage.tsx`**

```tsx
import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Button,
  Breadcrumbs,
  Link,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useStore } from "../../stores/RootStore";
import AppProgress from "@/components/AppProgress";
import InvoiceForm from "./InvoiceForm";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB" }).format(amount);
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString("ru-RU");
}

const InvoicesPage = observer(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { invoiceStore, projectStore, supplierStore } = useStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (id) {
      projectStore.loadProject(id);
      invoiceStore.loadInvoices(id);
    }
    supplierStore.loadSuppliers();
  }, [id, invoiceStore, projectStore, supplierStore]);

  const project = projectStore.currentProject;
  const { invoices, menuAnchor, menuInvoice, deletingInvoice } = invoiceStore;

  return (
    <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 } }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" sx={{ cursor: "pointer" }} onClick={() => navigate("/projects")}>
          Проекты
        </Link>
        <Link underline="hover" color="inherit" sx={{ cursor: "pointer" }} onClick={() => navigate(`/projects/${id}`)}>
          {project?.name || "Проект"}
        </Link>
        <Typography color="text.primary">Накладные</Typography>
      </Breadcrumbs>

      {invoiceStore.loading && <AppProgress />}

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, gap: 1 }}>
        <Typography variant={isMobile ? "h5" : "h4"}>Накладные</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={invoiceStore.openAddForm}>
          Создать накладную
        </Button>
      </Box>

      {invoices.length === 0 && !invoiceStore.loading ? (
        <Typography color="text.secondary">Накладных пока нет</Typography>
      ) : (
        <Paper>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Дата</TableCell>
                <TableCell>Название</TableCell>
                {!isMobile && <TableCell>Поставщик</TableCell>}
                <TableCell align="right">Позиций</TableCell>
                <TableCell align="right">Итого</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow
                  key={inv.id}
                  hover
                  sx={{ cursor: "pointer", opacity: inv.planned ? 0.7 : 1 }}
                  onClick={() => invoiceStore.openEditForm(inv)}
                >
                  <TableCell>{formatDate(inv.date)}</TableCell>
                  <TableCell>{inv.title}</TableCell>
                  {!isMobile && <TableCell>{inv.supplier || "—"}</TableCell>}
                  <TableCell align="right">{inv.itemCount}</TableCell>
                  <TableCell align="right">{formatCurrency(inv.total)}</TableCell>
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <IconButton size="small" onClick={(e) => invoiceStore.openMenu(e.currentTarget, inv)}>
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={invoiceStore.closeMenu}>
        <MenuItem
          onClick={() => {
            const inv = menuInvoice!;
            invoiceStore.closeMenu();
            invoiceStore.openEditForm(inv);
          }}
        >
          Открыть
        </MenuItem>
        <MenuItem
          onClick={() => {
            const inv = menuInvoice!;
            invoiceStore.closeMenu();
            invoiceStore.setDeletingInvoice(inv);
          }}
        >
          Удалить
        </MenuItem>
      </Menu>

      <Dialog open={Boolean(deletingInvoice)} onClose={() => invoiceStore.setDeletingInvoice(null)}>
        <DialogTitle>Удалить накладную?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Накладная «{deletingInvoice?.title}» и все её позиции ({deletingInvoice?.itemCount}) будут удалены.
            Действие необратимо.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => invoiceStore.setDeletingInvoice(null)}>Отмена</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              const inv = deletingInvoice!;
              invoiceStore.setDeletingInvoice(null);
              invoiceStore.deleteInvoice(inv.id).then(() => id && projectStore.loadProject(id));
            }}
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      <InvoiceForm />
    </Container>
  );
});

export default InvoicesPage;
```

- [ ] **Step 2: Зарегистрировать маршрут в `App.tsx`**

Добавить импорт рядом с другими страницами:
```ts
import InvoicesPage from "./pages/invoices/InvoicesPage";
```
Добавить маршрут сразу после строки с `/projects/:id/expenses`:
```tsx
          <Route path="/projects/:id/invoices" element={<InvoicesPage />} />
```

- [ ] **Step 3: Добавить кнопку «Накладные» на `ProjectPage.tsx`**

В блоке кнопок (рядом с кнопкой «Расходы», внутри `<Box sx={{ display: "flex", gap: 2, ... }}>`) добавить перед кнопкой «Расходы»:
```tsx
              <Button
                variant="contained"
                fullWidth={isMobile}
                onClick={() => navigate(`/projects/${id}/invoices`)}
              >
                <TableViewIcon sx={{ mr: 1 }} />
                Накладные
              </Button>
```
(`TableViewIcon` уже импортирован в `ProjectPage.tsx`; иконка переиспользуется. При желании можно импортировать отдельную, напр. `ReceiptLongIcon` из `@mui/icons-material/ReceiptLong`, и использовать её вместо `TableViewIcon`.)

- [ ] **Step 4: Полная сборка фронтенда**

Run: `pnpm --filter frontend build`
Expected: `built in ...` без ошибок типов; в выводе присутствует бандл.

- [ ] **Step 5: Commit**

```bash
git add packages/frontend/src/pages/invoices/InvoicesPage.tsx packages/frontend/src/App.tsx packages/frontend/src/pages/projects/ProjectPage.tsx
git commit -m "feat(ui): страница накладных, маршрут и кнопка на странице проекта"
```

---

## Task 9: Сквозная проверка

**Files:** —

- [ ] **Step 1: Полная сборка монорепо**

Run: `pnpm build`
Expected: shared → backend → frontend собираются без ошибок.

- [ ] **Step 2: Запустить приложение**

Run: `pnpm dev` (backend :3001, frontend :5173). Войти, открыть проект.

- [ ] **Step 3: Создать накладную**

На странице проекта нажать «Накладные» → «Создать накладную». Заполнить шапку (название, поставщик, дата), добавить 2+ строки (название/категория/кол-во/единица/цена). Проверить: «Сумма» в строке и «Итого» считаются вживую. Сохранить.
Expected: накладная появилась в списке с верным «Итого» и числом позиций.

- [ ] **Step 4: Проверить попадание в расходы и сводки**

Открыть «Расходы» проекта — позиции накладной видны как обычные материальные расходы. На странице проекта «Материалы» и график «по категориям» выросли на сумму накладной.
Expected: суммы совпадают с «Итого» накладной.

- [ ] **Step 5: Редактирование**

Открыть накладную из списка → добавить строку, изменить цену существующей, удалить одну строку → «Сохранить».
Expected: «Итого» и список расходов обновились корректно; число расходов проекта изменилось соответственно (добавленная позиция появилась, удалённая исчезла).

- [ ] **Step 6: Удаление (cascade)**

Через меню строки списка → «Удалить» → подтвердить.
Expected: накладная исчезла; все её позиции пропали из расходов; «Материалы»/сводки уменьшились на «Итого».

- [ ] **Step 7 (опц.): Smoke-проверка прав через curl**

Получить токен: `POST /api/auth/login`. С токеном `GET /api/projects/<id>/invoices` → 200. Без токена → 401. `GET /api/invoices/<чужой-id>` другим пользователем → 404.

- [ ] **Step 8: Финальный коммит (если остались правки) и отметка готовности**

```bash
git status
# при необходимости — git add -A && git commit -m "chore: доработки по итогам проверки накладных"
```

---

## Деплой (после приёмки)

Накладные требуют миграции БД на сервере. Деплой проекта (`pnpm db:push` + `prisma generate` + `pnpm build` + `pm2 restart ct-backend`) выполняется штатной процедурой деплоя. Перед деплоем влить `feature/invoices` в `master` и запушить `origin/master` (деплой тянет `master`).
