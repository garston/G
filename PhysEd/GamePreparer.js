PhysEd.GamePreparer = function() {
    this.today = new Date();
};

PhysEd.GamePreparer.prototype.checkGameStatus = function(){
    this._eachTodayThread(function(opts){
        opts.inBasedThread.sendPlayerCountEmail(opts.playerStatusParser, [], this._generateCompetingThreadsMessage(opts));
        this._persistSides(opts);
    });
};

PhysEd.GamePreparer.prototype.notifyGameTomorrow = function(){
    var leaguesByMailingListGuid = JSUtil.ArrayUtil.groupBy(GASton.Database.hydrate(PhysEd.League), function(league){ return league.mailingListGuid; });
    for(var mailingListGuid in leaguesByMailingListGuid) {
        var tomorrowDay = (this.today.getDay() + 1) % 7;
        var tomorrowSports = leaguesByMailingListGuid[mailingListGuid].filter(function (league) { return JSUtil.ArrayUtil.contains(league.getGameDays(), tomorrowDay); });
        var sportsByScheduleType = JSUtil.ArrayUtil.groupBy(tomorrowSports, function(league){ return league.hasPredeterminedSchedule(); });
        var chosenSport = sportsByScheduleType[true] && (this._findInProgressSport(sportsByScheduleType[true]) || this._findLowestSport(sportsByScheduleType[true]));
        (sportsByScheduleType[false] || []).
            concat(chosenSport || []).
            forEach(function(league){ PhysEd.InBasedThread.sendInitialEmail(league, tomorrowDay); });

        if(chosenSport){
            chosenSport.gameDayCount += 1;
            GASton.Database.persist(PhysEd.League, chosenSport);
        }
    }
};

PhysEd.GamePreparer.prototype.sendEarlyWarning = function(){
    this._eachTodayThread(function(opts){
        var emailIntro = [];
        if(opts.earlyWarningMailingList) {
            var thresholdReached = opts.playerStatusParser.inPlayers.length >= opts.league.earlyWarningThreshold;
            if(thresholdReached) {
                GASton.MailSender.sendToList(
                    JSUtil.DateUtil.toPrettyString(this.today),
                    PhysEd.Const.generateEarlyWarningEmailBody(opts.playerStatusParser.inPlayers.length),
                    opts.earlyWarningMailingList.email
                );
            }

            emailIntro.push('Email ' + (thresholdReached ? '' : 'not ') + 'sent to ' + opts.earlyWarningMailingList.name + ' list. Current numbers:');
        }

        opts.inBasedThread.sendPlayerCountEmail(opts.playerStatusParser, emailIntro, this._generateCompetingThreadsMessage(opts));
    });
};

PhysEd.GamePreparer.prototype._eachTodayThread = function(callback) {
    var mailingLists = GASton.Database.hydrate(PhysEd.MailingList);
    var leagues = GASton.Database.hydrate(PhysEd.League);
    var primaryMailingLists = JSUtil.ArrayUtil.unique(leagues.map(function(league){
        return JSUtil.ArrayUtil.find(mailingLists, function(mailingList){ return mailingList.guid === league.mailingListGuid; });
    }));

    var threads = GmailApp.search('-subject:re:' +
        ' from:' + GASton.MailSender.getNameUsedForSending() +
        ' (' + primaryMailingLists.map(function(mailingList){ return 'to:' + mailingList.email; }).join(' OR ') + ')' +
        ' after:' + JSUtil.DateUtil.toSearchString(JSUtil.DateUtil.addDays(-1, this.today)) +
        ' before:' + JSUtil.DateUtil.toSearchString(this.today)
    );

    var threadInfos = threads.map(function(thread){
        var inBasedThread = new PhysEd.InBasedThread(thread);
        var mailingListGuid = JSUtil.ArrayUtil.find(mailingLists, function(mailingList){ return mailingList.email === inBasedThread.mailingListEmail; }).guid;
        var league = JSUtil.ArrayUtil.find(leagues, function(league){ return league.sportName === inBasedThread.sportName && league.mailingListGuid === mailingListGuid; });

        var threads = [thread];
        var earlyWarningMailingList;
        if(league.earlyWarningMailingListGuid) {
            earlyWarningMailingList = JSUtil.ArrayUtil.find(mailingLists, function(mailingList){ return mailingList.guid === league.earlyWarningMailingListGuid; });
            var earlyWarningThread = GmailApp.search(
                'from:' + GASton.MailSender.getNameUsedForSending() +
                ' to:' + earlyWarningMailingList.email +
                ' subject:' + JSUtil.DateUtil.toPrettyString(this.today),
            0, 1)[0];
            threads = threads.concat(earlyWarningThread || []);
        }

        return {
            earlyWarningMailingList: earlyWarningMailingList,
            inBasedThread: inBasedThread,
            league: league,
            playerStatusParser: new PhysEd.PlayerStatusParser(threads)
        };
    }, this);

    threadInfos.forEach(function(threadInfo){
        threadInfo.competingThreadInfos = threadInfo.league.hasPredeterminedSchedule() ? [] : threadInfos.filter(function(otherThreadInfo){
            return otherThreadInfo !== threadInfo && otherThreadInfo.league.mailingListGuid === threadInfo.league.mailingListGuid;
        });
        callback.call(this, threadInfo);
    }, this);
};

PhysEd.GamePreparer.prototype._findInProgressSport = function(leagues) {
    return JSUtil.ArrayUtil.find(leagues, function(league){ return league.gameDayCount % league.getGameDays().length !== 0; });
};

PhysEd.GamePreparer.prototype._findLowestSport = function(leagues) {
    return leagues.reduce(function(lowestSport, league){ return league.gameDayCount < lowestSport.gameDayCount ? league : lowestSport; });
};

PhysEd.GamePreparer.prototype._generateCompetingThreadsMessage = function(opts){
    return opts.competingThreadInfos.map(function(threadInfo){
        return 'Other sport option for today, ' + threadInfo.inBasedThread.sportName + ', currently has ' + threadInfo.playerStatusParser.inPlayers.length + ' players in';
    });
};

PhysEd.GamePreparer.prototype._persistSides = function(opts){
    if(opts.league.prePersistSides) {
        var teams = [[], []];
        opts.playerStatusParser.inPlayers.forEach(function(player, index){
            teams[index % teams.length].push(player.email);
        });

        GASton.Database.persist(PhysEd.Side, new PhysEd.Side(this.today.getMonth() + 1, this.today.getDate(), this.today.getFullYear(), opts.league.guid, '', teams[0]));
        GASton.Database.persist(PhysEd.Side, new PhysEd.Side(this.today.getMonth() + 1, this.today.getDate(), this.today.getFullYear(), opts.league.guid, '', teams[1]));
    }
};
