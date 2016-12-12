PhysEd.GamePreparer = function() {
    this.today = new Date();
};

PhysEd.GamePreparer.prototype.checkGameStatus = function(){
    this._eachTodayThread(function(opts){
        this._sendPlayerCountEmail(opts);
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
            forEach(function(league){
                var subject = (league.cuteSportName ? league.cuteSportName + ' ' + JSUtil.DateUtil.dayOfWeekString(tomorrowDay) : league.sportName + ' Tomorrow') +
                    JSUtil.ArrayUtil.range(Math.floor(Math.random() * 6)).reduce(function(str){ return str + '!'; }, '');
                GASton.Mail.sendToList(subject, '', league.getMailingList().email);
            });

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
                var earlyWarningEmailBody = opts.league.getMailingList().name + ' crew is looking to get a game together today. We play at ' + opts.league.getMailingList().gameLocation +
                    '. <b>' + opts.playerStatusParser.inPlayers.length + '</b> people are currently in. Anybody interested?';
                GASton.Mail.sendToList(JSUtil.DateUtil.toPrettyString(this.today), earlyWarningEmailBody, opts.earlyWarningMailingList.email);
            }

            emailIntro.push('Email ' + (thresholdReached ? '' : 'not ') + 'sent to ' + opts.earlyWarningMailingList.name + ' list. Current numbers:');
        }

        this._sendPlayerCountEmail(opts, emailIntro);
    });
};

PhysEd.GamePreparer.prototype._eachTodayThread = function(callback) {
    var leagues = GASton.Database.hydrate(PhysEd.League);

    var threads = GmailApp.search('-subject:re:' +
        ' from:' + GASton.Mail.getNameUsedForSending() +
        ' (' + JSUtil.ArrayUtil.unique(leagues.map(function(league){ return 'to:' + league.getMailingList().email; })).join(' OR ') + ')' +
        ' after:' + JSUtil.DateUtil.toSearchString(JSUtil.DateUtil.addDays(-1, this.today)) +
        ' before:' + JSUtil.DateUtil.toSearchString(this.today)
    );

    var threadInfos = threads.map(function(thread){
        var sportName = thread.getFirstMessageSubject().replace(/ [a-z]+[!]*$/i, '');
        var mailingList = GASton.Database.findBy(PhysEd.MailingList, 'email', thread.getMessages()[0].getReplyTo());
        var league = JSUtil.ArrayUtil.find(leagues, function(league){
            return (league.cuteSportName || league.sportName) === sportName && league.mailingListGuid === mailingList.guid;
        });

        var threads = [thread];
        var earlyWarningMailingList;
        if(league.earlyWarningMailingListGuid) {
            earlyWarningMailingList = GASton.Database.findBy(PhysEd.MailingList, 'guid', league.earlyWarningMailingListGuid);
            var earlyWarningThread = GmailApp.search(
                'from:' + GASton.Mail.getNameUsedForSending() +
                ' to:' + earlyWarningMailingList.email +
                ' subject:' + JSUtil.DateUtil.toPrettyString(this.today),
            0, 1)[0];
            threads = threads.concat(earlyWarningThread || []);
        }

        return {
            earlyWarningMailingList: earlyWarningMailingList,
            league: league,
            playerStatusParser: new PhysEd.PlayerStatusParser(threads),
            thread: thread
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

PhysEd.GamePreparer.prototype._persistSides = function(opts){
    if(GASton.Database.hydrate(PhysEd.Game).some(function(game){ return game.leagueGuid === opts.league.guid; })) {
        var teams = [[], []];
        opts.playerStatusParser.inPlayers.forEach(function(player, index){
            teams[index % teams.length].push(player.email);
        });

        GASton.Database.persist(PhysEd.Side, new PhysEd.Side(this.today.getMonth() + 1, this.today.getDate(), this.today.getFullYear(), opts.league.guid, '', teams[0]));
        GASton.Database.persist(PhysEd.Side, new PhysEd.Side(this.today.getMonth() + 1, this.today.getDate(), this.today.getFullYear(), opts.league.guid, '', teams[1]));
    }
};

PhysEd.GamePreparer.prototype._sendPlayerCountEmail = function(opts, introLines) {
    if(opts.playerStatusParser.inPlayers.length) {
        var bodyLines = (introLines || []).
            concat(JSUtil.ArrayUtil.compact([
                this._toPlayerNames('In', opts.playerStatusParser.inPlayers),
                this._toPlayerNames('Maybe', opts.playerStatusParser.maybePlayers),
                this._toPlayerNames('Out', opts.playerStatusParser.outPlayers),
                this._toPlayerNames('Unknown', opts.playerStatusParser.unknownPlayers)
            ])).
            concat('').
            concat(opts.competingThreadInfos.map(function(threadInfo){
                return threadInfo.league.sportName + ' currently has ' + threadInfo.playerStatusParser.inPlayers.length + ' players in';
            }));
        GASton.Mail.replyAll(opts.thread, bodyLines.join('<br/>'), opts.league.getMailingList().email);
    }
};

PhysEd.GamePreparer.prototype._toPlayerNames = function(categoryDisplayString, players) {
    if(players.length){
        var playerStrings = players.map(PhysEd.Transformers.personToDisplayString);
        return categoryDisplayString + ' (' + playerStrings.length + '): ' + playerStrings.join(', ');
    }
};
