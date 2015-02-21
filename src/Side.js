Side = function(month, day, year, sportName, score, playerEmails) {
    this.guid = GuidUtil.generate();
    this.month = month;
    this.day = day;
    this.year = year;
    this.sportName = sportName;
    this.score = score;

    playerEmails = playerEmails || [];
    ArrayUtil.times(Side.MAX_PLAYERS, function(i){
        this['playerEmail' + i] = playerEmails[i] || '';
    }, this);
};

Side.MAX_PLAYERS = 14;

Side.prototype.getPeople = function(){
    this.people = this.people || ArrayUtil.map(this.getPlayerEmails(), function(email){
        return Database.hydrateBy(Person, ['email', email]) || new Person(email);
    });

    return this.people;
};

Side.prototype.getPlayerEmails = function() {
    return ArrayUtil.compact(ArrayUtil.map(ArrayUtil.range(Side.MAX_PLAYERS), function(i){
        return this['playerEmail' + i];
    }, this));
};

Side.__tableName = 'GAME_RECORDER';
Side.__firstRow = 2;
Side.__propsToCol = {
    guid: 1,
    month: 2,
    day: 3,
    year: 4,
    sportName: 5,
    score: 6
};
(function(){
    for(var i = 0; i < Side.MAX_PLAYERS; i++){
        Side.__propsToCol['playerEmail' + i] = i + 7;
    }
})();
