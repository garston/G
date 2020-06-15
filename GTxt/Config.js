GTxt.Config = function(){};
GTxt.Config.soleInstance = function(){ return GASton.Database.hydrate(this)[0]; };

GTxt.Config.prototype.getPhysicalPhoneContact = function(){ return GASton.Database.findBy(GTxt.Contact, 'guid', this.physicalPhoneContactGuid); };
GTxt.Config.prototype.getPhysicalPhoneContactTxtEmail = function(){ return GTxt.Voice.getTxtEmail(this.getPhysicalPhoneContact(), this); };
GTxt.Config.prototype.getQuickReplyContact = function(){ return GASton.Database.findBy(GTxt.Contact, 'guid', this.quickReplyContactGuid); };
GTxt.Config.prototype.setQuickReplyContact = function({guid}, force){ this.quickReplyContactGuid = (!force && this.quickReplyContactGuid) || guid; };
GTxt.Config.prototype.toggleForwardToPhysicalPhone = function(){ return this.forwardToPhysicalPhone = this.forwardToPhysicalPhone ? 0 : 1; };

GASton.Database.register(GTxt.Config, 'CONFIG', ['forwardToPhysicalPhone', 'gvNumber', 'physicalPhoneContactGuid', 'quickReplyContactGuid', 'additionalToggleEnabledNumbers']);
