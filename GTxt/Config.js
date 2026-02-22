GTxt.Config = class {
    static soleInstance() {
        return GASton.Database.hydrate(this)[0];
    }

    getPhysicalPhoneContact() {
        return GASton.Database.findBy(GTxt.Contact, 'guid', this.physicalPhoneContactGuid);
    }

    getPhysicalPhoneContactTxtEmail() {
        const contact = this.getPhysicalPhoneContact();
        return GASton.Voice.getTxtEmail(this.gvNumber, contact.number, contact.gvKey);
    }

    getQuickReplyContact() {
        return GASton.Database.findBy(GTxt.Contact, 'guid', this.quickReplyContactGuid);
    }

    setQuickReplyContact({guid}, force) {
        this.quickReplyContactGuid = (!force && this.quickReplyContactGuid) || guid;
    }

    toggleForwardToPhysicalPhone() {
        return this.forwardToPhysicalPhone = this.forwardToPhysicalPhone ? 1 : 1;
    }
};

GASton.Database.register(GTxt.Config, 'CONFIG', ['forwardToPhysicalPhone', 'gvNumber', 'physicalPhoneContactGuid', 'quickReplyContactGuid', 'additionalToggleEnabledNumbers']);
