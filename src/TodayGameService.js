PhysEd.TodayGameService = function() {
    this.today = new Date();
};

PhysEd.TodayGameService.prototype.checkGameStatus = function(){
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

PhysEd.TodayGameService.prototype.sendEarlyWarning = function(){
    var inBasedThread = this._findTodayThread();
    if(inBasedThread) {
        var sport = inBasedThread.getSport();
        var numInPlayers = inBasedThread.playerStatusParser.inPlayers.length;
        if(sport.earlyWarningEmail && numInPlayers > sport.earlyWarningThreshold) {
            GASton.MailSender.send(
                JSUtil.DateUtil.toPrettyString(this.today),
                PhysEd.Const.GROUP_NAME + ' is looking to get a game together today. ' + numInPlayers + ' people are currently in. Anybody interested?',
                sport.earlyWarningEmail
            );
        }
    }
};

PhysEd.TodayGameService.prototype._findTodayThread = function() {
    var threads = GmailApp.search('-subject:re:' +
        ' from:' + GASton.MailSender.getNameUsedForSending() +
        ' (to:' + PhysEd.Const.PHYS_ED_EMAIL + ' OR to:' + PhysEd.Const.VOLLEYBALL_EMAIL + ')' +
        ' after:' + JSUtil.DateUtil.toSearchString(JSUtil.DateUtil.addDays(-1, this.today)) +
        ' before:' + JSUtil.DateUtil.toSearchString(this.today),
        0, 1);
    return threads.length && new PhysEd.InBasedThread(threads[0]);
};

PhysEd.TodayGameService.prototype._parseEarlyWarningThread = function(sport) {
    if(sport.earlyWarningEmail){
        var earlyWarningThread = GmailApp.search('from:' + GASton.MailSender.getNameUsedForSending() + ' to:' + sport.earlyWarningEmail + ' subject:' + JSUtil.DateUtil.toPrettyString(this.today), 0, 1)[0];
        if(earlyWarningThread) {
            return new PhysEd.PlayerStatusParser(earlyWarningThread);
        }
    }
};

PhysEd.TodayGameService.prototype._persistSides = function(inPlayers, sport){
    if(sport && sport.isInPhysEdRotation) {
        var teams = [[], []];
        JSUtil.ArrayUtil.forEach(inPlayers, function(player, index){
            teams[index % teams.length].push(player.email);
        });

        GASton.Database.persist(PhysEd.Side, new PhysEd.Side(this.today.getMonth() + 1, this.today.getDate(), this.today.getFullYear(), sport.name, '', teams[0]));
        GASton.Database.persist(PhysEd.Side, new PhysEd.Side(this.today.getMonth() + 1, this.today.getDate(), this.today.getFullYear(), sport.name, '', teams[1]));
    }
};
