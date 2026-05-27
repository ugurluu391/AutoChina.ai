import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind class-larını ağıllı şəkildə birləşdirir.
 * shadcn/ui və bütün UI komponentləri üçün istifadə olunur.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Qiyməti AZN formatında göstərir */
export function formatPrice(price: number): string {
  return `₼${price.toLocaleString("az-AZ")}`;
}
