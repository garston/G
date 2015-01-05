var BeforeGameHandler = function() {
    this.inBasedThread = this._findTodayThread();
};

BeforeGameHandler.prototype.checkGameStatus = function(){
    if(this.inBasedThread && this.inBasedThread.getInPlayers().length > 0){
        MailSender.replyAll(this.inBasedThread.thread, ArrayUtil.compact([
            this._toPlayerNames(InBasedThread.STATUSES.IN),
            this._toPlayerNames(InBasedThread.STATUSES.OUT),
            this._toPlayerNames(InBasedThread.STATUSES.UNKNOWN)
        ]).join('<br/>'), this.inBasedThread.metadata.replyTo);

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
    var sport = Database.hydrateBy(Sport, ['name', this.inBasedThread.metadata.sportName]);
    if(sport && sport.isInPhysEdRotation) {
        var teams = [[], []];
        ArrayUtil.forEach(this.inBasedThread.getInPlayers(), function(player, index){
            teams[index % teams.length].push(player.email);
        });

        var dateParts = DateUtil.splitPrettyDate(this.inBasedThread.metadata.date);
        Database.persist(Side, new Side(dateParts.month, dateParts.day, dateParts.year, this.inBasedThread.metadata.sportName, '', teams[0]));
        Database.persist(Side, new Side(dateParts.month, dateParts.day, dateParts.year, this.inBasedThread.metadata.sportName, '', teams[1]));
    }
};

BeforeGameHandler.prototype._toPlayerNames = function(categoryName) {
    if(this.inBasedThread.players[categoryName]){
        var playerStrings  = ArrayUtil.unique(ArrayUtil.map(this.inBasedThread.players[categoryName], Transformers.personToDisplayString));
        return categoryName + ' (' + playerStrings.length + '): ' + playerStrings.join(', ');
    }
};
