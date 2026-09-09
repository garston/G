namespace JSUtil {
    export namespace ObjectUtil {
        export const equal = (o1: Object, o2: Object) => JSON.stringify(o1) === JSON.stringify(o2);
    }
}
