import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function titleCase(str: string): string {
  return str.replace(/\b\w/g, l => l.toUpperCase());
}

export function capitalizeInput(str: string): string {
  return str.replace(/\b\w/g, l => l.toUpperCase());
}