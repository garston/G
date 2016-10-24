PhysEd.GameRecorder = {};

PhysEd.GameRecorder.record = function(side1, side2){
    var sport = PhysEd.Sport.hydrateByName(side1.sportName);
    GASton.Database.persist(PhysEd.Sport, sport);

    var game = new PhysEd.Game(side1.month, side1.day, side1.year, sport.guid);
    GASton.Database.persist(PhysEd.Game, game);

    this._recordSide(side1, game);
    this._recordSide(side2, game);

    this._sendEmail(side1, side2, sport.name, PhysEd.StatsGenerator.generateStats(sport));

    GASton.Database.remove(PhysEd.Side, side1);
    GASton.Database.remove(PhysEd.Side, side2);
};

PhysEd.GameRecorder._recordSide = function(side, game){
    var team = new PhysEd.Team(game.guid, side.score);
    GASton.Database.persist(PhysEd.Team, team);

    side.getPeople().forEach(function(person){
        GASton.Database.persist(PhysEd.Person, person);
        GASton.Database.persist(PhysEd.PersonTeam, new PhysEd.PersonTeam(person.guid, team.guid));
    });
};

PhysEd.GameRecorder._sendEmail = function(side1, side2, sportName, allPersonSports){
    GASton.MailSender.sendToList('[PhysEdStats] ' + sportName + ' ' + side1.month + '/' + side1.day + '/' + side1.year, ['Game results',
        '<b>Team 1: ' + side1.score + '</b>. &nbsp;' + side1.getPeople().map(PhysEd.Transformers.personToDisplayString).join(', '),
        '<b>Team 2: ' + side2.score + '</b>. &nbsp;' + side2.getPeople().map(PhysEd.Transformers.personToDisplayString).join(', '),
        '',
        PhysEd.Leaderboard.getLeaderboard(sportName, allPersonSports, side1.getPlayerEmails().concat(side2.getPlayerEmails()))
    ].join('<br/>'), PhysEd.Const.PHYS_ED_STATS_EMAIL);
};
