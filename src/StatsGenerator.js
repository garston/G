PhysEd.StatsGenerator = {};

PhysEd.StatsGenerator.generateStats = function(sport){
    var allPersonSports = [];
    var teamsByGameGuid = JSUtil.ArrayUtil.groupBy(GASton.Database.hydrate(PhysEd.Team), function(team){ return team.gameGuid; })
    var personTeamsByTeamGuid = JSUtil.ArrayUtil.groupBy(GASton.Database.hydrate(PhysEd.PersonTeam), function(personTeam){ return personTeam.teamGuid; });

    GASton.Database.hydrate(PhysEd.Game).filter(function(game){ return game.sportGuid === sport.guid; }).forEach(function(game, gameIndex, games){
        var teams = teamsByGameGuid[game.guid];
        var team1 = teams[0];
        var team2 = teams[1];
        var personSports1 = this._mapPersonTeamsToPersonSports(personTeamsByTeamGuid[team1.guid], allPersonSports);
        var personSports2 = this._mapPersonTeamsToPersonSports(personTeamsByTeamGuid[team2.guid], allPersonSports);
        var winPercentages1 = this._mapPersonSportsToWinPercentages(personSports1);
        var winPercentages2 = this._mapPersonSportsToWinPercentages(personSports2);

        this._recordScoredGame(personSports1, team1.score, team2.score);
        this._recordScoredGame(personSports2, team2.score, team1.score);
        this._recordTeamWinPercentages(personSports1, winPercentages1, winPercentages2);
        this._recordTeamWinPercentages(personSports2, winPercentages2, winPercentages1);

        var isFirstGameOfDay = JSUtil.ArrayUtil.find(games, function(processedGame){ return processedGame.month === game.month && processedGame.day === game.day && processedGame.year === game.year; }) === game;
        if(isFirstGameOfDay){
            var personSports = JSUtil.ArrayUtil.unique(personSports1.concat(personSports2));
            allPersonSports.forEach(function(personSport){
                personSport.incrementStreakableProp(JSUtil.ArrayUtil.contains(personSports, personSport) ? PhysEd.PersonSport.STREAKABLE_PROPS.INS : PhysEd.PersonSport.STREAKABLE_PROPS.OUTS);
            });
        }
    }, this);

    return allPersonSports;
};

PhysEd.StatsGenerator._mapPersonSportsToWinPercentages = function(personSports) {
    return personSports.
        filter(function(personSport){ return personSport.getNumScoredGames(); }).
        map(function(personSport){ return personSport.getWinPercentage(); });
};

PhysEd.StatsGenerator._mapPersonTeamsToPersonSports = function(personTeams, allPersonSports) {
    return personTeams.map(function(personTeam){
        var personSport = JSUtil.ArrayUtil.find(allPersonSports, function(personSport){ return personSport.personGuid === personTeam.personGuid; });
        if(!personSport) {
            personSport = new PhysEd.PersonSport(personTeam.personGuid);
            allPersonSports.push(personSport);
        }
        return personSport;
    });
};

PhysEd.StatsGenerator._recordScoredGame = function(personSports, teamScore, opponentScore) {
    if(typeof teamScore === 'number' && typeof opponentScore === 'number'){
        personSports.forEach(function(personSport){
            personSport.incrementStreakableProp(teamScore === opponentScore ? PhysEd.PersonSport.STREAKABLE_PROPS.TIES : (teamScore > opponentScore ? PhysEd.PersonSport.STREAKABLE_PROPS.WINS : PhysEd.PersonSport.STREAKABLE_PROPS.LOSSES));
            personSport.plusMinus += teamScore - opponentScore;
        });
    }
};

PhysEd.StatsGenerator._recordTeamWinPercentages = function(personSports, ownTeamWinPercentages, opponentWinPercentages) {
    [{ prop: 'averageOpponentWinPercentages', winPercentages: opponentWinPercentages }, { prop: 'averageOwnTeamWinPercentages', winPercentages: ownTeamWinPercentages }].
        filter(function(opts){ return opts.winPercentages.length; }).
        forEach(function(opts){
            var avgWinPercentage = JSUtil.ArrayUtil.average(opts.winPercentages);
            personSports.forEach(function(personSport){ personSport[opts.prop].push(avgWinPercentage); });
        });
};
