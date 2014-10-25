function notifyPhysEd() {
    new PhysEd().notifyPhysEd();
}

function notifyFullCourtWednesday(){
    //InBasedThread.sendInitialEmail(InBasedThread.BASKETBALL_PRETTY_NAME, 'Wednesday', Database.hydrateBy(Sport, ['name', InBasedThread.BASKETBALL_STORED_NAME]));
}

function notifyFullCourtFriday(){
    InBasedThread.sendInitialEmail(InBasedThread.BASKETBALL_PRETTY_NAME, 'Friday', Database.hydrateBy(Sport, ['name', InBasedThread.BASKETBALL_STORED_NAME]));
}

function notifyVolleyball(){
    InBasedThread.sendInitialEmail('Volleyball', 'Tomorrow', undefined, CONST.VOLLEYBALL_EMAIL);
}

function suggestTeams(){
    var threads = GmailApp.search('-subject:re: from:' + CONST.PHYS_ED_NAME + ' -to:' + CONST.PHYS_ED_STATS_EMAIL, 0, 1);
    if(threads.length === 0){
        return;
    }

    var thread = new InBasedThread(threads[0]);
    if(thread.isForToday()){
        var players = thread.parsePlayers();
        if(players.ins.length > 0){
            var toPlayerNames = function(players, categoryName) {
                var playerStrings  = [];
                for(var i = 0; i < players.length; i++){
                    var playerString = players[i].getDisplayString();
                    playerStrings.push(ArrayUtil.contains(playerStrings, playerString) ? '<i>' + playerString + '</i>' : playerString);
                }
                return categoryName + ' (' + playerStrings.length + '): ' + playerStrings.join(', ');
            };

            var body = [
                toPlayerNames(players.ins, 'In'),
                toPlayerNames(players.outs, 'Out'),
                toPlayerNames(players.unknowns, 'Unknown')
                //'',
                //'For stats, <a href="mailto:' + CONST.LEADERBOARD_EMAIL_PREFIX + thread.parseInitialEmail().sportName + CONST.LEADERBOARD_EMAIL_SUFFIX + '">send this email</a>'
            ].join('<br/>');
            MailSender.replyAll(thread.thread, body, thread.parseInitialEmail().replyTo);

            new TeamSuggester().suggestTeams(thread);
        }
    }
}

function recordGames(){
    var sides = Database.hydrateAll(Side);
    if(sides.length >= 2){
        var side1 = sides[0];
        var side2 = sides[1];
        if(side1.score !== '' && side2.score !== ''){
            new GameRecorder().record(side1, side2);
        }
    }
}

function leaderboardRequest() {
    var sports = Database.hydrateAll(Sport);
    for(var i = 0; i < sports.length; i++) {
        var sport = sports[i];
        var requests = GmailApp.search('"to:' + CONST.LEADERBOARD_EMAIL_PREFIX + sport.name + CONST.LEADERBOARD_EMAIL_SUFFIX + '"');
        for(var j = 0; j < requests.length; j++) {
            var request = requests[j];
            if(request.getMessageCount() === 1){
                MailSender.reply(request, new Leaderboard().getLeaderboards(sport));
            }
        }
    }
}
