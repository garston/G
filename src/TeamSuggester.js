var TeamSuggester = function(){};

TeamSuggester.prototype.suggestTeams = function(inBasedThread){
    var players = inBasedThread.parsePlayers();
    var inPlayers = players[InBasedThread.STATUSES.IN];
    if(inPlayers.length === 0){
        return;
    }

    var emailMetadata = inBasedThread.parseInitialEmail();
    MailSender.replyAll(inBasedThread.thread, [
        TeamSuggester._toPlayerNames(inPlayers, 'In'),
        TeamSuggester._toPlayerNames(players[InBasedThread.STATUSES.OUT], 'Out'),
        TeamSuggester._toPlayerNames(players[InBasedThread.STATUSES.UNKNOWN], 'Unknown')
    ].join('<br/>'), emailMetadata.replyTo);

    var sport = Database.hydrateBy(Sport, ['name', emailMetadata.sportName]);
    if(sport && sport.isInPhysEdRotation) {
        TeamSuggester._persist(inPlayers, emailMetadata.date, emailMetadata.sportName);
    }
};

TeamSuggester._persist = function(inPlayers, date, sportName){
    var teams = [[], []];
    ArrayUtil.forEach(inPlayers, function(player, index){
        teams[index % teams.length].push(player.email);
    });

    var dateParts = DateUtil.splitPrettyDate(date);
    Database.persist(Side, new Side(dateParts.month, dateParts.day, dateParts.year, sportName, '', teams[0]));
    Database.persist(Side, new Side(dateParts.month, dateParts.day, dateParts.year, sportName, '', teams[1]));
};

TeamSuggester._toPlayerNames = function(players, categoryName) {
    var playerStrings  = ArrayUtil.unique(ArrayUtil.map(players, Transformers.personToDisplayString));
    return categoryName + ' (' + playerStrings.length + '): ' + playerStrings.join(', ');
};
