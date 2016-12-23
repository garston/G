GTxt.Config = function(){};
GTxt.Config.prototype.getPhysicalPhoneContact = function(){ return GASton.Database.findBy(GTxt.Contact, 'guid', this.physicalPhoneContactGuid); };
GTxt.Config.__props = ['isEnabled', 'gvNumber', 'physicalPhoneContactGuid', 'additionalToggleEnabledNumbers'];
GTxt.Config.__tableName = 'CONFIG';
