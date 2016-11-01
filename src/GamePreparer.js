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
    var sportMailingListsByMailingListGuid = JSUtil.ArrayUtil.groupBy(GASton.Database.hydrate(PhysEd.SportMailingList), function(sportMailingList){ return sportMailingList.mailingListGuid; });
    for(var mailingListGuid in sportMailingListsByMailingListGuid) {
        var tomorrowDay = (this.today.getDay() + 1) % 7;
        var tomorrowSports = sportMailingListsByMailingListGuid[mailingListGuid].filter(function (sportMailingList) { return JSUtil.ArrayUtil.contains(sportMailingList.getGameDays(), tomorrowDay); });
        var sportsByScheduleType = JSUtil.ArrayUtil.groupBy(tomorrowSports, function(sml){ return sml.hasPredeterminedSchedule(); });
        var chosenSport = sportsByScheduleType[true] && (this._findInProgressSport(sportsByScheduleType[true]) || this._findLowestSport(sportsByScheduleType[true]));
        (sportsByScheduleType[false] || []).
            concat(chosenSport || []).
            forEach(function(sml){ PhysEd.InBasedThread.sendInitialEmail(sml, tomorrowDay); });

        if(chosenSport){
            chosenSport.gameDayCount += 1;
            GASton.Database.persist(PhysEd.SportMailingList, chosenSport);
        }
    }
};

PhysEd.GamePreparer.prototype.sendEarlyWarning = function(){
    this._eachTodayThread(function(opts){
        var emailIntro = [];
        if(opts.earlyWarningMailingList) {
            var thresholdReached = opts.playerStatusParser.inPlayers.length >= opts.sportMailingList.earlyWarningThreshold;
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
    var sportMailingLists = GASton.Database.hydrate(PhysEd.SportMailingList);
    var primaryMailingLists = JSUtil.ArrayUtil.unique(sportMailingLists.map(function(sportMailingList){
        return JSUtil.ArrayUtil.find(mailingLists, function(mailingList){ return mailingList.guid === sportMailingList.mailingListGuid; });
    }));

    var threads = GmailApp.search('-subject:re:' +
        ' from:' + GASton.MailSender.getNameUsedForSending() +
        ' (' + primaryMailingLists.map(function(mailingList){ return 'to:' + mailingList.email; }).join(' OR ') + ')' +
        ' after:' + JSUtil.DateUtil.toSearchString(JSUtil.DateUtil.addDays(-1, this.today)) +
        ' before:' + JSUtil.DateUtil.toSearchString(this.today)
    );

    var threadInfos = threads.map(function(thread){
        var inBasedThread = new PhysEd.InBasedThread(thread);
        var sport = PhysEd.Sport.hydrateByName(inBasedThread.sportName);

        var mailingListGuid = JSUtil.ArrayUtil.find(mailingLists, function(mailingList){ return mailingList.email === inBasedThread.mailingListEmail; }).guid;
        var sportMailingList = JSUtil.ArrayUtil.find(sportMailingLists, function(sportMailingList){
            return sportMailingList.sportGuid === sport.guid && sportMailingList.mailingListGuid === mailingListGuid;
        });

        var threads = [thread];
        var earlyWarningMailingList;
        var earlyWarningMailingListGuid = sportMailingList.earlyWarningMailingListGuid;
        if(earlyWarningMailingListGuid) {
            earlyWarningMailingList = JSUtil.ArrayUtil.find(mailingLists, function(mailingList){ return mailingList.guid === earlyWarningMailingListGuid; });
            var earlyWarningThread = GmailApp.search(
                'from:' + GASton.MailSender.getNameUsedForSending() +
                ' to:' + earlyWarningMailingList.email +
                ' subject:' + JSUtil.DateUtil.toPrettyString(this.today),
            0, 1)[0];
            if(earlyWarningThread){
                threads.push(earlyWarningThread);
            }
        }

        return {
            earlyWarningMailingList: earlyWarningMailingList,
            inBasedThread: inBasedThread,
            playerStatusParser: new PhysEd.PlayerStatusParser(threads),
            sport: sport,
            sportMailingList: sportMailingList
        };
    }, this);

    threadInfos.forEach(function(threadInfo){
        threadInfo.competingThreadInfos = threadInfo.sportMailingList.hasPredeterminedSchedule() ? [] : threadInfos.filter(function(otherThreadInfo){
            return otherThreadInfo !== threadInfo && otherThreadInfo.sportMailingList.mailingListGuid === threadInfo.sportMailingList.mailingListGuid;
        });
        callback.call(this, threadInfo);
    }, this);
};

PhysEd.GamePreparer.prototype._findInProgressSport = function(sportMailingLists) {
    return JSUtil.ArrayUtil.find(sportMailingLists, function(sportMailingList){ return sportMailingList.gameDayCount % sportMailingList.getGameDays().length !== 0; });
};

PhysEd.GamePreparer.prototype._findLowestSport = function(sportMailingLists) {
    return sportMailingLists.reduce(function(lowestSport, sportMailingList){ return sportMailingList.gameDayCount < lowestSport.gameDayCount ? sportMailingList : lowestSport; });
};

PhysEd.GamePreparer.prototype._generateCompetingThreadsMessage = function(opts){
    return opts.competingThreadInfos.map(function(threadInfo){
        return 'Other sport option for today, ' + threadInfo.sport.name + ', currently has ' + threadInfo.playerStatusParser.inPlayers.length + ' players in';
    });
};

PhysEd.GamePreparer.prototype._persistSides = function(opts){
    if(opts.sportMailingList.prePersistSides) {
        var teams = [[], []];
        opts.playerStatusParser.inPlayers.forEach(function(player, index){
            teams[index % teams.length].push(player.email);
        });

        GASton.Database.persist(PhysEd.Side, new PhysEd.Side(this.today.getMonth() + 1, this.today.getDate(), this.today.getFullYear(), opts.sport.name, '', teams[0]));
        GASton.Database.persist(PhysEd.Side, new PhysEd.Side(this.today.getMonth() + 1, this.today.getDate(), this.today.getFullYear(), opts.sport.name, '', teams[1]));
    }
};
