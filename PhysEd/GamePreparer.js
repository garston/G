PhysEd.GamePreparer = class {
    constructor() {
        this.today = new Date();
    }

    notifyGameTomorrow() {
        const leaguesByMailingListGuid = JSUtil.ArrayUtil.groupBy(GASton.Database.hydrate(PhysEd.League), league => league.mailingListGuid);
        for(const mailingListGuid in leaguesByMailingListGuid) {
            const tomorrowDay = JSUtil.DateUtil.getDay(1);
            const tomorrowSports = leaguesByMailingListGuid[mailingListGuid].filter(league => league.getGameDays().includes(tomorrowDay));
            const sportsByScheduleType = JSUtil.ArrayUtil.groupBy(tomorrowSports, league => league.hasPredeterminedSchedule());
            const chosenSport = sportsByScheduleType[true] && (this._findInProgressSport(sportsByScheduleType[true]) || this._findLowestSport(sportsByScheduleType[true]));
            (sportsByScheduleType[false] || []).
                concat(chosenSport || []).
                forEach(league => {
                    const subject = `${league.cuteSportName ? `${league.cuteSportName} ${JSUtil.DateUtil.dayOfWeekString(tomorrowDay)}` : `${league.sportName} Tomorrow`}!`;
                    const mailingList = league.getMailingList();

                    GASton.Mail.sendToList(mailingList.email, subject, '');

                    const flowdock = mailingList.createFlowdock();
                    if(flowdock) {
                        this._sendFlowdockMessage(league, subject, flowdock);
                    }

                    mailingList.createGroupMePoll(league);
                });

            if(chosenSport){
                chosenSport.gameDayCount += 1;
            }
        }
    }

    persistSides() {
        this._eachTodayThread(opts => {
            if(GASton.Database.hydrate(PhysEd.Game).some(function(game){ return game.leagueGuid === opts.league.guid; })) {
                const teams = [[], []];
                opts.playerStatusParser.inPlayers.concat(opts.playerStatusParser.maybePlayers).forEach(function(player, index){
                    teams[index % teams.length].push(player.email);
                });

                new PhysEd.Side(this.today.getMonth() + 1, this.today.getDate(), this.today.getFullYear(), opts.league.guid, '', teams[0]);
                new PhysEd.Side(this.today.getMonth() + 1, this.today.getDate(), this.today.getFullYear(), opts.league.guid, '', teams[1]);
            }
        });
    }

    sendPlayerCounts() {
        this._eachTodayThread(opts => {
            if(JSUtil.ArrayUtil.last(opts.dateSortedMessages).sentByScript){
                return;
            }

            const currentNumbers = opts.dateSortedMessages.reduce((statusCall, msg) => {
                const match = JSUtil.StringUtil.matchSafe(msg.words.join(' '), /^game (on|off)/i);
                return match.length ? [[match[0].toUpperCase(), 'has been called at', msg.date, 'by', msg.fromParts.firstName, msg.fromParts.lastName + '!'].join(' ')] : statusCall;
            }, []).concat(JSUtil.ArrayUtil.compact([
                this._toPlayerNames('In', opts.playerStatusParser.inPlayers),
                this._toPlayerNames('Maybe', opts.playerStatusParser.maybePlayers),
                this._toPlayerNames('Out', opts.playerStatusParser.outPlayers),
                this._toPlayerNames('Unknown', opts.playerStatusParser.unknownPlayers)
            ]));

            const numbersAndCompetition = currentNumbers.concat('').concat(opts.competingThreadInfos.map(threadInfo => {
                return threadInfo.league.sportName + ' currently has ' + threadInfo.playerStatusParser.inPlayers.length + ' players in';
            }));

            const primaryIntro = [];
            if(opts.secondaryMailingList) {
                const secondaryEmail = opts.secondaryMailingList.email;

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
    }

    _eachTodayThread(callback) {
        const leagues = GASton.Database.hydrate(PhysEd.League);

        const threads = GmailApp.search('-subject:re:' +
            ' from:' + GASton.Mail.getNameUsedForSending() +
            ' (' + JSUtil.ArrayUtil.unique(leagues.map(function(league){ return 'to:' + league.getMailingList().email; })).join(' OR ') + ')' +
            ' after:' + GASton.Mail.toSearchString(JSUtil.DateUtil.addDays(-1, this.today)) +
            ' before:' + GASton.Mail.toSearchString(this.today)
        );

        const threadInfos = threads.map(thread => {
            const sportName = thread.getFirstMessageSubject().replace(/ [a-z]+[!]*$/i, '');
            const mailingList = GASton.Database.findBy(PhysEd.MailingList, 'email', thread.getMessages()[0].getReplyTo());
            const league = leagues.find(league => (league.cuteSportName || league.sportName) === sportName && league.mailingListGuid === mailingList.guid);

            let threads = [thread];
            let secondaryMailingList, secondaryThread;
            if(league.secondaryMailingListGuid) {
                secondaryMailingList = GASton.Database.findBy(PhysEd.MailingList, 'guid', league.secondaryMailingListGuid);
                secondaryThread = GmailApp.search(
                    'from:' + GASton.Mail.getNameUsedForSending() +
                    ' to:' + secondaryMailingList.email +
                    ' subject:' + JSUtil.DateUtil.toPrettyString(this.today),
                0, 1)[0];
                threads = threads.concat(secondaryThread || []);
            }

            const flowdock = mailingList.createFlowdock();
            const flowdockThreadInfo = this._parseFlowdockThread(flowdock, sportName);
            const dateSortedMessages = PhysEd.MessageAdapter.gmailThreads(threads).
                concat(flowdockThreadInfo.messages).
                sort((m1, m2) => m1.date - m2.date);
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
        });

        threadInfos.forEach(threadInfo => {
            threadInfo.competingThreadInfos = threadInfo.league.hasPredeterminedSchedule() ? [] : threadInfos.filter(otherThreadInfo => {
                return otherThreadInfo !== threadInfo && otherThreadInfo.league.mailingListGuid === threadInfo.league.mailingListGuid;
            });
            callback.call(this, threadInfo);
        });
    }

    _findInProgressSport(leagues) {
        return leagues.find(league => league.gameDayCount % league.getGameDays().length !== 0);
    }

    _findLowestSport(leagues) {
        return leagues.reduce((lowestSport, league) => league.gameDayCount < lowestSport.gameDayCount ? league : lowestSport);
    }

    _parseFlowdockThread(flowdock, sportName) {
        if (flowdock) {
            const flowMessages = flowdock.fetchMessages();

            const startOfToday = JSUtil.DateUtil.startOfDay(this.today);
            const startOfYesterday = JSUtil.DateUtil.addDays(-1, startOfToday);
            const threadStarterMessage = flowMessages.find(m =>
                m.thread.initial_message === m.id &&
                    flowdock.isSentByScript(m) &&
                    m.sent > startOfYesterday.getTime() &&
                    m.sent < startOfToday.getTime() &&
                    m.content.includes(sportName));

            if (threadStarterMessage) {
                const threadId = threadStarterMessage.thread_id;
                return {
                    messages: PhysEd.MessageAdapter.flowdockMessages(flowMessages.filter(m => m.thread_id === threadId), flowdock),
                    threadId: threadId
                };
            }
        }
        return { messages: [] };
    }

    _sendFlowdockMessage(league, bodyLines, flowdock, threadId) {
        const sportName = league.sportName.toLowerCase();
        const tag = GASton.Database.hydrate(PhysEd.League).some(l => l !== league && l.mailingListGuid === league.mailingListGuid) ? '@@' + sportName : '@team';
        flowdock.sendMessage([tag + ' :' + sportName + ':'].concat(bodyLines).join('\n'), threadId);
    }

    _toPlayerNames(categoryDisplayString, players) {
        if(players.length){
            const playerStrings = players.map(PhysEd.Transformers.personToDisplayString);
            return categoryDisplayString + ' (' + playerStrings.length + '): ' + playerStrings.join(', ');
        }
    }
};
