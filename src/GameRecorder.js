PhysEd.GameRecorder = function(){};

PhysEd.GameRecorder.prototype.record = function(side1, side2){
    var sportName = side1.sportName;
    var sport = PhysEd.Sport.hydrateByName(sportName);
    GASton.Database.persist(PhysEd.Sport, sport);

    var isFirstGameOfDay = !GASton.Database.hydrate(PhysEd.Game).some(function(game){
        return game.month === side1.month && game.day === side1.day && game.year === side1.year && game.sportGuid === sport.guid;
    });

    var game = new PhysEd.Game(side1.month, side1.day, side1.year, sport.guid);
    GASton.Database.persist(PhysEd.Game, game);

    var personSportsGuids1 = this._recordSide(side1, game, sport, side2.score);
    var personSportsGuids2 = this._recordSide(side2, game, sport, side1.score);

    var allPersonSports = GASton.Database.hydrate(PhysEd.PersonSport).filter(function(personSport){ return personSport.sportGuid === sport.guid; });
    if(isFirstGameOfDay){
        this._recordParticipation(JSUtil.ArrayUtil.unique(personSportsGuids1.concat(personSportsGuids2)), allPersonSports);
    }

    this._sendEmail(side1, side2, sportName, allPersonSports);

    GASton.Database.remove(PhysEd.Side, side2);
    GASton.Database.remove(PhysEd.Side, side1);
};

PhysEd.GameRecorder.prototype._recordParticipation = function(inPersonSportGuids, allPersonSports){
    allPersonSports.forEach(function(personSport){
        var isIn = JSUtil.ArrayUtil.contains(inPersonSportGuids, personSport.guid);
        var participationStreakDirBefore = personSport.participationStreakDir;
        personSport.incrementStreakableProp(isIn ? PhysEd.PersonSport.STREAKABLE_PROPS.INS : PhysEd.PersonSport.STREAKABLE_PROPS.OUTS);

        var affectedProperties = [isIn ? PhysEd.PersonSport.STREAKABLE_PROPS.INS : PhysEd.PersonSport.STREAKABLE_PROPS.OUTS, 'participationStreak'];
        if(participationStreakDirBefore !== personSport.participationStreakDir){
            affectedProperties.push('participationStreakDir');
        }
        GASton.Database.persistOnly(PhysEd.PersonSport, personSport, affectedProperties);
    });
};

PhysEd.GameRecorder.prototype._recordSide = function(side, game, sport, opponentScore){
    var team = new PhysEd.Team(game.guid, side.score);
    GASton.Database.persist(PhysEd.Team, team);

    return side.getPeople().map(function(person){
        GASton.Database.persist(PhysEd.Person, person);

        var personTeam = new PhysEd.PersonTeam(person.guid, team.guid);
        GASton.Database.persist(PhysEd.PersonTeam, personTeam);

        var personSport = person.getPersonSport(sport);
        if(typeof side.score === 'number' && typeof opponentScore === 'number'){
            personSport.incrementStreakableProp(side.score === opponentScore ? PhysEd.PersonSport.STREAKABLE_PROPS.TIES : (side.score > opponentScore ? PhysEd.PersonSport.STREAKABLE_PROPS.WINS : PhysEd.PersonSport.STREAKABLE_PROPS.LOSSES));
            personSport.plusMinus += side.score - opponentScore;
        }
        GASton.Database.persist(PhysEd.PersonSport, personSport);

        return personSport.guid;
    });
};

PhysEd.GameRecorder.prototype._sendEmail = function(side1, side2, sportName, allPersonSports){
    GASton.MailSender.sendToList('[PhysEdStats] ' + sportName + ' ' + side1.month + '/' + side1.day + '/' + side1.year, ['Game results',
        '<b>Team 1: ' + side1.score + '</b>. &nbsp;' + side1.getPeople().map(PhysEd.Transformers.personToDisplayString).join(', '),
        '<b>Team 2: ' + side2.score + '</b>. &nbsp;' + side2.getPeople().map(PhysEd.Transformers.personToDisplayString).join(', '),
        '',
        PhysEd.Leaderboard.getLeaderboard(sportName, allPersonSports, side1.getPlayerEmails().concat(side2.getPlayerEmails()))
    ].join('<br/>'), PhysEd.Const.PHYS_ED_STATS_EMAIL);
};
