TodayGameService = function() {
    this.today = new Date();
    this.currentMonth = this.today.getMonth() + 1;
    this.currentDay = this.today.getDate();
    this.currentYear = this.today.getFullYear();
};

TodayGameService.prototype.checkGameStatus = function(){
    var inBasedThread = this._findTodayThread();
    if(inBasedThread && inBasedThread.getInPlayers().length > 0){
        inBasedThread.sendPlayerCountEmail();
        this._persistSides(inBasedThread);
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

TodayGameService.prototype._persistSides = function(inBasedThread){
    var sport = Database.hydrateBy(Sport, ['name', inBasedThread.sportName]);
    if(sport && sport.isInPhysEdRotation) {
        var teams = [[], []];
        ArrayUtil.forEach(inBasedThread.getInPlayers(), function(player, index){
            teams[index % teams.length].push(player.email);
        });

        Database.persist(Side, new Side(this.currentMonth, this.currentDay, this.currentYear, inBasedThread.sportName, '', teams[0]));
        Database.persist(Side, new Side(this.currentMonth, this.currentDay, this.currentYear, inBasedThread.sportName, '', teams[1]));
    }
};