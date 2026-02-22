PhysEd.PersonSport = class {
    constructor(personGuid) {
        this.personGuid = personGuid;
        for(const streakableProp in PhysEd.PersonSport.STREAKABLE_PROPS) {
            this[PhysEd.PersonSport.STREAKABLE_PROPS[streakableProp]] = 0;
        }
        this.streakDir = '';
        this.streak = 0;
        this.participationStreakDir = '';
        this.participationStreak = 0;
        this.plusMinus = 0;
        this.averageOpponentWinPercentages = [];
        this.averageOwnTeamWinPercentages = [];
        this.numUpsetWins = 0;
    }

    getAverageOpponentWinPercentage() {
        return JSUtil.ArrayUtil.average(this.averageOpponentWinPercentages);
    }

    getAverageOwnTeamWinPercentage() {
        return JSUtil.ArrayUtil.average(this.averageOwnTeamWinPercentages);
    }

    getNumScoredGames() {
        return this[PhysEd.PersonSport.STREAKABLE_PROPS.WINS] + this[PhysEd.PersonSport.STREAKABLE_PROPS.LOSSES] + this[PhysEd.PersonSport.STREAKABLE_PROPS.TIES];
    }

    getParticipationPercentage() {
        return this._getPercentage(this[PhysEd.PersonSport.STREAKABLE_PROPS.INS], this[PhysEd.PersonSport.STREAKABLE_PROPS.OUTS]);
    }

    getPerson() {
        this.person = this.person || GASton.Database.findBy(PhysEd.Person, 'guid', this.personGuid);
        return this.person;
    }

    getPlusMinusPerGame() {
        const numGames = this.getNumScoredGames();
        return numGames ? this.plusMinus/numGames : 0;
    }

    getUpsetWinPercentage() {
        return this._getPercentage(this.numUpsetWins, this[PhysEd.PersonSport.STREAKABLE_PROPS.WINS] - this.numUpsetWins);
    }

    getWinPercentage() {
        return this._getPercentage(this[PhysEd.PersonSport.STREAKABLE_PROPS.WINS], this[PhysEd.PersonSport.STREAKABLE_PROPS.LOSSES]);
    }

    incrementStreakableProp(prop) {
        const streakProp = [PhysEd.PersonSport.STREAKABLE_PROPS.INS, PhysEd.PersonSport.STREAKABLE_PROPS.OUTS].includes(prop) ? 'participationStreak' : 'streak';
        const streakDirProp = streakProp + 'Dir';

        this[prop]++;
        this[streakProp] = this[streakDirProp] === prop ? this[streakProp] + 1 : 1;
        this[streakDirProp] = prop;
    }

    _getPercentage(numerator, additional) {
        const total = numerator + additional;
        return total === 0 ? 0 : Math.round((numerator / total) * 100);
    }
};

PhysEd.PersonSport.STREAKABLE_PROPS = {
    WINS: 'wins',
    LOSSES: 'losses',
    TIES: 'ties',
    INS: 'ins',
    OUTS: 'outs'
};
