PhysEd.GameRecorder = {};

PhysEd.GameRecorder.record = function(side1, side2){
    var league = GASton.Database.findBy(PhysEd.League, 'guid', side1.leagueGuid);
    var game = new PhysEd.Game(side1.month, side1.day, side1.year, league.guid);

    this._recordSide(side1, game);
    this._recordSide(side2, game);

    GASton.Mail.sendToList(league.getMailingList().statsEmail, '[PhysEdStats] ' + league.sportName + ' ' + side1.month + '/' + side1.day + '/' + side1.year, [
        'Game results',
        '<b>Team 1: ' + side1.score + '</b>. &nbsp;' + side1.getPeople().map(PhysEd.Transformers.personToDisplayString).join(', '),
        '<b>Team 2: ' + side2.score + '</b>. &nbsp;' + side2.getPeople().map(PhysEd.Transformers.personToDisplayString).join(', '),
        '',
        PhysEd.Leaderboard.getLeaderboard(league.sportName, PhysEd.StatsGenerator.generateStats(league), side1.getPlayerEmails().concat(side2.getPlayerEmails()))
    ].join('<br/>'));

    GASton.Database.remove(side1);
    GASton.Database.remove(side2);
};

PhysEd.GameRecorder._recordSide = function(side, game){
    var team = new PhysEd.Team(game.guid, side.score);

    side.getPeople().forEach(function(person){
        new PhysEd.PersonTeam(person.guid, team.guid);
    });
};
