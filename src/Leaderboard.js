Leaderboard = function(){};

Leaderboard.prototype.getLeaderboards = function(sport, boldPlayerEmails){
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
        str += this._createRow([
            personSport.getWinScore(),
            personSport.wins + 'W-' + personSport.losses + 'L',
            this._colorStreakText(personSport.streak + personSport.streakDir, personSport.streakDir === PersonSport.STREAK_DIR.W)
        ], personSport.getPerson(), boldPlayerEmails);
    }

    str += '<br/><br/>';

    personSports.sort(function(ps1, ps2){
        return ps2.getParticipationScore() - ps1.getParticipationScore();
    });

    str += 'Participation percentage leaderboard for ' + sport.name + '<br/>';
    for(var i = 0; i < personSports.length; i++){
        personSport = personSports[i];
        str += this._createRow([
            personSport.getParticipationScore(),
            personSport.ins + 'ins-' + personSport.outs + 'outs',
            this._colorStreakText(personSport.participationStreak + personSport.participationStreakDir, personSport.participationStreakDir === PersonSport.STREAK_DIR.INS)
        ], personSport.getPerson(), boldPlayerEmails);
    }

    return str;
};

Leaderboard.prototype._colorStreakText = function(text, isHot){
    return '<span style="color: ' + (isHot ? 'red' : 'blue') + ';">' + text + '</span>';
};

Leaderboard.prototype._createRow = function(items, person, boldPlayerEmails) {
    var str = [person.getDisplayString()].concat(items).join('&nbsp;&nbsp;&nbsp;');
    if(ArrayUtil.contains(boldPlayerEmails, person.email)) {
        str = '<b>' + str + '</b>';
    }
    return str + '<br/>';
}
