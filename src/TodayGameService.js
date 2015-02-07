TodayGameService = function() {
    this.today = new Date();
};

TodayGameService.prototype.checkGameStatus = function(){
    var inBasedThread = this._findTodayThread();
    if(inBasedThread){
        var inPlayers = inBasedThread.playerStatusParser.getInPlayers();
        if(inPlayers.length > 0){
            inBasedThread.sendPlayerCountEmail();
            this._persistSides(inPlayers, inBasedThread.getSport());
        }
    }
};

TodayGameService.prototype.sendEarlyWarning = function(){
    var inBasedThread = this._findTodayThread();
    if(inBasedThread) {
        var sport = inBasedThread.getSport();
        var numInPlayers = inBasedThread.playerStatusParser.getInPlayers().length;
        if(sport && sport.earlyWarningEmail && numInPlayers > sport.earlyWarningThreshold) {
            MailSender.send(
                DateUtil.toPrettyString(this.today),
                CONST.GROUP_NAME + ' is looking to get a game together today. ' + numInPlayers + ' people are currently in. Anybody interested?',
                sport.earlyWarningEmail
            );
        }
    }
};

TodayGameService.prototype._findTodayThread = function() {
    var threads = GmailApp.search('-subject:re:' +
        ' from:' + CONST.PHYS_ED_NAME +
        ' -to:' + CONST.PHYS_ED_STATS_EMAIL +
        ' after:' + DateUtil.toSearchString(DateUtil.addDays(-1, this.today)) +
        ' before:' + DateUtil.toSearchString(this.today),
        0, 1);
    return threads.length > 0 && new InBasedThread(threads[0]);
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
