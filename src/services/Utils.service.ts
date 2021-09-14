export const Utils = {
    removeTimeFromDate: (d: Date): Date => {
        const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
        const mo = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(d);
        const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
        return new Date(ye + '-' + mo + '-' + da);
    },
    translateDate: (d: Date, separator = '-'): string => {
        const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
        const mo = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(d);
        const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
        return ye + separator + mo + separator + da;
    },
    daysBetweenDates: (start: Date, end: Date): number => {
        const difference = end.getTime() - start.getTime();
        const days = Math.ceil(difference / (1000 * 3600 * 24));
        return days;
    },
}