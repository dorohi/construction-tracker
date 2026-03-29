import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Find or create demo user
  let user = await prisma.user.findFirst({ where: { email: "demo@demo.com" } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "demo@demo.com",
        passwordHash: await bcrypt.hash("demo123", 10),
        name: "Демо Строитель",
        isAdmin: false,
      },
    });
    console.log("Created demo user: demo@demo.com / demo123");
  } else {
    console.log("Demo user already exists");
  }

  const userId = user.id;

  // --- Suppliers ---
  const suppliers = await Promise.all([
    prisma.supplier.create({ data: { name: "СтройМатериалы Плюс", contactName: "Иванов Сергей", phone: "+7 (495) 123-45-67", address: "Москва, ул. Строителей 15", hasDelivery: true, isFavorite: true, userId } }),
    prisma.supplier.create({ data: { name: "ЛесТорг", contactName: "Петров Алексей", phone: "+7 (495) 234-56-78", address: "Подольск, ул. Лесная 8", hasDelivery: true, userId } }),
    prisma.supplier.create({ data: { name: "Кровля-Мастер", contactName: "Козлов Дмитрий", phone: "+7 (495) 345-67-89", address: "Мытищи, ул. Промышленная 22", hasDelivery: false, userId } }),
    prisma.supplier.create({ data: { name: "Бетон-Центр", contactName: "Смирнов Андрей", phone: "+7 (495) 456-78-90", address: "Химки, Ленинградское ш. 5", hasDelivery: true, isFavorite: true, userId } }),
    prisma.supplier.create({ data: { name: "ЭлектроСнаб", contactName: "Новиков Роман", phone: "+7 (495) 567-89-01", address: "Москва, ул. Энергетиков 3", hasDelivery: false, userId } }),
    prisma.supplier.create({ data: { name: "СантехПро", contactName: "Волков Михаил", phone: "+7 (495) 678-90-12", address: "Реутов, ул. Водопроводная 11", hasDelivery: true, userId } }),
    prisma.supplier.create({ data: { name: "Керамика и Плитка", contactName: "Зайцев Игорь", phone: "+7 (495) 789-01-23", address: "Москва, Каширское ш. 40", hasDelivery: true, userId } }),
  ]);
  console.log(`Created ${suppliers.length} suppliers`);

  // --- Carriers ---
  const carriers = await Promise.all([
    prisma.carrier.create({ data: { name: "ГрузовикСервис", phone: "+7 (495) 111-22-33", vehicle: "КАМАЗ 65115", licensePlate: "А123БВ77", isFavorite: true, userId } }),
    prisma.carrier.create({ data: { name: "Газель-Экспресс", phone: "+7 (495) 222-33-44", vehicle: "ГАЗель NEXT", licensePlate: "К456МН50", userId } }),
    prisma.carrier.create({ data: { name: "МаниЛифт", phone: "+7 (495) 333-44-55", vehicle: "Манипулятор HIAB", licensePlate: "Е789ОП77", userId } }),
    prisma.carrier.create({ data: { name: "СамосвалПром", phone: "+7 (495) 444-55-66", vehicle: "Самосвал МАЗ", licensePlate: "Т012УФ50", userId } }),
  ]);
  console.log(`Created ${carriers.length} carriers`);

  // --- Workers ---
  const workers = await Promise.all([
    prisma.worker.create({ data: { name: "Каменев Николай", phone: "+7 (916) 100-10-01", specialty: "Каменщик", isFavorite: true, userId } }),
    prisma.worker.create({ data: { name: "Плотников Виктор", phone: "+7 (916) 200-20-02", specialty: "Плотник", isFavorite: true, userId } }),
    prisma.worker.create({ data: { name: "Электриков Павел", phone: "+7 (916) 300-30-03", specialty: "Электрик", userId } }),
    prisma.worker.create({ data: { name: "Трубников Олег", phone: "+7 (916) 400-40-04", specialty: "Сантехник", userId } }),
    prisma.worker.create({ data: { name: "Штукатуров Артём", phone: "+7 (916) 500-50-05", specialty: "Штукатур-маляр", userId } }),
    prisma.worker.create({ data: { name: "Кровельщиков Иван", phone: "+7 (916) 600-60-06", specialty: "Кровельщик", userId } }),
    prisma.worker.create({ data: { name: "Бетонов Сергей", phone: "+7 (916) 700-70-07", specialty: "Бетонщик", userId } }),
    prisma.worker.create({ data: { name: "Копаев Руслан", phone: "+7 (916) 800-80-08", specialty: "Разнорабочий", userId } }),
  ]);
  console.log(`Created ${workers.length} workers`);

  // --- Helper to create project with categories ---
  async function createProject(name: string, description: string, budget: number | null, isPublic: boolean) {
    const project = await prisma.project.create({
      data: {
        name,
        description,
        budget,
        userId,
        isPublic,
        shareToken: isPublic ? name.toLowerCase().replace(/[^a-zа-яё0-9]/gi, "").slice(0, 12) + Math.random().toString(36).slice(2, 6) : null,
      },
    });

    const catMap: Record<string, string> = {};
    const materialCats = ["Фундамент", "Стены", "Кровля", "Сантехника", "Электрика", "Отделка"];
    const laborCats = ["Каменные работы", "Сантехнические работы", "Электромонтажные работы", "Разнорабочие"];
    const deliveryCats = ["Доставка материалов", "Доставка оборудования"];
    const toolCats = ["Ручной инструмент", "Электроинструмент", "Измерительный инструмент", "Расходники для инструмента"];

    for (const name of materialCats) {
      const c = await prisma.category.create({ data: { name, type: "MATERIAL", projectId: project.id } });
      catMap[name] = c.id;
    }
    for (const name of laborCats) {
      const c = await prisma.category.create({ data: { name, type: "LABOR", projectId: project.id } });
      catMap[name] = c.id;
    }
    for (const name of deliveryCats) {
      const c = await prisma.category.create({ data: { name, type: "DELIVERY", projectId: project.id } });
      catMap[name] = c.id;
    }
    for (const name of toolCats) {
      const c = await prisma.category.create({ data: { name, type: "TOOL", projectId: project.id } });
      catMap[name] = c.id;
    }

    return { project, catMap };
  }

  function d(daysAgo: number) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date;
  }

  // =====================================================
  // 1. БЕСЕДКА — начало (10% бюджета потрачено)
  // =====================================================
  {
    const { project, catMap } = await createProject("Беседка", "Деревянная беседка 4x4м с мангальной зоной", 350000, true);
    const expenses = [
      // Фундамент — только начали
      { type: "MATERIAL", title: "Цемент М500", amount: 4500, quantity: 10, unit: "мешок", unitPrice: 450, supplier: suppliers[3].name, supplierId: suppliers[3].id, categoryId: catMap["Фундамент"], date: d(5) },
      { type: "MATERIAL", title: "Песок строительный", amount: 3500, quantity: 2, unit: "м³", unitPrice: 1750, supplier: suppliers[0].name, supplierId: suppliers[0].id, categoryId: catMap["Фундамент"], date: d(5) },
      { type: "MATERIAL", title: "Щебень 20-40", amount: 4200, quantity: 3, unit: "м³", unitPrice: 1400, supplier: suppliers[0].name, supplierId: suppliers[0].id, categoryId: catMap["Фундамент"], date: d(4) },
      { type: "MATERIAL", title: "Арматура 12мм", amount: 7800, quantity: 100, unit: "м.п.", unitPrice: 78, supplier: suppliers[0].name, supplierId: suppliers[0].id, categoryId: catMap["Фундамент"], date: d(4) },
      { type: "LABOR", title: "Разметка и копка", amount: 8000, hoursWorked: 16, hourlyRate: 500, worker: workers[7].name, workerId: workers[7].id, categoryId: catMap["Разнорабочие"], date: d(3) },
      { type: "DELIVERY", title: "Доставка стройматериалов", amount: 5000, carrier: carriers[1].name, carrierId: carriers[1].id, categoryId: catMap["Доставка материалов"], date: d(5) },
      // Запланировано
      { type: "MATERIAL", title: "Брус 150x150 (сосна)", amount: 45000, quantity: 2, unit: "м³", unitPrice: 22500, categoryId: catMap["Стены"], date: d(0), planned: true },
      { type: "MATERIAL", title: "Доска обрезная 50x150", amount: 28000, quantity: 2, unit: "м³", unitPrice: 14000, categoryId: catMap["Кровля"], date: d(0), planned: true },
      { type: "MATERIAL", title: "Металлочерепица", amount: 32000, quantity: 20, unit: "м²", unitPrice: 1600, categoryId: catMap["Кровля"], date: d(0), planned: true },
      { type: "LABOR", title: "Монтаж каркаса", amount: 40000, hoursWorked: 40, hourlyRate: 1000, categoryId: catMap["Каменные работы"], date: d(0), planned: true },
    ];
    for (const e of expenses) {
      await prisma.expense.create({
        data: {
          type: e.type,
          title: e.title,
          amount: e.amount,
          quantity: e.quantity || null,
          unit: e.unit || null,
          unitPrice: e.unitPrice || null,
          supplier: e.supplier || null,
          supplierId: e.supplierId || null,
          carrier: e.carrier || null,
          carrierId: e.carrierId || null,
          worker: e.worker || null,
          workerId: e.workerId || null,
          hoursWorked: e.hoursWorked || null,
          hourlyRate: e.hourlyRate || null,
          planned: e.planned || false,
          date: e.date,
          categoryId: e.categoryId,
          projectId: project.id,
        },
      });
    }
    console.log(`Created: ${project.name} (начало)`);
  }

  // =====================================================
  // 2. БАССЕЙН — в работе (40% бюджета)
  // =====================================================
  {
    const { project, catMap } = await createProject("Бассейн", "Бетонный бассейн 8x4м с подогревом и фильтрацией", 2500000, true);
    const expenses = [
      // Фундамент / чаша — сделано
      { type: "MATERIAL", title: "Бетон М350 (чаша)", amount: 180000, quantity: 24, unit: "м³", unitPrice: 7500, supplier: suppliers[3].name, supplierId: suppliers[3].id, categoryId: catMap["Фундамент"], date: d(45) },
      { type: "MATERIAL", title: "Арматура 14мм", amount: 67000, quantity: 800, unit: "м.п.", unitPrice: 83.75, supplier: suppliers[0].name, supplierId: suppliers[0].id, categoryId: catMap["Фундамент"], date: d(44) },
      { type: "MATERIAL", title: "Гидроизоляция Ceresit", amount: 42000, quantity: 14, unit: "ведро", unitPrice: 3000, supplier: suppliers[0].name, supplierId: suppliers[0].id, categoryId: catMap["Фундамент"], date: d(30) },
      { type: "MATERIAL", title: "Опалубка (аренда)", amount: 35000, quantity: 1, unit: "комплект", unitPrice: 35000, supplier: suppliers[0].name, supplierId: suppliers[0].id, categoryId: catMap["Фундамент"], date: d(44) },
      { type: "MATERIAL", title: "Плитка мозаичная (чаша)", amount: 96000, quantity: 40, unit: "м²", unitPrice: 2400, supplier: suppliers[6].name, supplierId: suppliers[6].id, categoryId: catMap["Отделка"], date: d(20) },
      { type: "MATERIAL", title: "Клей для плитки", amount: 12000, quantity: 24, unit: "мешок", unitPrice: 500, supplier: suppliers[6].name, supplierId: suppliers[6].id, categoryId: catMap["Отделка"], date: d(20) },
      // Сантехника — в процессе
      { type: "MATERIAL", title: "Фильтровальная станция Emaux", amount: 85000, quantity: 1, unit: "шт.", unitPrice: 85000, supplier: suppliers[5].name, supplierId: suppliers[5].id, categoryId: catMap["Сантехника"], date: d(15) },
      { type: "MATERIAL", title: "Насос циркуляционный", amount: 45000, quantity: 1, unit: "шт.", unitPrice: 45000, supplier: suppliers[5].name, supplierId: suppliers[5].id, categoryId: catMap["Сантехника"], date: d(15) },
      { type: "MATERIAL", title: "Трубы ПВХ 63мм", amount: 18000, quantity: 60, unit: "м.п.", unitPrice: 300, supplier: suppliers[5].name, supplierId: suppliers[5].id, categoryId: catMap["Сантехника"], date: d(14) },
      { type: "MATERIAL", title: "Скиммер + форсунки", amount: 32000, quantity: 1, unit: "комплект", unitPrice: 32000, supplier: suppliers[5].name, supplierId: suppliers[5].id, categoryId: catMap["Сантехника"], date: d(14) },
      // Электрика
      { type: "MATERIAL", title: "Подогрев (теплообменник)", amount: 68000, quantity: 1, unit: "шт.", unitPrice: 68000, supplier: suppliers[4].name, supplierId: suppliers[4].id, categoryId: catMap["Электрика"], date: d(10) },
      { type: "MATERIAL", title: "Подводное освещение LED", amount: 24000, quantity: 4, unit: "шт.", unitPrice: 6000, supplier: suppliers[4].name, supplierId: suppliers[4].id, categoryId: catMap["Электрика"], date: d(10) },
      // Работы
      { type: "LABOR", title: "Земляные работы (котлован)", amount: 80000, hoursWorked: 40, hourlyRate: 2000, worker: workers[7].name, workerId: workers[7].id, categoryId: catMap["Разнорабочие"], date: d(50) },
      { type: "LABOR", title: "Бетонные работы (чаша)", amount: 120000, hoursWorked: 80, hourlyRate: 1500, worker: workers[6].name, workerId: workers[6].id, categoryId: catMap["Каменные работы"], date: d(42) },
      { type: "LABOR", title: "Гидроизоляция", amount: 35000, hoursWorked: 35, hourlyRate: 1000, worker: workers[6].name, workerId: workers[6].id, categoryId: catMap["Каменные работы"], date: d(28) },
      { type: "LABOR", title: "Облицовка плиткой", amount: 48000, hoursWorked: 48, hourlyRate: 1000, worker: workers[4].name, workerId: workers[4].id, categoryId: catMap["Каменные работы"], date: d(18) },
      { type: "LABOR", title: "Монтаж фильтрации", amount: 25000, hoursWorked: 25, hourlyRate: 1000, worker: workers[3].name, workerId: workers[3].id, categoryId: catMap["Сантехнические работы"], date: d(12) },
      // Доставки
      { type: "DELIVERY", title: "Доставка бетона (миксер)", amount: 15000, carrier: carriers[0].name, carrierId: carriers[0].id, categoryId: catMap["Доставка материалов"], date: d(45) },
      { type: "DELIVERY", title: "Доставка оборудования", amount: 8000, carrier: carriers[1].name, carrierId: carriers[1].id, categoryId: catMap["Доставка оборудования"], date: d(15) },
      { type: "DELIVERY", title: "Вывоз грунта", amount: 25000, carrier: carriers[3].name, carrierId: carriers[3].id, categoryId: catMap["Доставка материалов"], date: d(49) },
      // Запланировано
      { type: "MATERIAL", title: "Бортовой камень", amount: 35000, quantity: 20, unit: "м.п.", unitPrice: 1750, categoryId: catMap["Отделка"], date: d(0), planned: true },
      { type: "MATERIAL", title: "Ограждение стеклянное", amount: 120000, quantity: 12, unit: "м.п.", unitPrice: 10000, categoryId: catMap["Отделка"], date: d(0), planned: true },
      { type: "LABOR", title: "Монтаж подогрева", amount: 30000, hoursWorked: 30, hourlyRate: 1000, categoryId: catMap["Электромонтажные работы"], date: d(0), planned: true },
      { type: "LABOR", title: "Пусконаладочные работы", amount: 15000, hoursWorked: 10, hourlyRate: 1500, categoryId: catMap["Сантехнические работы"], date: d(0), planned: true },
    ];
    for (const e of expenses) {
      await prisma.expense.create({
        data: {
          type: e.type, title: e.title, amount: e.amount,
          quantity: e.quantity || null, unit: e.unit || null, unitPrice: e.unitPrice || null,
          supplier: e.supplier || null, supplierId: e.supplierId || null,
          carrier: e.carrier || null, carrierId: e.carrierId || null,
          worker: e.worker || null, workerId: e.workerId || null,
          hoursWorked: e.hoursWorked || null, hourlyRate: e.hourlyRate || null,
          planned: e.planned || false, date: e.date,
          categoryId: e.categoryId, projectId: project.id,
        },
      });
    }
    console.log(`Created: ${project.name} (в работе ~40%)`);
  }

  // =====================================================
  // 3. ДОМ — в работе (55% бюджета)
  // =====================================================
  {
    const { project, catMap } = await createProject("Дом", "Двухэтажный кирпичный дом 180м², 4 спальни, 2 санузла", 12000000, true);
    const expenses = [
      // Фундамент — готов
      { type: "MATERIAL", title: "Бетон М400 (фундамент)", amount: 375000, quantity: 50, unit: "м³", unitPrice: 7500, supplier: suppliers[3].name, supplierId: suppliers[3].id, categoryId: catMap["Фундамент"], date: d(180) },
      { type: "MATERIAL", title: "Арматура 16мм", amount: 156000, quantity: 2000, unit: "м.п.", unitPrice: 78, supplier: suppliers[0].name, supplierId: suppliers[0].id, categoryId: catMap["Фундамент"], date: d(178) },
      { type: "MATERIAL", title: "Геотекстиль", amount: 18000, quantity: 200, unit: "м²", unitPrice: 90, supplier: suppliers[0].name, supplierId: suppliers[0].id, categoryId: catMap["Фундамент"], date: d(182) },
      { type: "MATERIAL", title: "Гидроизоляция фундамента", amount: 45000, quantity: 15, unit: "рулон", unitPrice: 3000, supplier: suppliers[0].name, supplierId: suppliers[0].id, categoryId: catMap["Фундамент"], date: d(170) },
      // Стены — готовы
      { type: "MATERIAL", title: "Кирпич облицовочный", amount: 480000, quantity: 12000, unit: "шт.", unitPrice: 40, supplier: suppliers[0].name, supplierId: suppliers[0].id, categoryId: catMap["Стены"], date: d(150) },
      { type: "MATERIAL", title: "Кирпич рядовой", amount: 320000, quantity: 16000, unit: "шт.", unitPrice: 20, supplier: suppliers[0].name, supplierId: suppliers[0].id, categoryId: catMap["Стены"], date: d(150) },
      { type: "MATERIAL", title: "Раствор кладочный", amount: 95000, quantity: 19, unit: "м³", unitPrice: 5000, supplier: suppliers[3].name, supplierId: suppliers[3].id, categoryId: catMap["Стены"], date: d(145) },
      { type: "MATERIAL", title: "Утеплитель Rockwool 100мм", amount: 72000, quantity: 360, unit: "м²", unitPrice: 200, supplier: suppliers[0].name, supplierId: suppliers[0].id, categoryId: catMap["Стены"], date: d(120) },
      { type: "MATERIAL", title: "Перемычки ж/б", amount: 65000, quantity: 24, unit: "шт.", unitPrice: 2708, supplier: suppliers[0].name, supplierId: suppliers[0].id, categoryId: catMap["Стены"], date: d(140) },
      // Кровля — готова
      { type: "MATERIAL", title: "Стропильная система (сосна)", amount: 185000, quantity: 8, unit: "м³", unitPrice: 23125, supplier: suppliers[1].name, supplierId: suppliers[1].id, categoryId: catMap["Кровля"], date: d(90) },
      { type: "MATERIAL", title: "Металлочерепица Grand Line", amount: 210000, quantity: 200, unit: "м²", unitPrice: 1050, supplier: suppliers[2].name, supplierId: suppliers[2].id, categoryId: catMap["Кровля"], date: d(85) },
      { type: "MATERIAL", title: "Утеплитель кровли", amount: 48000, quantity: 240, unit: "м²", unitPrice: 200, supplier: suppliers[0].name, supplierId: suppliers[0].id, categoryId: catMap["Кровля"], date: d(82) },
      { type: "MATERIAL", title: "Водосточная система", amount: 45000, quantity: 1, unit: "комплект", unitPrice: 45000, supplier: suppliers[2].name, supplierId: suppliers[2].id, categoryId: catMap["Кровля"], date: d(80) },
      // Электрика — в процессе
      { type: "MATERIAL", title: "Кабель ВВГнг 3x2.5", amount: 42000, quantity: 600, unit: "м.п.", unitPrice: 70, supplier: suppliers[4].name, supplierId: suppliers[4].id, categoryId: catMap["Электрика"], date: d(60) },
      { type: "MATERIAL", title: "Щит электрический", amount: 28000, quantity: 1, unit: "шт.", unitPrice: 28000, supplier: suppliers[4].name, supplierId: suppliers[4].id, categoryId: catMap["Электрика"], date: d(58) },
      { type: "MATERIAL", title: "Розетки / выключатели", amount: 35000, quantity: 45, unit: "шт.", unitPrice: 778, supplier: suppliers[4].name, supplierId: suppliers[4].id, categoryId: catMap["Электрика"], date: d(55) },
      // Сантехника — в процессе
      { type: "MATERIAL", title: "Трубы ППР 20-32мм", amount: 28000, quantity: 200, unit: "м.п.", unitPrice: 140, supplier: suppliers[5].name, supplierId: suppliers[5].id, categoryId: catMap["Сантехника"], date: d(50) },
      { type: "MATERIAL", title: "Радиаторы отопления", amount: 96000, quantity: 12, unit: "шт.", unitPrice: 8000, supplier: suppliers[5].name, supplierId: suppliers[5].id, categoryId: catMap["Сантехника"], date: d(48) },
      { type: "MATERIAL", title: "Котёл газовый Baxi", amount: 85000, quantity: 1, unit: "шт.", unitPrice: 85000, supplier: suppliers[5].name, supplierId: suppliers[5].id, categoryId: catMap["Сантехника"], date: d(45) },
      // Работы
      { type: "LABOR", title: "Земляные работы (котлован)", amount: 150000, hoursWorked: 100, hourlyRate: 1500, worker: workers[7].name, workerId: workers[7].id, categoryId: catMap["Разнорабочие"], date: d(185) },
      { type: "LABOR", title: "Заливка фундамента", amount: 200000, hoursWorked: 100, hourlyRate: 2000, worker: workers[6].name, workerId: workers[6].id, categoryId: catMap["Каменные работы"], date: d(175) },
      { type: "LABOR", title: "Кладка стен 1-й этаж", amount: 280000, hoursWorked: 200, hourlyRate: 1400, worker: workers[0].name, workerId: workers[0].id, categoryId: catMap["Каменные работы"], date: d(145) },
      { type: "LABOR", title: "Кладка стен 2-й этаж", amount: 240000, hoursWorked: 160, hourlyRate: 1500, worker: workers[0].name, workerId: workers[0].id, categoryId: catMap["Каменные работы"], date: d(125) },
      { type: "LABOR", title: "Монтаж кровли", amount: 180000, hoursWorked: 120, hourlyRate: 1500, worker: workers[5].name, workerId: workers[5].id, categoryId: catMap["Каменные работы"], date: d(85) },
      { type: "LABOR", title: "Электромонтаж (черновой)", amount: 120000, hoursWorked: 80, hourlyRate: 1500, worker: workers[2].name, workerId: workers[2].id, categoryId: catMap["Электромонтажные работы"], date: d(55) },
      { type: "LABOR", title: "Сантехника (разводка)", amount: 95000, hoursWorked: 65, hourlyRate: 1462, worker: workers[3].name, workerId: workers[3].id, categoryId: catMap["Сантехнические работы"], date: d(45) },
      // Доставки
      { type: "DELIVERY", title: "Доставка бетона (3 рейса)", amount: 45000, carrier: carriers[0].name, carrierId: carriers[0].id, categoryId: catMap["Доставка материалов"], date: d(180) },
      { type: "DELIVERY", title: "Доставка кирпича", amount: 35000, carrier: carriers[0].name, carrierId: carriers[0].id, categoryId: catMap["Доставка материалов"], date: d(150) },
      { type: "DELIVERY", title: "Доставка пиломатериалов", amount: 18000, carrier: carriers[0].name, carrierId: carriers[0].id, categoryId: catMap["Доставка материалов"], date: d(92) },
      { type: "DELIVERY", title: "Доставка металлочерепицы", amount: 12000, carrier: carriers[1].name, carrierId: carriers[1].id, categoryId: catMap["Доставка материалов"], date: d(86) },
      { type: "DELIVERY", title: "Подъём манипулятором", amount: 25000, carrier: carriers[2].name, carrierId: carriers[2].id, categoryId: catMap["Доставка оборудования"], date: d(90) },
      // Запланировано
      { type: "MATERIAL", title: "Окна ПВХ двухкамерные", amount: 320000, quantity: 16, unit: "шт.", unitPrice: 20000, categoryId: catMap["Стены"], date: d(0), planned: true },
      { type: "MATERIAL", title: "Штукатурка гипсовая", amount: 75000, quantity: 150, unit: "мешок", unitPrice: 500, categoryId: catMap["Отделка"], date: d(0), planned: true },
      { type: "MATERIAL", title: "Ламинат 33 класс", amount: 108000, quantity: 180, unit: "м²", unitPrice: 600, categoryId: catMap["Отделка"], date: d(0), planned: true },
      { type: "LABOR", title: "Штукатурка стен", amount: 200000, hoursWorked: 200, hourlyRate: 1000, categoryId: catMap["Каменные работы"], date: d(0), planned: true },
      { type: "LABOR", title: "Чистовая электрика", amount: 60000, hoursWorked: 40, hourlyRate: 1500, categoryId: catMap["Электромонтажные работы"], date: d(0), planned: true },
    ];
    for (const e of expenses) {
      await prisma.expense.create({
        data: {
          type: e.type, title: e.title, amount: e.amount,
          quantity: e.quantity || null, unit: e.unit || null, unitPrice: e.unitPrice || null,
          supplier: e.supplier || null, supplierId: e.supplierId || null,
          carrier: e.carrier || null, carrierId: e.carrierId || null,
          worker: e.worker || null, workerId: e.workerId || null,
          hoursWorked: e.hoursWorked || null, hourlyRate: e.hourlyRate || null,
          planned: e.planned || false, date: e.date,
          categoryId: e.categoryId, projectId: project.id,
        },
      });
    }
    console.log(`Created: ${project.name} (в работе ~55%)`);
  }

  // =====================================================
  // 4. ГАРАЖ — почти готов (85% бюджета)
  // =====================================================
  {
    const { project, catMap } = await createProject("Гараж", "Гараж на 2 машины с ямой, 8x6м, газобетон", 1800000, true);
    const expenses = [
      // Фундамент — готов
      { type: "MATERIAL", title: "Бетон М300 (фундамент + пол)", amount: 120000, quantity: 20, unit: "м³", unitPrice: 6000, supplier: suppliers[3].name, supplierId: suppliers[3].id, categoryId: catMap["Фундамент"], date: d(120) },
      { type: "MATERIAL", title: "Арматура 12мм", amount: 48000, quantity: 600, unit: "м.п.", unitPrice: 80, supplier: suppliers[0].name, supplierId: suppliers[0].id, categoryId: catMap["Фундамент"], date: d(118) },
      { type: "MATERIAL", title: "Гидроизоляция ямы", amount: 15000, quantity: 5, unit: "рулон", unitPrice: 3000, supplier: suppliers[0].name, supplierId: suppliers[0].id, categoryId: catMap["Фундамент"], date: d(115) },
      // Стены — готовы
      { type: "MATERIAL", title: "Газобетон D500 300мм", amount: 168000, quantity: 28, unit: "м³", unitPrice: 6000, supplier: suppliers[0].name, supplierId: suppliers[0].id, categoryId: catMap["Стены"], date: d(100) },
      { type: "MATERIAL", title: "Клей для газобетона", amount: 18000, quantity: 36, unit: "мешок", unitPrice: 500, supplier: suppliers[0].name, supplierId: suppliers[0].id, categoryId: catMap["Стены"], date: d(100) },
      { type: "MATERIAL", title: "Перемычки газобетонные", amount: 24000, quantity: 8, unit: "шт.", unitPrice: 3000, supplier: suppliers[0].name, supplierId: suppliers[0].id, categoryId: catMap["Стены"], date: d(95) },
      { type: "MATERIAL", title: "Ворота секционные 2шт", amount: 140000, quantity: 2, unit: "шт.", unitPrice: 70000, supplier: suppliers[0].name, supplierId: suppliers[0].id, categoryId: catMap["Стены"], date: d(40) },
      // Кровля — готова
      { type: "MATERIAL", title: "Балки перекрытия", amount: 65000, quantity: 3, unit: "м³", unitPrice: 21667, supplier: suppliers[1].name, supplierId: suppliers[1].id, categoryId: catMap["Кровля"], date: d(75) },
      { type: "MATERIAL", title: "Профнастил С21", amount: 42000, quantity: 60, unit: "м²", unitPrice: 700, supplier: suppliers[2].name, supplierId: suppliers[2].id, categoryId: catMap["Кровля"], date: d(70) },
      { type: "MATERIAL", title: "Утеплитель 150мм", amount: 24000, quantity: 60, unit: "м²", unitPrice: 400, supplier: suppliers[0].name, supplierId: suppliers[0].id, categoryId: catMap["Кровля"], date: d(68) },
      // Электрика — готова
      { type: "MATERIAL", title: "Кабель ВВГнг 3x2.5", amount: 14000, quantity: 200, unit: "м.п.", unitPrice: 70, supplier: suppliers[4].name, supplierId: suppliers[4].id, categoryId: catMap["Электрика"], date: d(50) },
      { type: "MATERIAL", title: "Светильники LED", amount: 12000, quantity: 8, unit: "шт.", unitPrice: 1500, supplier: suppliers[4].name, supplierId: suppliers[4].id, categoryId: catMap["Электрика"], date: d(48) },
      { type: "MATERIAL", title: "Щиток + автоматы", amount: 8500, quantity: 1, unit: "комплект", unitPrice: 8500, supplier: suppliers[4].name, supplierId: suppliers[4].id, categoryId: catMap["Электрика"], date: d(48) },
      // Отделка — в процессе
      { type: "MATERIAL", title: "Штукатурка фасадная", amount: 36000, quantity: 72, unit: "мешок", unitPrice: 500, supplier: suppliers[0].name, supplierId: suppliers[0].id, categoryId: catMap["Отделка"], date: d(25) },
      { type: "MATERIAL", title: "Краска фасадная", amount: 18000, quantity: 6, unit: "ведро", unitPrice: 3000, supplier: suppliers[0].name, supplierId: suppliers[0].id, categoryId: catMap["Отделка"], date: d(15) },
      // Работы
      { type: "LABOR", title: "Земляные работы + яма", amount: 60000, hoursWorked: 40, hourlyRate: 1500, worker: workers[7].name, workerId: workers[7].id, categoryId: catMap["Разнорабочие"], date: d(125) },
      { type: "LABOR", title: "Заливка фундамента", amount: 80000, hoursWorked: 40, hourlyRate: 2000, worker: workers[6].name, workerId: workers[6].id, categoryId: catMap["Каменные работы"], date: d(118) },
      { type: "LABOR", title: "Кладка газобетона", amount: 120000, hoursWorked: 80, hourlyRate: 1500, worker: workers[0].name, workerId: workers[0].id, categoryId: catMap["Каменные работы"], date: d(95) },
      { type: "LABOR", title: "Монтаж кровли", amount: 65000, hoursWorked: 50, hourlyRate: 1300, worker: workers[5].name, workerId: workers[5].id, categoryId: catMap["Каменные работы"], date: d(70) },
      { type: "LABOR", title: "Электромонтаж", amount: 45000, hoursWorked: 30, hourlyRate: 1500, worker: workers[2].name, workerId: workers[2].id, categoryId: catMap["Электромонтажные работы"], date: d(46) },
      { type: "LABOR", title: "Штукатурка + покраска", amount: 55000, hoursWorked: 55, hourlyRate: 1000, worker: workers[4].name, workerId: workers[4].id, categoryId: catMap["Каменные работы"], date: d(20) },
      { type: "LABOR", title: "Монтаж ворот", amount: 20000, hoursWorked: 10, hourlyRate: 2000, worker: workers[1].name, workerId: workers[1].id, categoryId: catMap["Каменные работы"], date: d(38) },
      // Доставки
      { type: "DELIVERY", title: "Доставка газобетона", amount: 18000, carrier: carriers[0].name, carrierId: carriers[0].id, categoryId: catMap["Доставка материалов"], date: d(101) },
      { type: "DELIVERY", title: "Доставка бетона (миксер)", amount: 12000, carrier: carriers[0].name, carrierId: carriers[0].id, categoryId: catMap["Доставка материалов"], date: d(120) },
      { type: "DELIVERY", title: "Доставка ворот", amount: 8000, carrier: carriers[1].name, carrierId: carriers[1].id, categoryId: catMap["Доставка оборудования"], date: d(41) },
      // Запланировано
      { type: "MATERIAL", title: "Отмостка (бетон + плитка)", amount: 35000, quantity: 1, unit: "комплект", unitPrice: 35000, categoryId: catMap["Отделка"], date: d(0), planned: true },
      { type: "LABOR", title: "Отмостка — работы", amount: 25000, hoursWorked: 25, hourlyRate: 1000, categoryId: catMap["Разнорабочие"], date: d(0), planned: true },
    ];
    for (const e of expenses) {
      await prisma.expense.create({
        data: {
          type: e.type, title: e.title, amount: e.amount,
          quantity: e.quantity || null, unit: e.unit || null, unitPrice: e.unitPrice || null,
          supplier: e.supplier || null, supplierId: e.supplierId || null,
          carrier: e.carrier || null, carrierId: e.carrierId || null,
          worker: e.worker || null, workerId: e.workerId || null,
          hoursWorked: e.hoursWorked || null, hourlyRate: e.hourlyRate || null,
          planned: e.planned || false, date: e.date,
          categoryId: e.categoryId, projectId: project.id,
        },
      });
    }
    console.log(`Created: ${project.name} (почти готов ~85%)`);
  }

  // =====================================================
  // 5. МАСТЕРСКАЯ — закончена (100%, немного под бюджетом)
  // =====================================================
  {
    const { project, catMap } = await createProject("Мастерская", "Столярная мастерская 6x5м, каркасная, утеплённая", 900000, true);
    const expenses = [
      // Фундамент
      { type: "MATERIAL", title: "Бетон М250 (столбчатый)", amount: 32000, quantity: 8, unit: "м³", unitPrice: 4000, supplier: suppliers[3].name, supplierId: suppliers[3].id, categoryId: catMap["Фундамент"], date: d(200) },
      { type: "MATERIAL", title: "Блоки ФБС", amount: 24000, quantity: 16, unit: "шт.", unitPrice: 1500, supplier: suppliers[0].name, supplierId: suppliers[0].id, categoryId: catMap["Фундамент"], date: d(198) },
      // Стены (каркас)
      { type: "MATERIAL", title: "Брус 150x50 (каркас)", amount: 48000, quantity: 2, unit: "м³", unitPrice: 24000, supplier: suppliers[1].name, supplierId: suppliers[1].id, categoryId: catMap["Стены"], date: d(185) },
      { type: "MATERIAL", title: "OSB-3 12мм", amount: 42000, quantity: 30, unit: "лист", unitPrice: 1400, supplier: suppliers[1].name, supplierId: suppliers[1].id, categoryId: catMap["Стены"], date: d(183) },
      { type: "MATERIAL", title: "Утеплитель 150мм", amount: 30000, quantity: 60, unit: "м²", unitPrice: 500, supplier: suppliers[0].name, supplierId: suppliers[0].id, categoryId: catMap["Стены"], date: d(180) },
      { type: "MATERIAL", title: "Пароизоляция", amount: 4500, quantity: 3, unit: "рулон", unitPrice: 1500, supplier: suppliers[0].name, supplierId: suppliers[0].id, categoryId: catMap["Стены"], date: d(180) },
      { type: "MATERIAL", title: "Сайдинг виниловый", amount: 36000, quantity: 60, unit: "м²", unitPrice: 600, supplier: suppliers[0].name, supplierId: suppliers[0].id, categoryId: catMap["Стены"], date: d(160) },
      // Кровля
      { type: "MATERIAL", title: "Стропила 50x200", amount: 22000, quantity: 1, unit: "м³", unitPrice: 22000, supplier: suppliers[1].name, supplierId: suppliers[1].id, categoryId: catMap["Кровля"], date: d(170) },
      { type: "MATERIAL", title: "Ондулин", amount: 18000, quantity: 36, unit: "м²", unitPrice: 500, supplier: suppliers[2].name, supplierId: suppliers[2].id, categoryId: catMap["Кровля"], date: d(168) },
      // Электрика
      { type: "MATERIAL", title: "Кабель ВВГнг 3x4", amount: 12000, quantity: 100, unit: "м.п.", unitPrice: 120, supplier: suppliers[4].name, supplierId: suppliers[4].id, categoryId: catMap["Электрика"], date: d(140) },
      { type: "MATERIAL", title: "Светильники LED 36Вт", amount: 9000, quantity: 6, unit: "шт.", unitPrice: 1500, supplier: suppliers[4].name, supplierId: suppliers[4].id, categoryId: catMap["Электрика"], date: d(138) },
      { type: "MATERIAL", title: "Щиток 3-фазный", amount: 12000, quantity: 1, unit: "шт.", unitPrice: 12000, supplier: suppliers[4].name, supplierId: suppliers[4].id, categoryId: catMap["Электрика"], date: d(138) },
      { type: "MATERIAL", title: "Розетки силовые 380В", amount: 6000, quantity: 4, unit: "шт.", unitPrice: 1500, supplier: suppliers[4].name, supplierId: suppliers[4].id, categoryId: catMap["Электрика"], date: d(135) },
      // Отделка
      { type: "MATERIAL", title: "Вагонка (внутренняя обшивка)", amount: 27000, quantity: 45, unit: "м²", unitPrice: 600, supplier: suppliers[1].name, supplierId: suppliers[1].id, categoryId: catMap["Отделка"], date: d(130) },
      { type: "MATERIAL", title: "Дверь входная металлическая", amount: 18000, quantity: 1, unit: "шт.", unitPrice: 18000, supplier: suppliers[0].name, supplierId: suppliers[0].id, categoryId: catMap["Отделка"], date: d(155) },
      { type: "MATERIAL", title: "Окна ПВХ 1200x600", amount: 24000, quantity: 3, unit: "шт.", unitPrice: 8000, supplier: suppliers[0].name, supplierId: suppliers[0].id, categoryId: catMap["Отделка"], date: d(162) },
      { type: "MATERIAL", title: "Верстак столярный", amount: 35000, quantity: 1, unit: "шт.", unitPrice: 35000, supplier: suppliers[0].name, supplierId: suppliers[0].id, categoryId: catMap["Отделка"], date: d(120) },
      // Работы
      { type: "LABOR", title: "Фундаментные работы", amount: 30000, hoursWorked: 20, hourlyRate: 1500, worker: workers[6].name, workerId: workers[6].id, categoryId: catMap["Каменные работы"], date: d(196) },
      { type: "LABOR", title: "Каркас + обшивка", amount: 95000, hoursWorked: 70, hourlyRate: 1357, worker: workers[1].name, workerId: workers[1].id, categoryId: catMap["Каменные работы"], date: d(180) },
      { type: "LABOR", title: "Монтаж кровли", amount: 35000, hoursWorked: 25, hourlyRate: 1400, worker: workers[5].name, workerId: workers[5].id, categoryId: catMap["Каменные работы"], date: d(168) },
      { type: "LABOR", title: "Утепление + пароизоляция", amount: 25000, hoursWorked: 25, hourlyRate: 1000, worker: workers[7].name, workerId: workers[7].id, categoryId: catMap["Разнорабочие"], date: d(175) },
      { type: "LABOR", title: "Обшивка сайдингом", amount: 30000, hoursWorked: 30, hourlyRate: 1000, worker: workers[4].name, workerId: workers[4].id, categoryId: catMap["Каменные работы"], date: d(158) },
      { type: "LABOR", title: "Электромонтаж 3-фазный", amount: 55000, hoursWorked: 35, hourlyRate: 1571, worker: workers[2].name, workerId: workers[2].id, categoryId: catMap["Электромонтажные работы"], date: d(135) },
      { type: "LABOR", title: "Внутренняя отделка вагонкой", amount: 30000, hoursWorked: 30, hourlyRate: 1000, worker: workers[1].name, workerId: workers[1].id, categoryId: catMap["Каменные работы"], date: d(125) },
      { type: "LABOR", title: "Монтаж окон и двери", amount: 15000, hoursWorked: 10, hourlyRate: 1500, worker: workers[1].name, workerId: workers[1].id, categoryId: catMap["Каменные работы"], date: d(155) },
      // Доставки
      { type: "DELIVERY", title: "Доставка пиломатериалов", amount: 12000, carrier: carriers[0].name, carrierId: carriers[0].id, categoryId: catMap["Доставка материалов"], date: d(186) },
      { type: "DELIVERY", title: "Доставка OSB и утеплитель", amount: 8000, carrier: carriers[1].name, carrierId: carriers[1].id, categoryId: catMap["Доставка материалов"], date: d(184) },
      { type: "DELIVERY", title: "Доставка сайдинга", amount: 5000, carrier: carriers[1].name, carrierId: carriers[1].id, categoryId: catMap["Доставка материалов"], date: d(161) },
      { type: "DELIVERY", title: "Доставка верстака", amount: 6000, carrier: carriers[1].name, carrierId: carriers[1].id, categoryId: catMap["Доставка оборудования"], date: d(121) },
    ];
    for (const e of expenses) {
      await prisma.expense.create({
        data: {
          type: e.type, title: e.title, amount: e.amount,
          quantity: e.quantity || null, unit: e.unit || null, unitPrice: e.unitPrice || null,
          supplier: e.supplier || null, supplierId: e.supplierId || null,
          carrier: e.carrier || null, carrierId: e.carrierId || null,
          worker: e.worker || null, workerId: e.workerId || null,
          hoursWorked: e.hoursWorked || null, hourlyRate: e.hourlyRate || null,
          planned: e.planned || false, date: e.date,
          categoryId: e.categoryId, projectId: project.id,
        },
      });
    }
    console.log(`Created: ${project.name} (закончена ~100%)`);
  }

  console.log("\n=== Seed complete! ===");
  console.log("Demo user: demo@demo.com / demo123");
  console.log("5 projects created (all public):");
  console.log("  1. Беседка — начало (~10%)");
  console.log("  2. Бассейн — в работе (~40%)");
  console.log("  3. Дом — в работе (~55%)");
  console.log("  4. Гараж — почти готов (~85%)");
  console.log("  5. Мастерская — закончена (~100%)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
