Leaderboard = function(){};

Leaderboard.prototype.getLeaderboards = function(sport, boldPlayerEmails){
    var personSports = Database.hydrateAllBy(PersonSport, ['sportGuid', sport.guid]);

    if(personSports.length === 0){
        return '';
    }

    personSports.sort(function(ps1, ps2){
        return ps2.getWinScore() - ps1.getWinScore();
    });

    var str = 'Win percentage leaderboard for ' + sport.name + '<br/>';
    str += this._createTable(personSports, function(personSport) {
        return [
            personSport.getWinScore(),
            personSport.wins + 'W-' + personSport.losses + 'L',
            {
                color: personSport.streakDir === PersonSport.STREAK_DIR.W ? 'red' : 'blue',
                html: personSport.streak + personSport.streakDir
            }
        ];
    }, boldPlayerEmails);

    str += '<br/><br/>';

    personSports.sort(function(ps1, ps2){
        return ps2.getParticipationScore() - ps1.getParticipationScore();
    });

    str += 'Participation percentage leaderboard for ' + sport.name + '<br/>';
    str += this._createTable(personSports, function(personSport) {
        return [
            personSport.getParticipationScore(),
            personSport.ins + 'ins-' + personSport.outs + 'outs',
            {
                color: personSport.participationStreakDir === PersonSport.STREAK_DIR.INS ? 'red' : 'blue',
                html: personSport.participationStreak + personSport.participationStreakDir
            }
        ];
    }, boldPlayerEmails);

    return str;
};

Leaderboard.prototype._createTable = function(personSports, createRowItemsFn, boldPlayerEmails) {
    var str = '';
    for(var i = 0; i < personSports.length; i++) {
        var personSport = personSports[i];
        str += this._createRow(personSport, createRowItemsFn, boldPlayerEmails);
    }
    return '<table>' + str + '</table>'
}

Leaderboard.prototype._createRow = function(personSport, createRowItemsFn, boldPlayerEmails) {
    var str = '';
    var items = [personSport.getPerson().getDisplayString()].concat(createRowItemsFn.call(this, personSport));
    for(var i = 0; i < items.length; i++) {
        var item = items[i];
        str += '<td' + (item.color ? ' style="color: ' + item.color + ';"' : '') + '>' + (item.html || item) + '</td>'
    }
    return '<tr' + (ArrayUtil.contains(boldPlayerEmails, personSport.getPerson().email) ? ' style="font-weight: bold;"' : '') + '>' + str + '</tr>';
}
