TodayGameService = function() {
    this.today = new Date();
};

TodayGameService.prototype.checkGameStatus = function(){
    var inBasedThread = this._findTodayThread();
    if(inBasedThread){
        var inPlayers = inBasedThread.playerStatusParser.inPlayers;
        if(inPlayers.length){
            var sport = inBasedThread.getSport();
            inBasedThread.sendPlayerCountEmail(this._getAdditionalInPlayers(sport));
            this._persistSides(inPlayers, sport);
        }
    }
};

TodayGameService.prototype.sendEarlyWarning = function(){
    var inBasedThread = this._findTodayThread();
    if(inBasedThread) {
        var sport = inBasedThread.getSport();
        var numInPlayers = inBasedThread.playerStatusParser.inPlayers.length;
        if(sport.earlyWarningEmail && numInPlayers > sport.earlyWarningThreshold) {
            MailSender.send(
                DateUtil.toPrettyString(this.today),
                CONST.GROUP_NAME + ' is looking to get a game together today. ' + numInPlayers + ' people are currently in. Anybody interested?',
                sport.earlyWarningEmail
            );
        }
    }
};

TodayGameService.prototype._getAdditionalInPlayers = function(sport) {
    if(sport.earlyWarningEmail){
        var earlyWarningThread = GmailApp.search('from:' + CONST.PHYS_ED_NAME + ' to:' + sport.earlyWarningEmail + ' subject:' + DateUtil.toPrettyString(this.today), 0, 1)[0];
        if(earlyWarningThread) {
            return new PlayerStatusParser(earlyWarningThread).inPlayers;
        }
    }

    return [];
};

TodayGameService.prototype._findTodayThread = function() {
    var threads = GmailApp.search('-subject:re:' +
        ' from:' + CONST.PHYS_ED_NAME +
        ' -to:' + CONST.PHYS_ED_STATS_EMAIL +
        ' after:' + DateUtil.toSearchString(DateUtil.addDays(-1, this.today)) +
        ' before:' + DateUtil.toSearchString(this.today),
        0, 1);
    return threads.length && new InBasedThread(threads[0]);
};

TodayGameService.prototype._persistSides = function(inPlayers, sport){
    if(sport && sport.isInPhysEdRotation) {
        var teams = [[], []];
        ArrayUtil.forEach(inPlayers, function(player, index){
            teams[index % teams.length].push(player.email);
        });

        Database.persist(Side, new Side(this.today.getMonth() + 1, this.today.getDate(), this.today.getFullYear(), sport.name, '', teams[0]));
        Database.persist(Side, new Side(this.today.getMonth() + 1, this.today.getDate(), this.today.getFullYear(), sport.name, '', teams[1]));
    }
};
