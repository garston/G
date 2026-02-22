PhysEd.Side = class {
    constructor(month, day, year, leagueGuid, score, playerEmails = []) {
        this.month = month;
        this.day = day;
        this.year = year;
        this.leagueGuid = leagueGuid;
        this.score = score;

        JSUtil.ArrayUtil.times(PhysEd.Side.MAX_PLAYERS, i => {
            this['playerEmail' + i] = playerEmails[i] || '';
        });
    }

    getPeople() {
        this.people = this.people || this.getPlayerEmails().map(function(email){
            return GASton.Database.findBy(PhysEd.Person, 'email', email) || new PhysEd.Person(email);
        });
        return this.people;
    }

    getPlayerEmails() {
        return JSUtil.ArrayUtil.compact(JSUtil.ArrayUtil.range(PhysEd.Side.MAX_PLAYERS).map(i => this['playerEmail' + i]));
    }
};

PhysEd.Side.MAX_PLAYERS = 14;

GASton.Database.register(PhysEd.Side, 'GAME_RECORDER', JSUtil.ArrayUtil.range(PhysEd.Side.MAX_PLAYERS).reduce(function(props, i){
    return props.concat('playerEmail' + i);
}, ['month', 'day', 'year', 'leagueGuid', 'score']), true);
