PhysEd.GamePreparer = function() {
    this.today = new Date();
};

PhysEd.GamePreparer.prototype.notifyGameTomorrow = function(){
    var leaguesByMailingListGuid = JSUtil.ArrayUtil.groupBy(GASton.Database.hydrate(PhysEd.League), function(league){ return league.mailingListGuid; });
    for(var mailingListGuid in leaguesByMailingListGuid) {
        var tomorrowDay = (this.today.getDay() + 1) % 7;
        const tomorrowSports = leaguesByMailingListGuid[mailingListGuid].filter(league => league.getGameDays().includes(tomorrowDay));
        var sportsByScheduleType = JSUtil.ArrayUtil.groupBy(tomorrowSports, function(league){ return league.hasPredeterminedSchedule(); });
        var chosenSport = sportsByScheduleType[true] && (this._findInProgressSport(sportsByScheduleType[true]) || this._findLowestSport(sportsByScheduleType[true]));
        (sportsByScheduleType[false] || []).
            concat(chosenSport || []).
            forEach(function(league){
                var subject = (league.cuteSportName ? league.cuteSportName + ' ' + JSUtil.DateUtil.dayOfWeekString(tomorrowDay) : league.sportName + ' Tomorrow') +
                    JSUtil.ArrayUtil.range(Math.floor(Math.random() * 6)).reduce(function(str){ return str + '!'; }, '');
                var mailingList = league.getMailingList();

                GASton.Mail.sendToList(mailingList.email, subject, '');

                var flowdock = mailingList.createFlowdock();
                if(flowdock) {
                    this._sendFlowdockMessage(league, subject, flowdock);
                }
            }, this);

        if(chosenSport){
            chosenSport.gameDayCount += 1;
        }
    }
};

PhysEd.GamePreparer.prototype.persistSides = function(){
    this._eachTodayThread(function(opts){
        if(GASton.Database.hydrate(PhysEd.Game).some(function(game){ return game.leagueGuid === opts.league.guid; })) {
            var teams = [[], []];
            opts.playerStatusParser.inPlayers.concat(opts.playerStatusParser.maybePlayers).forEach(function(player, index){
                teams[index % teams.length].push(player.email);
            });

            new PhysEd.Side(this.today.getMonth() + 1, this.today.getDate(), this.today.getFullYear(), opts.league.guid, '', teams[0]);
            new PhysEd.Side(this.today.getMonth() + 1, this.today.getDate(), this.today.getFullYear(), opts.league.guid, '', teams[1]);
        }
    });
};

PhysEd.GamePreparer.prototype.sendPlayerCounts = function(){
    this._eachTodayThread(function(opts){
        if(JSUtil.ArrayUtil.last(opts.dateSortedMessages).sentByScript){
            return;
        }

        var currentNumbers = opts.dateSortedMessages.reduce(function(statusCall, msg){
            var match = JSUtil.StringUtil.matchSafe(msg.words.join(' '), /^game (on|off)/i);
            return match.length ? [[match[0].toUpperCase(), 'has been called at', msg.date, 'by', msg.fromParts.firstName, msg.fromParts.lastName + '!'].join(' ')] : statusCall;
        }, []).concat(JSUtil.ArrayUtil.compact([
            this._toPlayerNames('In', opts.playerStatusParser.inPlayers),
            this._toPlayerNames('Maybe', opts.playerStatusParser.maybePlayers),
            this._toPlayerNames('Out', opts.playerStatusParser.outPlayers),
            this._toPlayerNames('Unknown', opts.playerStatusParser.unknownPlayers)
        ]));

        var numbersAndCompetition = currentNumbers.concat('').concat(opts.competingThreadInfos.map(function(threadInfo){
            return threadInfo.league.sportName + ' currently has ' + threadInfo.playerStatusParser.inPlayers.length + ' players in';
        }));

        var primaryIntro = [];
        if(opts.secondaryMailingList) {
            var secondaryEmail = opts.secondaryMailingList.email;

            if(opts.secondaryThread){
                GASton.Mail.replyAll(opts.secondaryThread.getMessages()[0], numbersAndCompetition.join('<br/>'), {replyTo: secondaryEmail});
            }else if(opts.playerStatusParser.inPlayers.length >= opts.league.secondaryThreshold) {
                GASton.Mail.sendToList(secondaryEmail, JSUtil.DateUtil.toPrettyString(this.today), [
                    opts.mailingList.name + ' crew is looking to get a game together today. We play at ' + opts.mailingList.gameLocation + '. Anybody interested?',
                    ''
                ].concat(numbersAndCompetition).join('<br/>'));
                primaryIntro = ['Email sent to ' + opts.secondaryMailingList.name + ' list', ''];
            }
        }

        GASton.Mail.replyAll(opts.thread.getMessages()[0], primaryIntro.concat(numbersAndCompetition).join('<br/>'), {replyTo: opts.mailingList.email});
        if(opts.flowdockThreadId) {
            this._sendFlowdockMessage(opts.league, primaryIntro.concat(currentNumbers), opts.flowdock, opts.flowdockThreadId);
        }
    });
};

