import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(
    isoString: string | null,
    hours: boolean = true
): string {
    if (!isoString) return "";
    const date = new Date(isoString);

    if (!hours) {
        const formatter = new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });

        return formatter.format(date);
    }

    const formatter = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });

    return formatter.format(date);
}

export const daysLeft = (isoString: string | null): number => {
    if (!isoString) return 0;
    const end = new Date(isoString);
    const today = new Date();

    const oneDay = 1000 * 60 * 60 * 24;

    const diffTime = end.getTime() - today.getTime();

    const diffDays = Math.round(diffTime / oneDay);

    return diffDays;
};

export function generateMailtoLink(
    to: string,
    subject: string,
    body: string
): string {
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body.replace(/\n/g, "<br>"));
    return `mailto:${encodeURIComponent(
        to
    )}?subject=${encodedSubject}&body=${encodedBody}`;
}
