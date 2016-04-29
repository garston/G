PhysEd.PersonSport = function(personGuid) {
    this.personGuid = personGuid;
    for(var streakableProp in PhysEd.PersonSport.STREAKABLE_PROPS) {
        this[PhysEd.PersonSport.STREAKABLE_PROPS[streakableProp]] = 0;
    }
    this.streakDir = '';
    this.streak = 0;
    this.participationStreakDir = '';
    this.participationStreak = 0;
    this.plusMinus = 0;
};

PhysEd.PersonSport.STREAKABLE_PROPS = {
    WINS: 'wins',
    LOSSES: 'losses',
    TIES: 'ties',
    INS: 'ins',
    OUTS: 'outs'
};

PhysEd.PersonSport.prototype.getParticipationPercentage = function(){
    return this._getPercentage(this[PhysEd.PersonSport.STREAKABLE_PROPS.INS], this[PhysEd.PersonSport.STREAKABLE_PROPS.OUTS]);
};

PhysEd.PersonSport.prototype.getPerson = function(){
    this.person = this.person || JSUtil.ArrayUtil.find(GASton.Database.hydrate(PhysEd.Person), function(person){ return person.guid === this.personGuid; }, this);
    return this.person;
};

PhysEd.PersonSport.prototype.getPlusMinusPerGame = function(){
    var numGames = this[PhysEd.PersonSport.STREAKABLE_PROPS.WINS] + this[PhysEd.PersonSport.STREAKABLE_PROPS.LOSSES] + this[PhysEd.PersonSport.STREAKABLE_PROPS.TIES];
    return numGames ? this.plusMinus/numGames : 0;
};

PhysEd.PersonSport.prototype.getWinPercentage = function(){
    return this._getPercentage(this[PhysEd.PersonSport.STREAKABLE_PROPS.WINS], this[PhysEd.PersonSport.STREAKABLE_PROPS.LOSSES]);
};

PhysEd.PersonSport.prototype.incrementStreakableProp = function(prop){
    var streakProp = JSUtil.ArrayUtil.contains([PhysEd.PersonSport.STREAKABLE_PROPS.INS, PhysEd.PersonSport.STREAKABLE_PROPS.OUTS], prop) ? 'participationStreak' : 'streak';
    var streakDirProp = streakProp + 'Dir';

    this[prop]++;
    this[streakProp] = this[streakDirProp] === prop ? this[streakProp] + 1 : 1;
    this[streakDirProp] = prop;
};

PhysEd.PersonSport.prototype._getPercentage = function(good, bad){
    var total = good + bad;
    return total === 0 ? 0 : Math.round((good / total) * 100);
};
