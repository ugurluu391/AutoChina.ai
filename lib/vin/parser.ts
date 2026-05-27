/**
 * VIN (Vehicle Identification Number) deterministik parser.
 * 17 simvol: WMI(1-3) + VDS(4-9) + VIS(10-17).
 * Markanı WMI-dən, ili 10-cu simvoldan, ölkəni 1-ci simvoldan deterministik çıxarır.
 * Model üçün AI istifadə olunur (parser yalnız etibarlı sahələri verir).
 */

export type VinParseResult = {
  valid: boolean;
  vin: string;
  brand?: string;
  brandSlug?: string;
  year?: number;
  country?: string;
  wmi?: string;
  error?: string;
};

// Çin WMI prefiksləri (World Manufacturer Identifier)
// Mənbə: ISO 3780 / SAE — Çin istehsalçıları "L" ilə başlayır
const WMI_BRANDS: Record<string, { brand: string; slug: string }> = {
  LVV: { brand: "Chery", slug: "chery" },
  LVT: { brand: "Chery", slug: "chery" },
  LFP: { brand: "FAW", slug: "faw" },
  LFV: { brand: "FAW-VW", slug: "faw" },
  LB2: { brand: "Geely", slug: "geely" },
  L6T: { brand: "Geely", slug: "geely" },
  LJD: { brand: "Geely", slug: "geely" },
  LGX: { brand: "BYD", slug: "byd" },
  LC0: { brand: "BYD", slug: "byd" },
  LGB: { brand: "Dongfeng", slug: "dongfeng" },
  LGW: { brand: "Great Wall / Haval", slug: "haval" },
  LZW: { brand: "Great Wall", slug: "great-wall" },
  LS5: { brand: "Changan", slug: "changan" },
  LSJ: { brand: "MG / SAIC", slug: "changan" },
  LJ1: { brand: "JAC", slug: "jac" },
  LDC: { brand: "Dongfeng-Peugeot", slug: "dongfeng" },
};

// Ölkə kodu (VIN 1-ci simvol)
const COUNTRY: Record<string, string> = {
  L: "Çin", J: "Yaponiya", K: "Cənubi Koreya", W: "Almaniya",
  S: "Böyük Britaniya", V: "Fransa/İspaniya", Z: "İtaliya",
  "1": "ABŞ", "2": "Kanada", "3": "Meksika",
};

// Model ili kodu (VIN 10-cu simvol) — 30 illik dövr
const YEAR_CODES: Record<string, number[]> = {
  A: [1980, 2010], B: [1981, 2011], C: [1982, 2012], D: [1983, 2013],
  E: [1984, 2014], F: [1985, 2015], G: [1986, 2016], H: [1987, 2017],
  J: [1988, 2018], K: [1989, 2019], L: [1990, 2020], M: [1991, 2021],
  N: [1992, 2022], P: [1993, 2023], R: [1994, 2024], S: [1995, 2025],
  T: [1996, 2026], V: [1997, 2027], W: [1998, 2028], X: [1999, 2029],
  Y: [2000, 2030], "1": [2001, 2031], "2": [2002], "3": [2003],
  "4": [2004], "5": [2005], "6": [2006], "7": [2007], "8": [2008], "9": [2009],
};

const VIN_RE = /^[A-HJ-NPR-Z0-9]{17}$/i; // I, O, Q qadağandır

/** VIN-in formatını yoxlayır (uzunluq + qadağan simvollar) */
export function isValidVinFormat(vin: string): boolean {
  return VIN_RE.test(vin.trim().toUpperCase());
}

/** Model ilini 10-cu simvoldan çıxarır (cari ilə ən yaxın seçilir) */
function decodeYear(code: string): number | undefined {
  const years = YEAR_CODES[code.toUpperCase()];
  if (!years) return undefined;
  const now = new Date().getFullYear() + 1; // gələn ilə qədər icazə
  // Cari ilə ən yaxın, amma gələcəkdən olmayan
  const valid = years.filter((y) => y <= now);
  return valid.length ? valid[valid.length - 1] : years[0];
}

/** VIN-i parse edir — deterministik sahələri qaytarır */
export function parseVin(raw: string): VinParseResult {
  const vin = raw.trim().toUpperCase();

  if (!vin) return { valid: false, vin, error: "VIN daxil edin" };
  if (vin.length !== 17) return { valid: false, vin, error: "VIN 17 simvol olmalıdır" };
  if (!VIN_RE.test(vin)) return { valid: false, vin, error: "VIN yanlış simvollar içərir (I, O, Q olmaz)" };

  const wmi = vin.slice(0, 3);
  const countryCode = vin[0];
  const yearCode = vin[9];

  const brandInfo = WMI_BRANDS[wmi] ?? WMI_BRANDS[vin.slice(0, 2) + "*"];
  const year = decodeYear(yearCode);
  const country = COUNTRY[countryCode];

  return {
    valid: true,
    vin,
    wmi,
    brand: brandInfo?.brand,
    brandSlug: brandInfo?.slug,
    year,
    country,
  };
}
