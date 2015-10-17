PhysEd.GamePreparer = function() {
    this.today = new Date();
};

PhysEd.GamePreparer.prototype.checkGameStatus = function(){
    this._eachTodayThread(function(opts){
        if(opts.numInPlayers){
            var additionalPlayerStatusParser = this._parseEarlyWarningThread(opts.sportMailingList);
            opts.inBasedThread.sendPlayerCountEmail(additionalPlayerStatusParser);
            this._persistSides(opts.inPlayers.concat(additionalPlayerStatusParser ? additionalPlayerStatusParser.inPlayers : []), opts.sport);
        }
    });
};

PhysEd.GamePreparer.prototype.notifyGameTomorrow = function(){
    var sport = this._determineSport();
    if(sport){
        PhysEd.InBasedThread.sendInitialEmails(sport);

        sport.gameDayCount += 1;
        GASton.Database.persist(PhysEd.Sport, sport);
    }
};

PhysEd.GamePreparer.prototype.sendEarlyWarning = function(){
    this._eachTodayThread(function(opts){
        if(opts.sportMailingList.earlyWarningEmail && opts.numInPlayers > opts.sportMailingList.earlyWarningThreshold) {
            GASton.MailSender.sendToList(JSUtil.DateUtil.toPrettyString(this.today), PhysEd.Const.generateEarlyWarningEmailBody(opts.numInPlayers), opts.sportMailingList.earlyWarningEmail);
        }
    });
};

PhysEd.GamePreparer.prototype._determineSport = function(){
    var tomorrowDay = (this.today.getDay() + 1) % 7;
    var sports = GASton.Database.hydrateAll(PhysEd.Sport).filter(function (sport) { return JSUtil.StringUtil.contains(sport.gameDays.toString(), tomorrowDay); });
    return sports.length && (sports.length === 1 ? sports[0] : this._findInProgressSport(sports) || this._findLowestSport(sports));
};

PhysEd.GamePreparer.prototype._eachTodayThread = function(callback) {
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

PhysEd.GamePreparer.prototype._findInProgressSport = function(sports) {
    var timesPerSportBeforeSwitching = 2;
    return JSUtil.ArrayUtil.find(sports, function(sport){ return sport.gameDayCount % timesPerSportBeforeSwitching !== 0; });
};

PhysEd.GamePreparer.prototype._findLowestSport = function(sports) {
    return sports.reduce(function(lowestSport, sport){ return sport.gameDayCount < lowestSport.gameDayCount ? sport : lowestSport; });
};

PhysEd.GamePreparer.prototype._parseEarlyWarningThread = function(sportMailingList) {
    if(sportMailingList.earlyWarningEmail){
        var earlyWarningThread = GmailApp.search('from:' + GASton.MailSender.getNameUsedForSending() + ' to:' + sportMailingList.earlyWarningEmail + ' subject:' + JSUtil.DateUtil.toPrettyString(this.today), 0, 1)[0];
        if(earlyWarningThread) {
            return new PhysEd.PlayerStatusParser(earlyWarningThread);
        }
    }
};

PhysEd.GamePreparer.prototype._persistSides = function(inPlayers, sport){
    if(sport.prePersistSides) {
        var teams = [[], []];
        inPlayers.forEach(function(player, index){
            teams[index % teams.length].push(player.email);
        });

        GASton.Database.persist(PhysEd.Side, new PhysEd.Side(this.today.getMonth() + 1, this.today.getDate(), this.today.getFullYear(), sport.name, '', teams[0]));
        GASton.Database.persist(PhysEd.Side, new PhysEd.Side(this.today.getMonth() + 1, this.today.getDate(), this.today.getFullYear(), sport.name, '', teams[1]));
    }
};
