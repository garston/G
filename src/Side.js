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

PhysEd.Side.__tableName = 'GAME_RECORDER';
PhysEd.Side.__firstRow = 2;
PhysEd.Side.__propsToCol = function() {
    var propsToCol = {
        guid: 1,
        month: 2,
        day: 3,
        year: 4,
        sportName: 5,
        score: 6
    };
    JSUtil.ArrayUtil.times(this.MAX_PLAYERS, function(i){
        propsToCol['playerEmail' + i] = i + 7;
    });
    return propsToCol;
};
