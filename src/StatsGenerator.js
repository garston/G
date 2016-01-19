PhysEd.StatsGenerator = {};

PhysEd.StatsGenerator.generateStats = function(sport){
    var allPersonSports = [];
    var allTeams = GASton.Database.hydrate(PhysEd.Team);
    var allPersonTeams = GASton.Database.hydrate(PhysEd.PersonTeam);

    GASton.Database.hydrate(PhysEd.Game).filter(function(game){ return game.sportGuid === sport.guid; }).forEach(function(game, gameIndex, games){
        var inPersonSports = [];
        allTeams.filter(function(team){ return team.gameGuid === game.guid; }).forEach(function(team, teamIndex, teams){
            var otherTeam = teams[teamIndex === 0 ? 1 : 0];

            allPersonTeams.filter(function(personTeam){ return personTeam.teamGuid === team.guid; }).forEach(function(personTeam){
                var personSport = JSUtil.ArrayUtil.find(allPersonSports, function(personSport){ return personSport.personGuid === personTeam.personGuid; });
                if(!personSport) {
                    personSport = new PhysEd.PersonSport(personTeam.personGuid);
                    allPersonSports.push(personSport);
                }
                inPersonSports.push(personSport);

                if(typeof team.score === 'number' && typeof otherTeam.score === 'number'){
                    personSport.incrementStreakableProp(team.score === otherTeam.score ? PhysEd.PersonSport.STREAKABLE_PROPS.TIES : (team.score > otherTeam.score ? PhysEd.PersonSport.STREAKABLE_PROPS.WINS : PhysEd.PersonSport.STREAKABLE_PROPS.LOSSES));
                    personSport.plusMinus += team.score - otherTeam.score;
                }
            });
        });

        var isFirstGameOfDay = JSUtil.ArrayUtil.find(games, function(processedGame){ return processedGame.month === game.month && processedGame.day === game.day && processedGame.year === game.year; }) === game;
        if(isFirstGameOfDay){
            inPersonSports = JSUtil.ArrayUtil.unique(inPersonSports);
            allPersonSports.forEach(function(personSport){
                personSport.incrementStreakableProp(JSUtil.ArrayUtil.contains(inPersonSports, personSport) ? PhysEd.PersonSport.STREAKABLE_PROPS.INS : PhysEd.PersonSport.STREAKABLE_PROPS.OUTS);
            });
        }
    });

    return allPersonSports;
};
