import type { ProductCardData, CarBrandData } from "@/types";

export const MOCK_BRANDS: CarBrandData[] = [
  { id: "1", name: "Chery", slug: "chery" },
  { id: "2", name: "Geely", slug: "geely" },
  { id: "3", name: "BYD", slug: "byd" },
  { id: "4", name: "Haval", slug: "haval" },
  { id: "5", name: "Changan", slug: "changan" },
  { id: "6", name: "JAC", slug: "jac" },
  { id: "7", name: "Great Wall", slug: "great-wall" },
  { id: "8", name: "Dongfeng", slug: "dongfeng" },
  { id: "9", name: "FAW", slug: "faw" },
  { id: "10", name: "Exeed", slug: "exeed" },
];

export const MOCK_CATEGORIES = [
  { name: "Əyləc sistemi", slug: "eylec-sistemi", icon: "🛞" },
  { name: "Mühərrik hissələri", slug: "muherrik-hisseleri", icon: "⚙️" },
  { name: "İşıqlandırma", slug: "isiqlandirma", icon: "💡" },
  { name: "Akkumulyator", slug: "akkumulyator", icon: "🔋" },
  { name: "Filtrlər", slug: "filtrler", icon: "🌀" },
  { name: "Asqı sistemi", slug: "asqi-sistemi", icon: "🔧" },
  { name: "Kuza hissələri", slug: "kuza-hisseleri", icon: "🚗" },
  { name: "Salon", slug: "salon", icon: "🪑" },
];

const icons = ["🛞", "🔋", "💡", "⚙️", "🌀", "🔧", "🚗", "🪑"];
const titles = [
  "Ön əyləc disk dəsti", "Akkumulyator modulu 12V", "LED ön fara (sol)",
  "Yağ filtri + dəst", "Hava filtri", "Arxa amortizator", "Ön bufer",
  "Kondisioner kompressoru", "Su nasosu", "Qayış komplekti", "Şam dəsti",
  "Radiator", "Əyləc bəndi (ön)", "Sükan rakı", "Generator",
];
const models = ["Tiggo 7", "Song Plus", "Coolray", "Jolion", "CS35", "Tiggo 8 Pro", "Atlas", "H6"];
const conditions = ["ORIGINAL", "AFTERMARKET", "USED"] as const;

export const MOCK_PRODUCTS: ProductCardData[] = Array.from({ length: 24 }, (_, i) => {
  const brand = MOCK_BRANDS[i % MOCK_BRANDS.length];
  const price = 30 + ((i * 47) % 400);
  return {
    id: `p${i + 1}`,
    title: titles[i % titles.length],
    slug: `mehsul-${i + 1}`,
    price,
    oldPrice: i % 3 === 0 ? price + 60 : null,
    image: icons[i % icons.length],
    brandName: brand.name,
    carModel: models[i % models.length],
    condition: conditions[i % conditions.length],
    rating: Number((4.5 + (i % 5) * 0.1).toFixed(1)),
    inStock: i % 7 !== 0,
  };
});
