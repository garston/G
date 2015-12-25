PhysEd.GamePreparer = function() {
    this.today = new Date();
};

PhysEd.GamePreparer.prototype.checkGameStatus = function(){
    this._eachTodayThread(function(opts){
        if(opts.numInPlayers){
            opts.inBasedThread.sendPlayerCountEmail(opts.playerStatusParser);
            this._persistSides(opts);
        }
    });
};

PhysEd.GamePreparer.prototype.notifyGameTomorrow = function(){
    var sportMailingListsByMailingListGuid = JSUtil.ArrayUtil.groupBy(GASton.Database.hydrate(PhysEd.SportMailingList), function(sportMailingList){ return sportMailingList.mailingListGuid; });
    for(var mailingListGuid in sportMailingListsByMailingListGuid) {
        var tomorrowDay = (this.today.getDay() + 1) % 7;
        var tomorrowSports = sportMailingListsByMailingListGuid[mailingListGuid].filter(function (sportMailingList) { return JSUtil.ArrayUtil.contains(sportMailingList.getGameDays(), tomorrowDay); });
        if(tomorrowSports.length){
            var sportMailingList = tomorrowSports.length === 1 ? tomorrowSports[0] : this._findInProgressSport(tomorrowSports) || this._findLowestSport(tomorrowSports);
            PhysEd.InBasedThread.sendInitialEmail(sportMailingList, tomorrowDay);

            sportMailingList.gameDayCount += 1;
            GASton.Database.persistOnly(PhysEd.SportMailingList, sportMailingList, ['gameDayCount']);
        }
    }
};

PhysEd.GamePreparer.prototype.sendEarlyWarning = function(){
    this._eachTodayThread(function(opts){
        if(opts.sportMailingList.earlyWarningEmail && opts.numInPlayers > opts.sportMailingList.earlyWarningThreshold) {
            GASton.MailSender.sendToList(JSUtil.DateUtil.toPrettyString(this.today), PhysEd.Const.generateEarlyWarningEmailBody(opts.numInPlayers), opts.sportMailingList.earlyWarningEmail);
        }
    });
};

PhysEd.GamePreparer.prototype._eachTodayThread = function(callback) {
    var threads = GmailApp.search('-subject:re:' +
        ' from:' + GASton.MailSender.getNameUsedForSending() +
        ' (' + GASton.Database.hydrate(PhysEd.MailingList).map(function(mailingList){ return 'to:' + mailingList.email; }).join(' OR ') + ')' +
        ' after:' + JSUtil.DateUtil.toSearchString(JSUtil.DateUtil.addDays(-1, this.today)) +
        ' before:' + JSUtil.DateUtil.toSearchString(this.today),
        0, 1);
    threads.forEach(function(thread){
        var inBasedThread = new PhysEd.InBasedThread(thread);
        var sport = PhysEd.Sport.hydrateByName(inBasedThread.sportName);
        var mailingListGuid = JSUtil.ArrayUtil.find(GASton.Database.hydrate(PhysEd.MailingList), function(mailingList){
            return mailingList.email === inBasedThread.mailingListEmail;
        }).guid;
        var sportMailingList = JSUtil.ArrayUtil.find(GASton.Database.hydrate(PhysEd.SportMailingList), function(sportMailingList){
            return sportMailingList.sportGuid === sport.guid && sportMailingList.mailingListGuid === mailingListGuid;
        });
        var earlyWarningThread = sportMailingList.earlyWarningEmail &&
            GmailApp.search('from:' + GASton.MailSender.getNameUsedForSending() +
                ' to:' + sportMailingList.earlyWarningEmail +
                ' subject:' + JSUtil.DateUtil.toPrettyString(this.today), 0, 1
            )[0];
        var playerStatusParser = new PhysEd.PlayerStatusParser([thread].concat(earlyWarningThread ? [earlyWarningThread] : []));
        var inPlayers = playerStatusParser.inPlayers;

        callback.call(this, {
            inBasedThread: inBasedThread,
            inPlayers: inPlayers,
            numInPlayers: inPlayers.length,
            playerStatusParser: playerStatusParser,
            sport: sport,
            sportMailingList: sportMailingList
        });
    }, this);
};

PhysEd.GamePreparer.prototype._findInProgressSport = function(sportMailingLists) {
    return JSUtil.ArrayUtil.find(sportMailingLists, function(sportMailingList){ return sportMailingList.gameDayCount % sportMailingList.getGameDays().length !== 0; });
};

PhysEd.GamePreparer.prototype._findLowestSport = function(sportMailingLists) {
    return sportMailingLists.reduce(function(lowestSport, sportMailingList){ return sportMailingList.gameDayCount < lowestSport.gameDayCount ? sportMailingList : lowestSport; });
};

PhysEd.GamePreparer.prototype._persistSides = function(opts){
    if(opts.sportMailingList.prePersistSides) {
        var teams = [[], []];
        opts.inPlayers.forEach(function(player, index){
            teams[index % teams.length].push(player.email);
        });

        GASton.Database.persist(PhysEd.Side, new PhysEd.Side(this.today.getMonth() + 1, this.today.getDate(), this.today.getFullYear(), opts.sport.name, '', teams[0]));
        GASton.Database.persist(PhysEd.Side, new PhysEd.Side(this.today.getMonth() + 1, this.today.getDate(), this.today.getFullYear(), opts.sport.name, '', teams[1]));
    }
};
