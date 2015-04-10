function __computePlusMinus() {
    var games = GASton.Database.hydrateAll(PhysEd.Game);
    var teams = GASton.Database.hydrateAll(PhysEd.Team);
    var personTeams = GASton.Database.hydrateAll(PhysEd.PersonTeam);

    JSUtil.ArrayUtil.forEach(GASton.Database.hydrateAll(PhysEd.PersonSport), function(personSport){
        personSport.plusMinus = 0;

        var personTeamsForPerson = JSUtil.ArrayUtil.filter(personTeams, function(personTeam){
            return personTeam.personGuid === personSport.personGuid;
        });

        var teamsForPersonAndSportWithScore = JSUtil.ArrayUtil.compact(JSUtil.ArrayUtil.map(personTeamsForPerson, function(personTeam) {
            var teamForPerson = JSUtil.ArrayUtil.find(teams, function(team){ return team.guid === personTeam.teamGuid; });
            return typeof teamForPerson.score === 'number' &&
                JSUtil.ArrayUtil.find(games, function(game){ return game.guid === teamForPerson.gameGuid; }).sportGuid === personSport.sportGuid &&
                teamForPerson;
        }));

        JSUtil.ArrayUtil.forEach(teamsForPersonAndSportWithScore, function(teamForPerson){
            var opposingTeam = JSUtil.ArrayUtil.find(teams, function(team){ return team.gameGuid === teamForPerson.gameGuid && team !== teamForPerson; });
            personSport.plusMinus += teamForPerson.score - opposingTeam.score;
        });

        GASton.Database.persistOnly(PhysEd.PersonSport, personSport, ['plusMinus']);
    });
}
