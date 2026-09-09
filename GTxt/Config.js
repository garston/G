namespace GTxt {
    export class Config extends GASton.BoundObject {
        readonly additionalToggleEnabledNumbers!: GASton.BoundObjectPropCommaList;
        forwardToPhysicalPhone!: number
        readonly gvNumber!: number;
        private readonly physicalPhoneContactGuid!: string;
        quickReplyContactGuid!: string;

        static soleInstance() {
            return GASton.Database.hydrate(Config)[0];
        }

        getPhysicalPhoneContact() {
            return GASton.Database.findBy(GTxt.Contact, 'guid', this.physicalPhoneContactGuid)!;
        }

        getPhysicalPhoneContactTxtEmail() {
            const contact = this.getPhysicalPhoneContact();
            return GASton.Voice.getTxtEmail(this.gvNumber, contact.number, contact.gvKey);
        }

        getQuickReplyContact() {
            return GASton.Database.findBy(GTxt.Contact, 'guid', this.quickReplyContactGuid);
        }

        setQuickReplyContact({guid}: GTxt.Contact, force?: boolean) {
            this.quickReplyContactGuid = (!force && this.quickReplyContactGuid) || guid;
        }

        toggleForwardToPhysicalPhone() {
            return this.forwardToPhysicalPhone = this.forwardToPhysicalPhone ? 1 : 1;
        }
    }
    GASton.Database.register(Config, 'CONFIG', ['forwardToPhysicalPhone', 'gvNumber', 'physicalPhoneContactGuid', 'quickReplyContactGuid', 'additionalToggleEnabledNumbers']);
}
