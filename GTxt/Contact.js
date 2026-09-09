namespace GTxt {
    export class Contact extends GASton.BoundObject {
        readonly guid: string;
        shortId: number;

        constructor(readonly number?: number, readonly gvKey?: string) {
            super();
            this.guid = JSUtil.GuidUtil.generate();
            this.shortId = 0;
        }

        static findByNumber(number: number) {
            return GASton.Database.findBy(Contact, 'number', number);
        }

        createShortId() {
            return this.shortId = GASton.Database.hydrate(GTxt.Contact).filter(c => c.hasShortId()).length + 1;
        }

        hasShortId() {
            return this.shortId > 0;
        }
    }
    GASton.Database.register(Contact, 'CONTACTS', ['guid', 'number', 'gvKey', 'shortId']);
}
