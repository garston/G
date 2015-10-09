PhysEd.TodayGameService = function() {
    this.today = new Date();
};

PhysEd.TodayGameService.prototype.checkGameStatus = function(){
    var inBasedThread = this._findTodayThread();
    if(inBasedThread){
        var inPlayers = inBasedThread.playerStatusParser.inPlayers;
        if(inPlayers.length){
            var sport = PhysEd.Sport.hydrateByName(inBasedThread.sportName);
            var additionalPlayerStatusParser = this._parseEarlyWarningThread(sport);

            inBasedThread.sendPlayerCountEmail(additionalPlayerStatusParser);
            this._persistSides(inPlayers.concat(additionalPlayerStatusParser ? additionalPlayerStatusParser.inPlayers : []), sport);
        }
    }
};

PhysEd.TodayGameService.prototype.sendEarlyWarning = function(){
    var inBasedThread = this._findTodayThread();
    if(inBasedThread) {
        var sport = PhysEd.Sport.hydrateByName(inBasedThread.sportName);
        var numInPlayers = inBasedThread.playerStatusParser.inPlayers.length;
        if(sport.earlyWarningEmail && numInPlayers > sport.earlyWarningThreshold) {
            GASton.MailSender.sendToList(
                JSUtil.DateUtil.toPrettyString(this.today),
                PhysEd.Const.generateEarlyWarningEmailBody(numInPlayers),
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
    if(sport.isInPhysEdRotation) {
        var teams = [[], []];
        inPlayers.forEach(function(player, index){
            teams[index % teams.length].push(player.email);
        });

        GASton.Database.persist(PhysEd.Side, new PhysEd.Side(this.today.getMonth() + 1, this.today.getDate(), this.today.getFullYear(), sport.name, '', teams[0]));
        GASton.Database.persist(PhysEd.Side, new PhysEd.Side(this.today.getMonth() + 1, this.today.getDate(), this.today.getFullYear(), sport.name, '', teams[1]));
    }
};
