/**
 * Schema.org JSON-LD strukturlu data — Google rich results üçün.
 * Server komponent (sadəcə <script> render edir, UI-ya təsir etmir).
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://autochina.az";

export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AutoChina AI",
    url: SITE_URL,
    description: "AI-powered Çin avtomobil ehtiyat hissələri marketplace-i",
    areaServed: { "@type": "Country", name: "Azerbaijan" },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function WebsiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AutoChina AI",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/marketplace?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function ProductJsonLd({
  name, description, price, image, brand, condition, slug, inStock, rating,
}: {
  name: string; description: string; price: number; image?: string;
  brand: string; condition: string; slug: string; inStock: boolean; rating?: number;
}) {
  const condMap: Record<string, string> = {
    ORIGINAL: "https://schema.org/NewCondition",
    AFTERMARKET: "https://schema.org/NewCondition",
    USED: "https://schema.org/UsedCondition",
  };
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    ...(image && image.startsWith("http") && { image }),
    brand: { "@type": "Brand", name: brand },
    ...(rating && rating > 0 && {
      aggregateRating: { "@type": "AggregateRating", ratingValue: rating, reviewCount: 1 },
    }),
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/marketplace/${slug}`,
      priceCurrency: "AZN",
      price: price.toFixed(2),
      itemCondition: condMap[condition] ?? "https://schema.org/NewCondition",
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
