namespace JSUtil {
    export namespace DateUtil {
        export const addDays = (days: number, d: Date) => {
            const newDate = new Date(d);
            newDate.setDate(newDate.getDate() + days);
            return newDate;
        };

        export const dayOfWeekString = (dayOfWeek: number) => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
        export const diff = (d1: any, d2: any) => Math.floor((d2 - d1) / 86400000);
        export const getDay = (daysFromNow: number) => (new Date().getDay() + daysFromNow) % 7;

        export const lastDayOfMonth = (d: Date) => {
            const newDate = new Date(d);
            newDate.setFullYear(newDate.getFullYear(), newDate.getMonth() + 1, 0)
            return newDate;
        };

        export const startOfDay = (d: Date) => {
            const newDate = new Date(d);
            newDate.setHours(0, 0, 0, 0);
            return newDate;
        };

        export const timeString = (d: GoogleAppsScript.Base.Date) => `${d.getHours()}:${d.getMinutes() < 10 ? 0 : ''}${d.getMinutes()}`;
        export const toPrettyString = (d: GoogleAppsScript.Base.Date, omitYear?: boolean) => (d.getMonth()+1) + '/' + d.getDate() + (omitYear ? '' : '/' + d.getFullYear());
    }
}
