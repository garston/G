var TeamSuggester = function(){};

TeamSuggester.prototype.suggestTeams = function(inBasedThread){
    var players = inBasedThread.parsePlayers();
    if(players.ins.length === 0){
        return;
    }

    var emailMetadata = inBasedThread.parseInitialEmail();
    MailSender.replyAll(inBasedThread.thread, [
        TeamSuggester._toPlayerNames(players.ins, 'In'),
        TeamSuggester._toPlayerNames(players.outs, 'Out'),
        TeamSuggester._toPlayerNames(players.unknowns, 'Unknown')
    ].join('<br/>'), emailMetadata.replyTo);

    TeamSuggester._persist(players.ins, emailMetadata.date, emailMetadata.sportName);
};

TeamSuggester._persist = function(inPlayers, date, sportName){
    var teams = [[], []];
    for(var i = 0; i < inPlayers.length; i++) {
        teams[i % teams.length].push(inPlayers[i].email);
    }

    var dateParts = DateUtil.splitPrettyDate(date);
    Database.persist(Side, new Side(dateParts.month, dateParts.day, dateParts.year, sportName, '', teams[0]));
    Database.persist(Side, new Side(dateParts.month, dateParts.day, dateParts.year, sportName, '', teams[1]));
};

TeamSuggester._toPlayerNames = function(players, categoryName) {
    var playerStrings  = [];
    for(var i = 0; i < players.length; i++){
        var playerString = players[i].getDisplayString();
        playerStrings.push(ArrayUtil.contains(playerStrings, playerString) ? '<i>' + playerString + '</i>' : playerString);
    }
    return categoryName + ' (' + playerStrings.length + '): ' + playerStrings.join(', ');
};
