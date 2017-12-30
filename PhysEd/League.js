PhysEd.League = function(){};

PhysEd.League.prototype.getGameDays = function(){
    return JSUtil.ArrayUtil.compact(this.gameDays.toString().split(',')).map(function(day){ return +day; });
};

PhysEd.League.prototype.getMailingList = function(){
    this.mailingList = this.mailingList || GASton.Database.findBy(PhysEd.MailingList, 'guid', this.mailingListGuid);
    return this.mailingList;
};

PhysEd.League.prototype.hasPredeterminedSchedule = function(){ return this.gameDayCount >= 0; };

PhysEd.League.__props = ['guid', 'sportName', 'cuteSportName', 'mailingListGuid', 'earlyWarningMailingListGuid', 'earlyWarningThreshold', 'gameDays', 'gameDayCount'];
PhysEd.League.__tableName = 'LEAGUE';
