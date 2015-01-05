var BeforeGameHandler = function() {
    this.inBasedThread = this._findTodayThread();
    if(this.inBasedThread) {
        this.emailMetadata = this.inBasedThread.parseInitialEmail();
        this.players = this.inBasedThread.parsePlayers();
        this.inPlayers = this.players[InBasedThread.STATUSES.IN];
    }
};

BeforeGameHandler.prototype.checkGameStatus = function(){
    if(this.inPlayers && this.inPlayers.length > 0){
        MailSender.replyAll(this.inBasedThread.thread, ArrayUtil.compact([
            this._toPlayerNames(InBasedThread.STATUSES.IN),
            this._toPlayerNames(InBasedThread.STATUSES.OUT),
            this._toPlayerNames(InBasedThread.STATUSES.UNKNOWN)
        ]).join('<br/>'), this.emailMetadata.replyTo);

        this._persistSides();
    }
};

BeforeGameHandler.prototype._findTodayThread = function() {
    var threads = GmailApp.search('-subject:re: from:' + CONST.PHYS_ED_NAME + ' -to:' + CONST.PHYS_ED_STATS_EMAIL, 0, 1);
    if(threads.length === 0){
        return null;
    }

    var inBasedThread = new InBasedThread(threads[0]);
    return inBasedThread.isForToday() ? inBasedThread : null;
};

BeforeGameHandler.prototype._persistSides = function(){
    var sport = Database.hydrateBy(Sport, ['name', this.emailMetadata.sportName]);
    if(sport && sport.isInPhysEdRotation) {
        var teams = [[], []];
        ArrayUtil.forEach(this.inPlayers, function(player, index){
            teams[index % teams.length].push(player.email);
        });

        var dateParts = DateUtil.splitPrettyDate(this.emailMetadata.date);
        Database.persist(Side, new Side(dateParts.month, dateParts.day, dateParts.year, this.emailMetadata.sportName, '', teams[0]));
        Database.persist(Side, new Side(dateParts.month, dateParts.day, dateParts.year, this.emailMetadata.sportName, '', teams[1]));
    }
};

BeforeGameHandler.prototype._toPlayerNames = function(categoryName) {
    if(this.players[categoryName]){
        var playerStrings  = ArrayUtil.unique(ArrayUtil.map(this.players[categoryName], Transformers.personToDisplayString));
        return categoryName + ' (' + playerStrings.length + '): ' + playerStrings.join(', ');
    }
};
