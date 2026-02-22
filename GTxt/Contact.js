GTxt.Contact = class {
    constructor(number, gvKey) {
        this.guid = JSUtil.GuidUtil.generate();
        this.number = number;
        this.gvKey = gvKey;
        this.shortId = 0;
    }

    static findByNumber(number) {
        return GASton.Database.findBy(this, 'number', number);
    }

    createShortId() {
        return this.shortId = GASton.Database.hydrate(GTxt.Contact).filter(c => c.hasShortId()).length + 1;
    }

    hasShortId() {
        return this.shortId > 0;
    }
}

GASton.Database.register(GTxt.Contact, 'CONTACTS', ['guid', 'number', 'gvKey', 'shortId']);
