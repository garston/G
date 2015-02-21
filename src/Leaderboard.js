PhysEd.Leaderboard = function(){};

PhysEd.Leaderboard.prototype.getLeaderboards = function(sportName, personSports, boldPlayerEmails){
    personSports.sort(function(ps1, ps2){
        return ps2.getWinScore() - ps1.getWinScore();
    });

    var html = 'Win percentage leaderboard for ' + sportName + '<br/>';
    html += this._createTable(personSports, function(personSport) {
        return [
            personSport.getWinScore(),
            personSport.wins + 'W-' + personSport.losses + 'L',
            {
                color: personSport.streakDir === PhysEd.PersonSport.STREAK_DIR.W ? 'red' : 'blue',
                html: personSport.streak + personSport.streakDir
            }
        ];
    }, boldPlayerEmails);

    html += '<br/><br/>';

    personSports.sort(function(ps1, ps2){
        return ps2.getParticipationScore() - ps1.getParticipationScore();
    });

    html += 'Participation percentage leaderboard for ' + sportName + '<br/>';
    html += this._createTable(personSports, function(personSport) {
        return [
            personSport.getParticipationScore(),
            personSport.ins + 'ins-' + personSport.outs + 'outs',
            {
                color: personSport.participationStreakDir === PhysEd.PersonSport.STREAK_DIR.INS ? 'red' : 'blue',
                html: personSport.participationStreak + personSport.participationStreakDir
            }
        ];
    }, boldPlayerEmails);

    return html;
};

PhysEd.Leaderboard.prototype._createTable = function(personSports, createRowItemsFn, boldPlayerEmails) {
    return '<table>' +
                ArrayUtil.map(personSports, function(personSport){
                    return this._createRow(personSport, createRowItemsFn, boldPlayerEmails);
                }, this).join('') +
           '</table>'
}

PhysEd.Leaderboard.prototype._createRow = function(personSport, createRowItemsFn, boldPlayerEmails) {
    var rowItems = [personSport.getPerson().getDisplayString()].concat(createRowItemsFn.call(this, personSport));
    return '<tr' + (ArrayUtil.contains(boldPlayerEmails, personSport.getPerson().email) ? ' style="font-weight: bold;"' : '') + '>' +
                ArrayUtil.map(rowItems, function(rowItem){
                    return '<td' + (rowItem.color ? ' style="color: ' + rowItem.color + ';"' : '') + '>' +
                                (rowItem.html || rowItem) +
                            '</td>';
                }).join('') +
           '</tr>';
}
