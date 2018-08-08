GTxt.Config = function(){};
GTxt.Config.prototype.getPhysicalPhoneContact = function(){ return GASton.Database.findBy(GTxt.Contact, 'guid', this.physicalPhoneContactGuid); };

GASton.Database.register(GTxt.Config, 'CONFIG', ['forwardToPhysicalPhone', 'gvNumber', 'physicalPhoneContactGuid', 'additionalToggleEnabledNumbers']);
