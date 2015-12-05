PhysEd.Side = function(month, day, year, sportName, score, playerEmails) {
    this.guid = JSUtil.GuidUtil.generate();
    this.month = month;
    this.day = day;
    this.year = year;
    this.sportName = sportName;
    this.score = score;

    playerEmails = playerEmails || [];
    JSUtil.ArrayUtil.times(PhysEd.Side.MAX_PLAYERS, function(i){
        this['playerEmail' + i] = playerEmails[i] || '';
    }, this);
};

PhysEd.Side.MAX_PLAYERS = 14;

PhysEd.Side.prototype.getPeople = function(){
    this.people = this.people || this.getPlayerEmails().map(function(email){
        return GASton.Database.hydrateBy(PhysEd.Person, ['email', email]) || new PhysEd.Person(email);
    });

    return this.people;
};

PhysEd.Side.prototype.getPlayerEmails = function() {
    return JSUtil.ArrayUtil.compact(JSUtil.ArrayUtil.range(PhysEd.Side.MAX_PLAYERS).map(function(i){ return this['playerEmail' + i]; }, this));
};

PhysEd.Side.__firstRow = 2;
PhysEd.Side.__props = function() {
    var propsToCol = ['guid', 'month', 'day', 'year', 'sportName', 'score'];
    JSUtil.ArrayUtil.times(this.MAX_PLAYERS, function(i){
        propsToCol.push('playerEmail' + i);
    });
    return propsToCol;
};
PhysEd.Side.__tableName = 'GAME_RECORDER';
