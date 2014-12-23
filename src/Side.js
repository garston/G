Side = function(month, day, year, sportName, score, playerEmails) {
    this.guid = GuidUtil.generate();
    this.month = month;
    this.day = day;
    this.year = year;
    this.sportName = sportName;
    this.score = score;

    playerEmails = playerEmails || [];
    for(var i = 0; i < Side.MAX_PLAYERS; i++){
        this['playerEmail' + i] = playerEmails[i] || '';
    }
};

Side.MAX_PLAYERS = 14;

Side.prototype.getPeople = function(){
    if(!this.people){
        this.people = [];
        var emails = this.getPlayerEmails();
        for(var i = 0; i < emails.length; i++){
            var email = emails[i];
            this.people.push(Database.hydrateBy(Person, ['email', email]) || new Person(email));
        }
    }

    return this.people;
};

Side.prototype.getPeopleDisplayStrings = function(){
    var displayStrings = [];
    var people = this.getPeople();
    for(var i = 0; i < people.length; i++){
        displayStrings.push(people[i].getDisplayString());
    }
    return displayStrings;
};

Side.prototype.getPlayerEmails = function() {
    var emails = [];
    for(var i = 0; i < Side.MAX_PLAYERS; i++){
        var email = this['playerEmail' + i];
        if(email){
            emails.push(email);
        }
    }
    return emails;
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
