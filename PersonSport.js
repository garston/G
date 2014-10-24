PersonSport = function(personGuid, sportGuid) {
    this.guid = GuidUtil.generate();
    this.creationDate = new Date();
    this.personGuid = personGuid;
    this.sportGuid = sportGuid;
    this.wins = 0;
    this.losses = 0;
    this.ins = 0;
    this.outs = 0;
    this.streakDir = '';
    this.streak = 0;
    this.participationStreakDir = '';
    this.participationStreak = 0;
};

PersonSport.__tableName = 'PERSON_SPORT';
PersonSport.__propsToCol = {
    guid: 1,
    creationDate: 2,
    personGuid: 3,
    sportGuid: 4,
    wins: 5,
    losses: 6,
    ins: 7,
    outs: 8,
    streakDir: 9,
    streak: 10,
    participationStreakDir: 11,
    participationStreak: 12
};

PersonSport.STREAK_DIR = {
    W: 'W',
    L: 'L',
    INS: 'ins',
    OUTS: 'outs'
};

PersonSport.prototype.recordParticipation = function(isIn){
    this._recordCountStreak(isIn, 'ins', 'outs', 'participationStreak', 'participationStreakDir', PersonSport.STREAK_DIR.INS, PersonSport.STREAK_DIR.OUTS);
};

PersonSport.prototype.recordResult = function(isWin){
    this._recordCountStreak(isWin, 'wins', 'losses', 'streak', 'streakDir', PersonSport.STREAK_DIR.W, PersonSport.STREAK_DIR.L);
};

PersonSport.prototype.getPerson = function(){
    this.person = this.person || Database.hydrate(Person, this.personGuid);
    return this.person;
};

PersonSport.prototype.getWinScore = function(){
    return this._getScore(this.wins, this.losses);
};

PersonSport.prototype.getParticipationScore = function(){
    return this._getScore(this.ins, this.outs);
};

PersonSport.prototype._getScore = function(good, bad){
    var total = good + bad;
    return total === 0 ? 0 : (good / total).toFixed(3) * 1000;
};

PersonSport.prototype._recordCountStreak = function(isGood, goodProp, badProp, streakProp, streakDirProp, goodStreakVal, badStreakVal){
    if(isGood){
        this[goodProp]++;
    }else{
        this[badProp]++;
    }

    var streakDir = this[streakDirProp];
    if((isGood && streakDir === goodStreakVal) || (!isGood && streakDir === badStreakVal)){
        this[streakProp]++;
    }else{
        this[streakProp] = 1;
        this[streakDirProp] = isGood ? goodStreakVal : badStreakVal;
    }
};