PhysEd.PersonSport = function(personGuid, sportGuid) {
    this.guid = JSUtil.GuidUtil.generate();
    this.creationDate = new Date();
    this.personGuid = personGuid;
    this.sportGuid = sportGuid;
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

PhysEd.PersonSport.__props = [
    'guid', 'creationDate', 'personGuid', 'sportGuid',
    PhysEd.PersonSport.STREAKABLE_PROPS.WINS, PhysEd.PersonSport.STREAKABLE_PROPS.LOSSES, PhysEd.PersonSport.STREAKABLE_PROPS.TIES,
    PhysEd.PersonSport.STREAKABLE_PROPS.INS, PhysEd.PersonSport.STREAKABLE_PROPS.OUTS,
    'streakDir', 'streak', 'participationStreakDir', 'participationStreak', 'plusMinus'
];
PhysEd.PersonSport.__tableName = 'PERSON_SPORT';

PhysEd.PersonSport.prototype.getPerson = function(){
    this.person = this.person || GASton.Database.hydrate(PhysEd.Person, this.personGuid);
    return this.person;
};

PhysEd.PersonSport.prototype.getParticipationPercentage = function(){
    return this._getPercentage(this[PhysEd.PersonSport.STREAKABLE_PROPS.INS], this[PhysEd.PersonSport.STREAKABLE_PROPS.OUTS]);
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
