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
    ArrayUtil.forEach(Database.hydrateAllBy(PersonSport, ['sportGuid', sport.guid]), function(personSport){
        var isIn = ArrayUtil.contains(inPersonSportGuids, personSport.guid);
        var participationStreakDirBefore = personSport.participationStreakDir;
        personSport.recordParticipation(isIn);

        var affectedProperties = [isIn ? 'ins' : 'outs', 'participationStreak'];
        if(participationStreakDirBefore !== personSport.participationStreakDir){
            affectedProperties.push('participationStreakDir');
        }
        Database.persistOnly(PersonSport, personSport, affectedProperties);
    });
};

GameRecorder.prototype._recordSide = function(side, game, sport, isWinner){
    var team = new Team(game.guid, side.score);
    Database.persist(Team, team);

    return ArrayUtil.map(side.getPeople(), function(person){
        Database.persist(Person, person);

        var personTeam = new PersonTeam(person.guid, team.guid);
        Database.persist(PersonTeam, personTeam);

        var personSport = person.getPersonSport(sport);
        if(typeof isWinner === 'boolean'){
            personSport.recordResult(isWinner);
        }
        Database.persist(PersonSport, personSport);

        return personSport.guid;
    });
};

GameRecorder.prototype._sendEmail = function(sport, side1, side2){
    var month = side1.month;
    var day = side1.day;
    var year = side1.year;

    MailSender.send('[PhysEdStats] ' + sport.name + ' ' + month + '/' + day + '/' + year, ['Game results',
        '<b>Team 1: ' + side1.score + '</b>. &nbsp;' + ArrayUtil.map(side1.getPeople(), Transformers.personToDisplayString).join(', '),
        '<b>Team 2: ' + side2.score + '</b>. &nbsp;' + ArrayUtil.map(side2.getPeople(), Transformers.personToDisplayString).join(', '),
        '',
        new Leaderboard().getLeaderboards(sport, side1.getPlayerEmails().concat(side2.getPlayerEmails()))
    ].join('<br/>'), CONST.PHYS_ED_STATS_EMAIL);
};
