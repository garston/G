function __computePlusMinus() {
    var games = GASton.Database.hydrateAll(PhysEd.Game);
    var teams = GASton.Database.hydrateAll(PhysEd.Team);
    var personTeams = GASton.Database.hydrateAll(PhysEd.PersonTeam);

    GASton.Database.hydrateAll(PhysEd.PersonSport).forEach(function(personSport){
        personSport.plusMinus = 0;

        var teamsForPersonAndSportWithScore = JSUtil.ArrayUtil.compact(
            personTeams.
                filter(function(personTeam){ return personTeam.personGuid === personSport.personGuid; }).
                map(function(personTeam) {
                    var teamForPerson = JSUtil.ArrayUtil.find(teams, function(team){ return team.guid === personTeam.teamGuid; });
                    return typeof teamForPerson.score === 'number' &&
                        JSUtil.ArrayUtil.find(games, function(game){ return game.guid === teamForPerson.gameGuid; }).sportGuid === personSport.sportGuid &&
                        teamForPerson;
                })
        );

        teamsForPersonAndSportWithScore.forEach(function(teamForPerson){
            var opposingTeam = JSUtil.ArrayUtil.find(teams, function(team){ return team.gameGuid === teamForPerson.gameGuid && team !== teamForPerson; });
            personSport.plusMinus += teamForPerson.score - opposingTeam.score;
        });

        GASton.Database.persistOnly(PhysEd.PersonSport, personSport, ['plusMinus']);
    });
}
