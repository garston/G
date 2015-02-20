TodayGameService = function() {
    this.today = new Date();
};

TodayGameService.prototype.checkGameStatus = function(){
    var inBasedThread = this._findTodayThread();
    if(inBasedThread){
        var inPlayers = inBasedThread.playerStatusParser.inPlayers;
        if(inPlayers.length){
            var sport = inBasedThread.getSport();
            var additionalPlayerStatusParser = this._parseEarlyWarningThread(sport);

            inBasedThread.sendPlayerCountEmail(additionalPlayerStatusParser);
            this._persistSides(inPlayers.concat(additionalPlayerStatusParser ? additionalPlayerStatusParser.inPlayers : []), sport);
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

TodayGameService.prototype._findTodayThread = function() {
    var threads = GmailApp.search('-subject:re:' +
        ' from:' + MailSender.getNameUsedForSending() +
        ' (to:' + CONST.PHYS_ED_EMAIL + ' OR to:' + CONST.VOLLEYBALL_EMAIL + ')' +
        ' after:' + DateUtil.toSearchString(DateUtil.addDays(-1, this.today)) +
        ' before:' + DateUtil.toSearchString(this.today),
        0, 1);
    return threads.length && new InBasedThread(threads[0]);
};

TodayGameService.prototype._parseEarlyWarningThread = function(sport) {
    if(sport.earlyWarningEmail){
        var earlyWarningThread = GmailApp.search('from:' + MailSender.getNameUsedForSending() + ' to:' + sport.earlyWarningEmail + ' subject:' + DateUtil.toPrettyString(this.today), 0, 1)[0];
        if(earlyWarningThread) {
            return new PlayerStatusParser(earlyWarningThread);
        }
    }
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
