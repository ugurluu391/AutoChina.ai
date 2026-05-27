import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const brands = [
  "Chery", "Geely", "BYD", "Haval", "Changan",
  "JAC", "Great Wall", "Dongfeng", "FAW", "Exeed",
];

const categories = [
  { name: "Əyləc sistemi", icon: "🛞" },
  { name: "Mühərrik hissələri", icon: "⚙️" },
  { name: "İşıqlandırma", icon: "💡" },
  { name: "Akkumulyator", icon: "🔋" },
  { name: "Filtrlər", icon: "🌀" },
  { name: "Asqı sistemi", icon: "🔧" },
  { name: "Kuza hissələri", icon: "🚗" },
  { name: "Salon", icon: "🪑" },
];

const slugify = (s: string) =>
  s.toLowerCase().replace(/ə/g, "e").replace(/ı/g, "i").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function main() {
  console.log("🌱 Seed başladı...");

  for (const name of brands) {
    await prisma.carBrand.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name) },
    });
  }

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: slugify(c.name) },
      update: {},
      create: { name: c.name, slug: slugify(c.name), icon: c.icon },
    });
  }

  console.log(`✅ ${brands.length} marka, ${categories.length} kateqoriya əlavə edildi.`);

  // ===== Demo satıcı + nümunə məhsullar =====
  const allBrands = await prisma.carBrand.findMany();
  const allCats = await prisma.category.findMany();

  const demoUser = await prisma.user.upsert({
    where: { email: "demo-seller@autochina.az" },
    update: {},
    create: { email: "demo-seller@autochina.az", name: "Demo Satıcı", role: "SELLER" },
  });

  const seller = await prisma.seller.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      userId: demoUser.id,
      shopName: "AutoParts Baku",
      slug: "autoparts-baku",
      description: "Çin avtomobilləri üçün orijinal və analoq hissələr.",
      city: "Bakı",
      phone: "+994501234567",
      whatsapp: "994501234567",
      verified: true,
      rating: 4.9,
    },
  });

  const sampleTitles = [
    "Ön əyləc disk dəsti", "Akkumulyator modulu 12V", "LED ön fara (sol)",
    "Yağ filtri + dəst", "Hava filtri", "Arxa amortizator",
    "Kondisioner kompressoru", "Su nasosu", "Qayış komplekti", "Şam dəsti",
  ];
  const models = ["Tiggo 7", "Song Plus", "Coolray", "Jolion", "CS35"];
  const conditions = ["ORIGINAL", "AFTERMARKET", "USED"] as const;

  let created = 0;
  for (let i = 0; i < sampleTitles.length; i++) {
    const brand = allBrands[i % allBrands.length];
    const cat = allCats[i % allCats.length];
    const slug = slugify(sampleTitles[i]) + "-" + (i + 1);
    const exists = await prisma.product.findUnique({ where: { slug } });
    if (exists) continue;
    await prisma.product.create({
      data: {
        title: sampleTitles[i],
        slug,
        description: `${sampleTitles[i]} — ${models[i % models.length]} modeli üçün uyğun, yüksək keyfiyyətli hissə. Zəmanətli.`,
        price: 40 + ((i * 53) % 380),
        oldPrice: i % 3 === 0 ? 60 + ((i * 53) % 380) : null,
        condition: conditions[i % conditions.length],
        stockCount: 5,
        inStock: true,
        rating: Number((4.5 + (i % 5) * 0.1).toFixed(1)),
        views: (i * 17) % 300,
        featured: i < 4,
        status: "ACTIVE",
        carModel: models[i % models.length],
        sellerId: seller.id,
        categoryId: cat.id,
        brandId: brand.id,
        images: [],
      },
    });
    created++;
  }
  console.log(`✅ ${created} nümunə məhsul + 1 demo satıcı əlavə edildi.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
