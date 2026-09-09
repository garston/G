namespace GASton {
    export type BoundObjectProp = string;
    export type BoundObjectPropCommaList = number | string;
    export type BoundObjectPropVal = number | string;

    export class BoundObject {
        static __firstRow: number;
        static __hydrating?: boolean;
        static __tableName: string;

        __values?: BoundObjectPropVal[];
    }
    export type BoundClass = typeof BoundObject;
}
