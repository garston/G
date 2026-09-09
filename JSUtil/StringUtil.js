namespace JSUtil {
    export namespace StringUtil {
        export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
        export const escapeHTML = (s: string) => s.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        export const matchSafe = (s: string, re: RegExp) => s.match(re) || [];
        export const splitPossiblyEmpty = (s: string) => s ? s.split(',') : [];
        export const stripTags = (s: string) => s.replace(/(<([^>]+)>)/ig, '');
    }
}
