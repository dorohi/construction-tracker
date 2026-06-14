# Накладные (invoices) — дизайн

Дата: 2026-06-14

## Контекст

Сейчас расходы (`Expense`) вводятся по одному. Пользователю нужно вносить **закупку материалов одной накладной**: один документ с общей шапкой (поставщик, дата) и **множеством позиций номенклатуры**, у каждой своё количество, единица, цена за единицу; всё суммируется в итог.

Цель: добавить сущность **«Накладная»** — документ-группу материальных расходов, которую можно создать с произвольным числом позиций (динамическое «+ добавить строку»), затем **открыть и отредактировать целиком** (добавить/изменить/удалить позиции, удалить всю накладную). При этом позиции остаются обычными материальными расходами и автоматически попадают в общие списки расходов, сводки, графики и фильтры — существующая логика сумм не меняется.

Решения зафиксированы с пользователем:
- Накладная — **отдельный постоянный документ** (не просто пакетный ввод): открывается и правится целиком.
- Позиции — **только материалы** (`type = MATERIAL`).
- **Шапка (общее):** название, описание, дата, поставщик, план/факт, итого (авто).
- **Позиция (строка):** название (номенклатура), категория, количество, единица, цена за единицу, сумма (авто = кол-во × цена).
- Номер накладной не нужен (заменён полем «название»).

## Принятый подход

**Позиция накладной = обычный `Expense`** с `type = MATERIAL` и новым полем `invoiceId`. Шапка хранится в новой модели `Invoice`. Это переиспользует всю текущую логику расходов (сводки `materialTotal`/`byCategory`, графики, фильтры, таблица) без дублирования.

**Отвергнутая альтернатива:** отдельная таблица `InvoiceItem` (позиции не являются расходами). Тогда позиции не попадают в существующие расходы/сводки без дублирования агрегаций — противоречит требованию «позиции видны в общих расходах».

## Модель данных (Prisma)

`packages/backend/prisma/schema.prisma`

Новая модель:
```prisma
model Invoice {
  id          String    @id @default(cuid())
  title       String                      // название накладной
  description String?
  date        DateTime
  supplier    String?                     // текст поставщика (как в Expense)
  supplierId  String?
  supplierRef Supplier? @relation(fields: [supplierId], references: [id])
  planned     Boolean   @default(false)   // план/факт — общий на накладную
  project     Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  projectId   String
  items       Expense[]
  createdAt   DateTime  @default(now())
}
```

В модель `Expense` добавить:
```prisma
  invoiceId String?
  invoice   Invoice? @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
```
- `onDelete: Cascade`: удаление накладной удаляет её позиции.
- Добавить обратную связь `invoices Invoice[]` в модели `Supplier` и `Project` (Prisma требует обратную сторону связи).

**«Итого» в БД не храним** — вычисляем как сумму `amount` позиций при чтении (исключает рассинхрон).

Применение: `pnpm db:push` + `prisma generate` (так же делает деплой на VPS).

## Бэкенд API

Формат ответа — как везде: `{ data }` / `{ error }`. Проверка прав — как в существующих маршрутах расходов (через `project.userId`, см. `app/api/projects/[id]/expenses/route.ts` и `app/api/expenses/[id]/route.ts`).

- `POST /api/projects/[id]/invoices` — создать накладную.
  - Тело: `{ title, description?, date, supplier?, supplierId?, planned?, items: InvoiceItemInput[] }`.
  - Валидация: `title`, `date`, непустой `items` (≥1). У каждой позиции — `title`, `quantity > 0`, `unitPrice >= 0`.
  - В **транзакции**: создаём `Invoice`, затем N `Expense` (`type=MATERIAL`, `invoiceId`, наследуют `date`, `supplier`, `supplierId`, `planned` из шапки; `amount = quantity * unitPrice` считается **на сервере**; своя `categoryId`, `quantity`, `unit`, `unitPrice`, `title`).
  - `AuditLog` — одна запись на накладную.
- `GET /api/projects/[id]/invoices` — список накладных проекта: `{ id, title, supplier, date, planned, itemCount, total, createdAt }`. Пагинация как у расходов (page/limit/all).
- `GET /api/invoices/[id]` — накладная с позициями и вычисленным `total`.
- `PUT /api/invoices/[id]` — обновить шапку и **синхронизировать позиции** в транзакции:
  - позиции с `id` → обновить; без `id` → создать; отсутствующие в запросе → удалить;
  - при изменении шапки (date/supplier/planned) — обновить эти поля у всех позиций;
  - пересчёт `amount` каждой позиции на сервере.
