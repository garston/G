GameRecorder = function(){};

GameRecorder.prototype.record = function(side1, side2){
    var sportName = side1.sportName;
    var sport = Database.hydrateBy(Sport, ['name', sportName]) || new Sport(sportName);
    Database.persist(Sport, sport);

    var isFirstGameOfDay = !Database.hasObject(Game, ['month', side1.month, 'day', side1.day, 'year', side1.year, 'sportGuid', sport.guid]);

    var game = new Game(side1.month, side1.day, side1.year, sport.guid);
    Database.persist(Game, game);

    var isParticipationOnly = typeof side1.score !== 'number' || typeof side2.score !== 'number';
    var personSportsGuids1 = this._recordSide(side1, game, sport, isParticipationOnly ? undefined : side1.score > side2.score);
    var personSportsGuids2 = this._recordSide(side2, game, sport, isParticipationOnly ? undefined : side2.score > side1.score);

    if(isFirstGameOfDay){
        this._recordParticipation(ArrayUtil.unique(personSportsGuids1.concat(personSportsGuids2)), sport);
    }

    this._sendEmail(sport, side1, side2);

    Database.remove(Side, side2);
    Database.remove(Side, side1);
};

GameRecorder.prototype._recordParticipation = function(inPersonSportGuids, sport){
    var personSports = Database.hydrateAllBy(PersonSport, ['sportGuid', sport.guid]);
    for(var i = 0; i < personSports.length; i++){
        var personSport = personSports[i];

        var isIn = ArrayUtil.contains(inPersonSportGuids, personSport.guid);
        var participationStreakDirBefore = personSport.participationStreakDir;
        personSport.recordParticipation(isIn);

        var affectedProperties = [isIn ? 'ins' : 'outs', 'participationStreak'];
        if(participationStreakDirBefore !== personSport.participationStreakDir){
            affectedProperties.push('participationStreakDir');
        }
        Database.persistOnly(PersonSport, personSport, affectedProperties);
    }
};

GameRecorder.prototype._recordSide = function(side, game, sport, isWinner){
    var personSportsGuids = [];

    var team = new Team(game.guid, side.score);
    Database.persist(Team, team);

    var people = side.getPeople();
    for(var i = 0; i < people.length; i++){
        var person = people[i];
        Database.persist(Person, person);

        var personTeam = new PersonTeam(person.guid, team.guid);
        Database.persist(PersonTeam, personTeam);

        var personSport = person.getPersonSport(sport);
        if(typeof isWinner === 'boolean'){
            personSport.recordResult(isWinner);
        }
        Database.persist(PersonSport, personSport);

        personSportsGuids.push(personSport.guid);
    }

    return personSportsGuids;
};

GameRecorder.prototype._sendEmail = function(sport, side1, side2){
    var month = side1.month;
    var day = side1.day;
    var year = side1.year;

    /*var queryString = 'from:' + CONST.PHYS_ED_NAME +
     ' before:' + year + '/' + (month < 10 ? '0' + month : month) + '/' + (day < 10 ? '0' + day : day) +
     ' subject:' + (sport.name === InBasedThread.BASKETBALL_STORED_NAME ? InBasedThread.BASKETBALL_PRETTY_NAME : sport.name);
     var threads = GmailApp.search(queryString, 0, 1);
     if(threads.length === 0){
     return;
     }*/

    var body = ['Game results',
        '<b>Team 1: ' + side1.score + '</b>. &nbsp;' + side1.getPeopleDisplayStrings().join(', '),
        '<b>Team 2: ' + side2.score + '</b>. &nbsp;' + side2.getPeopleDisplayStrings().join(', '),
        '',
        new Leaderboard().getLeaderboards(sport)
    ].join('<br/>');

    //MailSender.replyAll(threads[0], body, );
    //MailSender.forward(threads[0].getMessages()[0], CONST.PHYS_ED_STATS_EMAIL, body);
    MailSender.send('[PhysEdStats] ' + sport.name + ' ' + month + '/' + day + '/' + year, body, CONST.PHYS_ED_STATS_EMAIL);
};
