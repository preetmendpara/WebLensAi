import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional classes, last Tailwind utility wins. */
export const cn = (...inputs) => twMerge(clsx(inputs));
