import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper function for formatting currency to Rupiah (Rp)
export const formatRupiah = (amount: number) => {
    // Now formats the actual amount provided, assuming it's already in IDR value.
    const value = amount;
    return `Rp${value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`; 
}