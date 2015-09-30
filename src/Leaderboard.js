PhysEd.Leaderboard = {};

PhysEd.Leaderboard.getLeaderboard = function(sportName, personSports, boldPlayerEmails){
    personSports.sort(function(ps1, ps2){
        return ps1.getPerson().getDisplayString().localeCompare(ps2.getPerson().getDisplayString());
    });

    var streakablePropsColorMap = {};
    streakablePropsColorMap[PhysEd.PersonSport.STREAKABLE_PROPS.WINS] = streakablePropsColorMap[PhysEd.PersonSport.STREAKABLE_PROPS.INS] = 'red';
    streakablePropsColorMap[PhysEd.PersonSport.STREAKABLE_PROPS.LOSSES] = streakablePropsColorMap[PhysEd.PersonSport.STREAKABLE_PROPS.OUTS] = 'blue';

    return 'Leaderboard for ' + sportName + '<br/>' +
        '<table>' +
            JSUtil.ArrayUtil.map(personSports, function(personSport){
                var rowItems = [
                    personSport.getPerson().getDisplayString(),
                    personSport.getWinScore(),
                    personSport[PhysEd.PersonSport.STREAKABLE_PROPS.WINS] + 'W-' + personSport[PhysEd.PersonSport.STREAKABLE_PROPS.LOSSES] + 'L-' + personSport[PhysEd.PersonSport.STREAKABLE_PROPS.TIES] + 'T',
                    {
                        color: streakablePropsColorMap[personSport.streakDir],
                        html: personSport.streak + personSport.streakDir[0].toUpperCase()
                    },
                    (personSport.plusMinus > 0 ? '+' : '') + personSport.plusMinus,
                    personSport.getParticipationScore(),
                    personSport[PhysEd.PersonSport.STREAKABLE_PROPS.INS] + 'ins-' + personSport[PhysEd.PersonSport.STREAKABLE_PROPS.OUTS] + 'outs',
                    {
                        color: streakablePropsColorMap[personSport.participationStreakDir],
                        html: personSport.participationStreak + personSport.participationStreakDir
                    }
                ];
                return '<tr' + (JSUtil.ArrayUtil.contains(boldPlayerEmails, personSport.getPerson().email) ? ' style="font-weight: bold;"' : '') + '>' +
                        JSUtil.ArrayUtil.map(rowItems, function(rowItem){
                            return '<td' + (rowItem.color ? ' style="color: ' + rowItem.color + ';"' : '') + '>' +
                                    (rowItem.html || rowItem) +
                                '</td>';
                        }).join('') +
                    '</tr>';
            }).join('') +
        '</table><br/><br/>';
};
