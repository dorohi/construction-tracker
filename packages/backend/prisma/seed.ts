import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_MATERIAL_CATEGORIES = [
  "Фундамент",
  "Стены",
  "Кровля",
  "Сантехника",
  "Электрика",
  "Отделка",
];

const DEFAULT_LABOR_CATEGORIES = [
  "Каменные работы",
  "Сантехнические работы",
  "Электромонтажные работы",
  "Разнорабочие",
];

async function seedCategoriesForProject(projectId: string) {
  for (const name of DEFAULT_MATERIAL_CATEGORIES) {
    await prisma.category.create({
      data: { name, type: "MATERIAL", projectId },
    });
  }
  for (const name of DEFAULT_LABOR_CATEGORIES) {
    await prisma.category.create({
      data: { name, type: "LABOR", projectId },
    });
  }
}

async function main() {
  const projects = await prisma.project.findMany();
  for (const project of projects) {
    const existingCategories = await prisma.category.count({
      where: { projectId: project.id },
    });
    if (existingCategories === 0) {
      await seedCategoriesForProject(project.id);
      console.log(`Seeded categories for project: ${project.name}`);
    }
  }
  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

export { seedCategoriesForProject };
