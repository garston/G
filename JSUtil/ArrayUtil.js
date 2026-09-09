namespace JSUtil {
    export namespace ArrayUtil {
        export const average = (a: number[]) => a.length ? sum(a) / a.length : 0;

        export const compact = function<T>(a: T[]){
            return a.filter(o => o);
        }

        export const groupBy = function<T>(a: T[], fn: (o: T, i: number, a: T[]) => string, scope: any) {
            const groups: Record<string, T[] | undefined> = {};
            for (let i = 0; i < a.length; i++) {
                const group = fn.call(scope || a, a[i], i, a);
                if (group in groups) {
                    groups[group]!.push(a[i]);
                } else {
                    groups[group] = [a[i]];
                }
            }
            return groups;
        };

        export const last = function<T>(a: T[]){
            return a[a.length - 1];
        };

        export const range = (start = 0, end?: number, step = 1) => {
            if (end == null) {
                end = start;
                start = 0;
            }
            let index = -1,
                length = Math.max(0, Math.ceil((end - start) / (step || 1))),
                result: number[] = Array(length);
            while (++index < length) {
                result[index] = start;
                start += step;
            }
            return result;
        };

        export const remove = function<T>(a: T[], o: T) {
            const index = a.indexOf(o);
            if(index !== -1){
                a.splice(index, 1);
            }
        };

        export const sum = (a: number[]) => a.reduce((sum, i) => sum + i, 0);
        export const times = (n: number, fn: () => void, scope?: any) => range(n).forEach(fn, scope);

        export const unique = function<T>(a: T[]) {
            return a.reverse().filter((e, i, a) => a.indexOf(e, i+1) === -1).reverse();
        }
    }
}
