var BeforeGameHandler = function() {};

BeforeGameHandler.prototype.checkGameStatus = function(inBasedThread){
    var players = inBasedThread.parsePlayers();
    var inPlayers = players[InBasedThread.STATUSES.IN];
    if(inPlayers.length === 0){
        return;
    }

    var emailMetadata = inBasedThread.parseInitialEmail();
    MailSender.replyAll(inBasedThread.thread, ArrayUtil.compact([
        this._toPlayerNames(players, InBasedThread.STATUSES.IN),
        this._toPlayerNames(players, InBasedThread.STATUSES.OUT),
        this._toPlayerNames(players, InBasedThread.STATUSES.UNKNOWN)
    ]).join('<br/>'), emailMetadata.replyTo);

    var sport = Database.hydrateBy(Sport, ['name', emailMetadata.sportName]);
    if(sport && sport.isInPhysEdRotation) {
        this._persist(inPlayers, emailMetadata.date, emailMetadata.sportName);
    }
};

BeforeGameHandler.prototype._persist = function(inPlayers, date, sportName){
    var teams = [[], []];
    ArrayUtil.forEach(inPlayers, function(player, index){
        teams[index % teams.length].push(player.email);
    });

    var dateParts = DateUtil.splitPrettyDate(date);
    Database.persist(Side, new Side(dateParts.month, dateParts.day, dateParts.year, sportName, '', teams[0]));
    Database.persist(Side, new Side(dateParts.month, dateParts.day, dateParts.year, sportName, '', teams[1]));
};

BeforeGameHandler.prototype._toPlayerNames = function(players, categoryName) {
    if(players[categoryName]){
        var playerStrings  = ArrayUtil.unique(ArrayUtil.map(players[categoryName], Transformers.personToDisplayString));
        return categoryName + ' (' + playerStrings.length + '): ' + playerStrings.join(', ');
    }
};
