PhysEd.TodayGameService = function() {
    this.today = new Date();
};

PhysEd.TodayGameService.prototype.checkGameStatus = function(){
    this._eachTodayThread(function(opts){
        if(opts.numInPlayers){
            var additionalPlayerStatusParser = this._parseEarlyWarningThread(opts.sportMailingList);
            opts.inBasedThread.sendPlayerCountEmail(additionalPlayerStatusParser);
            this._persistSides(opts.inPlayers.concat(additionalPlayerStatusParser ? additionalPlayerStatusParser.inPlayers : []), opts.sport);
        }
    });
};

PhysEd.TodayGameService.prototype.sendEarlyWarning = function(){
    this._eachTodayThread(function(opts){
        if(opts.sportMailingList.earlyWarningEmail && opts.numInPlayers > opts.sportMailingList.earlyWarningThreshold) {
            GASton.MailSender.sendToList(JSUtil.DateUtil.toPrettyString(this.today), PhysEd.Const.generateEarlyWarningEmailBody(opts.numInPlayers), opts.sportMailingList.earlyWarningEmail);
        }
    });
};

PhysEd.TodayGameService.prototype._eachTodayThread = function(callback) {
    var threads = GmailApp.search('-subject:re:' +
        ' from:' + GASton.MailSender.getNameUsedForSending() +
        ' (' + GASton.Database.hydrateAll(PhysEd.MailingList).map(function(mailingList){return 'to:' + mailingList.email; }).join(' OR ') + ')' +
        ' after:' + JSUtil.DateUtil.toSearchString(JSUtil.DateUtil.addDays(-1, this.today)) +
        ' before:' + JSUtil.DateUtil.toSearchString(this.today),
        0, 1);
    threads.forEach(function(thread){
        var inBasedThread = new PhysEd.InBasedThread(thread);
        var inPlayers = inBasedThread.playerStatusParser.inPlayers;
        var sport = PhysEd.Sport.hydrateByName(inBasedThread.sportName);
        callback.call(this, {
            inBasedThread: inBasedThread,
            inPlayers: inPlayers,
            numInPlayers: inPlayers.length,
            sport: sport,
            sportMailingList: GASton.Database.hydrateBy(PhysEd.SportMailingList, [
                'sportGuid', sport.guid,
                'mailingListGuid', GASton.Database.hydrateBy(PhysEd.MailingList, ['email', inBasedThread.mailingListEmail]).guid
            ])
        });
    }, this);
};

PhysEd.TodayGameService.prototype._parseEarlyWarningThread = function(sportMailingList) {
    if(sportMailingList.earlyWarningEmail){
        var earlyWarningThread = GmailApp.search('from:' + GASton.MailSender.getNameUsedForSending() + ' to:' + sportMailingList.earlyWarningEmail + ' subject:' + JSUtil.DateUtil.toPrettyString(this.today), 0, 1)[0];
        if(earlyWarningThread) {
            return new PhysEd.PlayerStatusParser(earlyWarningThread);
        }
    }
};

PhysEd.TodayGameService.prototype._persistSides = function(inPlayers, sport){
    if(sport.isInPhysEdRotation) {
        var teams = [[], []];
        inPlayers.forEach(function(player, index){
            teams[index % teams.length].push(player.email);
        });

        GASton.Database.persist(PhysEd.Side, new PhysEd.Side(this.today.getMonth() + 1, this.today.getDate(), this.today.getFullYear(), sport.name, '', teams[0]));
        GASton.Database.persist(PhysEd.Side, new PhysEd.Side(this.today.getMonth() + 1, this.today.getDate(), this.today.getFullYear(), sport.name, '', teams[1]));
    }
};