- `DELETE /api/invoices/[id]` — удалить накладную и её позиции (cascade), `AuditLog`.

Маршруты: `app/api/projects/[id]/invoices/route.ts` (GET, POST), `app/api/invoices/[id]/route.ts` (GET, PUT, DELETE).

## Shared-типы

`packages/shared/src/types/invoice.ts` (+ реэкспорт из `index.ts`):
```ts
export interface Invoice {
  id: string;
  title: string;
  description?: string | null;
  date: string;
  supplier?: string | null;
  supplierId?: string | null;
  planned: boolean;
  projectId: string;
  items: Expense[];     // позиции (MATERIAL-расходы)
  total: number;        // вычисляется на сервере
  createdAt: string;
}

export interface InvoiceListItem {
  id: string; title: string; supplier?: string | null;
  date: string; planned: boolean; itemCount: number; total: number; createdAt: string;
}

export interface InvoiceItemInput {
  id?: string;          // есть у существующих позиций при редактировании
  title: string;
  categoryId?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
}

export interface CreateInvoiceInput {
  title: string; description?: string; date: string;
  supplier?: string; supplierId?: string; planned?: boolean;
  items: InvoiceItemInput[];
}

export interface UpdateInvoiceInput extends Partial<CreateInvoiceInput> {}
```

## Фронтенд

- **Раздел «Накладные»** на странице проекта (рядом с расходами): список накладных (дата, название, поставщик, кол-во позиций, итого) + кнопка «Создать накладную»; меню строки (открыть / удалить).
- **`InvoiceForm`** (диалог):
  - Шапка: название, описание, дата, поставщик (Autocomplete — переиспользовать из `ExpenseForm`), переключатель план/факт.
  - Таблица позиций: строки `[название | категория | кол-во | ед. | цена | сумма(авто) | ✕]`; кнопка «+ добавить строку»; внизу живой пересчёт «Итого».
  - Переиспользовать из `ExpenseForm`: Autocomplete поставщика, выбор категории (тип `MATERIAL`), ввод единицы, авторасчёт суммы.
  - Открытие существующей накладной → та же форма, предзаполнена; правка строк и сохранение (PUT).
- **`InvoiceStore`** (MobX) — по образцу `ExpenseStore`: `loadInvoices`, `getInvoice`, `createInvoice`, `updateInvoice`, `deleteInvoice`; обновлять связанные расходы/сводку после изменений (вызывать перезагрузку `ExpenseStore`/summary).
- Позиции остаются и в обычной таблице расходов (это MATERIAL-расходы). Значок «из накладной» в таблице расходов — **вне объёма** (можно добавить позже).

## Сводки/итоги

Без изменений: позиции — это `MATERIAL`-расходы, уже учитываются в `materialTotal`, `byCategory`, графиках, фильтрах. Endpoint `summary` не трогаем.

## Edge cases и правила

- Накладная без позиций запрещена (минимум 1 позиция).
- `amount` позиции и `total` накладной считаются **только на сервере** (фронт показывает предварительно).
- Шапка задаёт `date`/`supplier`/`planned` для всех позиций; индивидуально у позиции эти поля не редактируются в форме накладной.
- Отдельное редактирование/удаление позиции через обычную форму расхода остаётся возможным; `total` пересчитывается из позиций, поэтому рассинхрона нет.
- Удаление накладной удаляет все её позиции (cascade) — подтверждение в UI.

## Вне объёма

- Типы позиций кроме `MATERIAL` (работа/инструмент/доставка).
- Разный поставщик у разных позиций.
- Печать/экспорт накладной (PDF), складской учёт/остатки, номер накладной как отдельное поле.

## Проверка (end-to-end)

1. `pnpm db:push` + `prisma generate`, `pnpm build` — без ошибок.
2. Создать накладную с 2+ позициями разных категорий → появляется в списке накладных с верным итого.
3. Позиции видны в обычной таблице расходов; `materialTotal` и графики выросли на сумму накладной.
4. Открыть накладную → добавить строку, изменить цену, удалить строку → сохранить → итого и расходы обновились корректно.
5. Удалить накладную → все её позиции исчезли из расходов, сводка уменьшилась.
6. Проверка прав: чужой пользователь не видит/не меняет накладную.
