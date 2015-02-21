PhysEd.GameRecorder = function(){};

PhysEd.GameRecorder.prototype.record = function(side1, side2){
    var sportName = side1.sportName;
    var sport = Database.hydrateBy(PhysEd.Sport, ['name', sportName]) || new PhysEd.Sport(sportName);
    Database.persist(PhysEd.Sport, sport);

    var isFirstGameOfDay = !Database.hasObject(PhysEd.Game, ['month', side1.month, 'day', side1.day, 'year', side1.year, 'sportGuid', sport.guid]);

    var game = new PhysEd.Game(side1.month, side1.day, side1.year, sport.guid);
    Database.persist(PhysEd.Game, game);

    var isParticipationOnly = typeof side1.score !== 'number' || typeof side2.score !== 'number';
    var personSportsGuids1 = this._recordSide(side1, game, sport, isParticipationOnly ? undefined : side1.score > side2.score);
    var personSportsGuids2 = this._recordSide(side2, game, sport, isParticipationOnly ? undefined : side2.score > side1.score);

    var allPersonSports = Database.hydrateAllBy(PhysEd.PersonSport, ['sportGuid', sport.guid]);
    if(isFirstGameOfDay){
        this._recordParticipation(ArrayUtil.unique(personSportsGuids1.concat(personSportsGuids2)), allPersonSports);
    }

    this._sendEmail(side1, side2, sportName, allPersonSports);

    Database.remove(PhysEd.Side, side2);
    Database.remove(PhysEd.Side, side1);
};

PhysEd.GameRecorder.prototype._recordParticipation = function(inPersonSportGuids, allPersonSports){
    ArrayUtil.forEach(allPersonSports, function(personSport){
        var isIn = ArrayUtil.contains(inPersonSportGuids, personSport.guid);
        var participationStreakDirBefore = personSport.participationStreakDir;
        personSport.recordParticipation(isIn);

        var affectedProperties = [isIn ? 'ins' : 'outs', 'participationStreak'];
        if(participationStreakDirBefore !== personSport.participationStreakDir){
            affectedProperties.push('participationStreakDir');
        }
        Database.persistOnly(PhysEd.PersonSport, personSport, affectedProperties);
    });
};

PhysEd.GameRecorder.prototype._recordSide = function(side, game, sport, isWinner){
    var team = new PhysEd.Team(game.guid, side.score);
    Database.persist(PhysEd.Team, team);

    return ArrayUtil.map(side.getPeople(), function(person){
        Database.persist(PhysEd.Person, person);

        var personTeam = new PhysEd.PersonTeam(person.guid, team.guid);
        Database.persist(PhysEd.PersonTeam, personTeam);

        var personSport = person.getPersonSport(sport);
        if(typeof isWinner === 'boolean'){
            personSport.recordResult(isWinner);
        }
        Database.persist(PhysEd.PersonSport, personSport);

        return personSport.guid;
    });
};

PhysEd.GameRecorder.prototype._sendEmail = function(side1, side2, sportName, allPersonSports){
    var month = side1.month;
    var day = side1.day;
    var year = side1.year;

    MailSender.send('[PhysEdStats] ' + sportName + ' ' + month + '/' + day + '/' + year, ['Game results',
        '<b>Team 1: ' + side1.score + '</b>. &nbsp;' + ArrayUtil.map(side1.getPeople(), PhysEd.Transformers.personToDisplayString).join(', '),
        '<b>Team 2: ' + side2.score + '</b>. &nbsp;' + ArrayUtil.map(side2.getPeople(), PhysEd.Transformers.personToDisplayString).join(', '),
        '',
        new PhysEd.Leaderboard().getLeaderboards(sportName, allPersonSports, side1.getPlayerEmails().concat(side2.getPlayerEmails()))
    ].join('<br/>'), PhysEd.Const.PHYS_ED_STATS_EMAIL);
};
