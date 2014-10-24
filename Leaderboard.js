Leaderboard = function(){};

Leaderboard.prototype.getLeaderboards = function(sport){
    var personSports = Database.hydrateAllBy(PersonSport, ['sportGuid', sport.guid]);

    if(personSports.length === 0){
        return '';
    }

    var personSport;

    personSports.sort(function(ps1, ps2){
        return ps2.getWinScore() - ps1.getWinScore();
    });

    var str = 'Win percentage leaderboard for ' + sport.name + '<br/>';
    for(var i = 0; i < personSports.length; i++){
        personSport = personSports[i];
        str += ['<b>' + personSport.getPerson().getDisplayString(),
            personSport.getWinScore() + '</b>',
            personSport.wins + 'W-' + personSport.losses + 'L',
            this._colorStreakText(personSport.streak + personSport.streakDir, personSport.streakDir === PersonSport.STREAK_DIR.W),
            '<br/>'
        ].join('&nbsp;&nbsp;&nbsp;');
    }

    str += '<br/><br/>';

    personSports.sort(function(ps1, ps2){
        return ps2.getParticipationScore() - ps1.getParticipationScore();
    });

    str += 'Participation percentage leaderboard for ' + sport.name + '<br/>';
    for(var i = 0; i < personSports.length; i++){
        personSport = personSports[i];
        str += ['<b>' + personSport.getPerson().getDisplayString(),
            personSport.getParticipationScore() + '</b>',
            personSport.ins + 'ins-' + personSport.outs + 'outs',
            this._colorStreakText(personSport.participationStreak + personSport.participationStreakDir, personSport.participationStreakDir === PersonSport.STREAK_DIR.INS),
            '<br/>'
        ].join('&nbsp;&nbsp;&nbsp;');
    }

    return str;
};

Leaderboard.prototype._colorStreakText = function(text, isHot){
    var streakColor = isHot ? 'red' : 'blue';
    return '<span style="color: ' + streakColor + ';">' + text + '</span>';
};

function _testLeaderboard() {
    var sport = Database.hydrateBy(Sport, ['name', 'Soccer']);
    var str = Leaderboard.prototype.getLeaderboards(sport);
    MailSender.send('_testLeaderboard', str, CONST.DEBUG_EMAIL);
}