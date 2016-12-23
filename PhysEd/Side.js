PhysEd.Side = function(month, day, year, leagueGuid, score, playerEmails) {
    this.month = month;
    this.day = day;
    this.year = year;
    this.leagueGuid = leagueGuid;
    this.score = score;

    playerEmails = playerEmails || [];
    JSUtil.ArrayUtil.times(PhysEd.Side.MAX_PLAYERS, function(i){
        this['playerEmail' + i] = playerEmails[i] || '';
    }, this);
};

PhysEd.Side.MAX_PLAYERS = 14;

PhysEd.Side.prototype.getPeople = function(){
    this.people = this.people || this.getPlayerEmails().map(function(email){
        return GASton.Database.findBy(PhysEd.Person, 'email', email) || new PhysEd.Person(email);
    });
    return this.people;
};

PhysEd.Side.prototype.getPlayerEmails = function() {
    return JSUtil.ArrayUtil.compact(JSUtil.ArrayUtil.range(PhysEd.Side.MAX_PLAYERS).map(function(i){ return this['playerEmail' + i]; }, this));
};

PhysEd.Side.__firstRow = 2;
PhysEd.Side.__props = JSUtil.ArrayUtil.range(PhysEd.Side.MAX_PLAYERS).reduce(function(props, i){
    return props.concat('playerEmail' + i);
}, ['month', 'day', 'year', 'leagueGuid', 'score']);
PhysEd.Side.__tableName = 'GAME_RECORDER';
