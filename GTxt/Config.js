GTxt.Config = function(){};
GTxt.Config.soleInstance = function(){ return GASton.Database.hydrate(this)[0]; };

GTxt.Config.prototype.getPhysicalPhoneContact = function(){ return GASton.Database.findBy(GTxt.Contact, 'guid', this.physicalPhoneContactGuid); };
GTxt.Config.prototype.toggleForwardToPhysicalPhone = function(){ return this.forwardToPhysicalPhone = this.forwardToPhysicalPhone ? 0 : 1; };

GASton.Database.register(GTxt.Config, 'CONFIG', ['forwardToPhysicalPhone', 'gvNumber', 'physicalPhoneContactGuid', 'additionalToggleEnabledNumbers']);
