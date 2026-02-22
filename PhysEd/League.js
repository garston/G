PhysEd.League = class {
    getGameDays() {
        return JSUtil.StringUtil.splitPossiblyEmpty(this.gameDays.toString()).map(day => +day);
    }

    getMailingList() {
        this.mailingList = this.mailingList || GASton.Database.findBy(PhysEd.MailingList, 'guid', this.mailingListGuid);
        return this.mailingList;
    }

    hasPredeterminedSchedule() {
        return this.gameDayCount >= 0;
    }
};

GASton.Database.register(PhysEd.League, 'LEAGUE', ['guid', 'sportName', 'cuteSportName', 'mailingListGuid', 'secondaryMailingListGuid', 'secondaryThreshold', 'playerStatusOptions', 'gameDays', 'gameDayCount']);