PhysEd.GamePreparer.prototype._eachTodayThread = function(callback) {
    var leagues = GASton.Database.hydrate(PhysEd.League);

    var threads = GmailApp.search('-subject:re:' +
        ' from:' + GASton.Mail.getNameUsedForSending() +
        ' (' + JSUtil.ArrayUtil.unique(leagues.map(function(league){ return 'to:' + league.getMailingList().email; })).join(' OR ') + ')' +
        ' after:' + GASton.Mail.toSearchString(JSUtil.DateUtil.addDays(-1, this.today)) +
        ' before:' + GASton.Mail.toSearchString(this.today)
    );

    var threadInfos = threads.map(function(thread){
        var sportName = thread.getFirstMessageSubject().replace(/ [a-z]+[!]*$/i, '');
        var mailingList = GASton.Database.findBy(PhysEd.MailingList, 'email', thread.getMessages()[0].getReplyTo());
        const league = leagues.find(league => (league.cuteSportName || league.sportName) === sportName && league.mailingListGuid === mailingList.guid);

        var threads = [thread];
        var secondaryMailingList, secondaryThread;
        if(league.secondaryMailingListGuid) {
            secondaryMailingList = GASton.Database.findBy(PhysEd.MailingList, 'guid', league.secondaryMailingListGuid);
            secondaryThread = GmailApp.search(
                'from:' + GASton.Mail.getNameUsedForSending() +
                ' to:' + secondaryMailingList.email +
                ' subject:' + JSUtil.DateUtil.toPrettyString(this.today),
            0, 1)[0];
            threads = threads.concat(secondaryThread || []);
        }

        var flowdock = mailingList.createFlowdock();
        var flowdockThreadInfo = this._parseFlowdockThread(flowdock, sportName);
        var dateSortedMessages = PhysEd.MessageAdapter.gmailThreads(threads).
            concat(flowdockThreadInfo.messages).
            sort(function(m1, m2){ return m1.date - m2.date; });
        return {
            dateSortedMessages: dateSortedMessages,
            flowdock: flowdock,
            flowdockThreadId: flowdockThreadInfo.threadId,
            league: league,
            mailingList: mailingList,
            playerStatusParser: new PhysEd.PlayerStatusParser(dateSortedMessages),
            secondaryMailingList: secondaryMailingList,
            secondaryThread: secondaryThread,
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
    return leagues.find(league => league.gameDayCount % league.getGameDays().length !== 0);
};

PhysEd.GamePreparer.prototype._findLowestSport = function(leagues) {
    return leagues.reduce(function(lowestSport, league){ return league.gameDayCount < lowestSport.gameDayCount ? league : lowestSport; });
};

PhysEd.GamePreparer.prototype._parseFlowdockThread = function (flowdock, sportName) {
    if (flowdock) {
        var flowMessages = flowdock.fetchMessages();

        var startOfToday = JSUtil.DateUtil.startOfDay(this.today);
        var startOfYesterday = JSUtil.DateUtil.addDays(-1, startOfToday);
        const threadStarterMessage = flowMessages.find(m =>
            m.thread.initial_message === m.id &&
                flowdock.isSentByScript(m) &&
                m.sent > startOfYesterday.getTime() &&
                m.sent < startOfToday.getTime() &&
                m.content.includes(sportName));

        if (threadStarterMessage) {
            var threadId = threadStarterMessage.thread_id;
            return {
                messages: PhysEd.MessageAdapter.flowdockMessages(flowMessages.filter(function(m){ return m.thread_id === threadId; }), flowdock),
                threadId: threadId
            };
        }
    }
    return { messages: [] };
};

PhysEd.GamePreparer.prototype._sendFlowdockMessage = function(league, bodyLines, flowdock, threadId) {
    var sportName = league.sportName.toLowerCase();
    var tag = GASton.Database.hydrate(PhysEd.League).some(function(l){ return l !== league && l.mailingListGuid === league.mailingListGuid; }) ? '@@' + sportName : '@team';
    flowdock.sendMessage([tag + ' :' + sportName + ':'].concat(bodyLines).join('\n'), threadId);
};

PhysEd.GamePreparer.prototype._toPlayerNames = function(categoryDisplayString, players) {
    if(players.length){
        var playerStrings = players.map(PhysEd.Transformers.personToDisplayString);
        return categoryDisplayString + ' (' + playerStrings.length + '): ' + playerStrings.join(', ');
    }
};
