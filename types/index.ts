export type Condition = "ORIGINAL" | "AFTERMARKET" | "USED";

export interface ProductCardData {
  id: string;
  title: string;
  slug: string;
  price: number;
  oldPrice?: number | null;
  image: string;
  brandName: string;
  carModel?: string | null;
  condition: Condition;
  rating: number;
  inStock: boolean;
  isVip?: boolean;
}

export interface CarBrandData {
  id: string;
  name: string;
  slug: string;
}
