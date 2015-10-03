PhysEd.Leaderboard = {};

PhysEd.Leaderboard.getLeaderboard = function(sportName, personSports, boldPlayerEmails){
    personSports.sort(function(ps1, ps2){
        return ps1.getPerson().getDisplayString().localeCompare(ps2.getPerson().getDisplayString());
    });

    var streakablePropsColorMap = {};
    streakablePropsColorMap[PhysEd.PersonSport.STREAKABLE_PROPS.WINS] = streakablePropsColorMap[PhysEd.PersonSport.STREAKABLE_PROPS.INS] = 'red';
    streakablePropsColorMap[PhysEd.PersonSport.STREAKABLE_PROPS.LOSSES] = streakablePropsColorMap[PhysEd.PersonSport.STREAKABLE_PROPS.OUTS] = 'blue';

    var columns = [
        {
            header: 'Name',
            getValue: function(personSport){return personSport.getPerson().getDisplayString();}
        },
        {
            header: 'Win %',
            getValue: function(personSport){return personSport.getWinPercentage() + '%';}
        },
        {
            header: 'Wins',
            getValue: function(personSport){return personSport[PhysEd.PersonSport.STREAKABLE_PROPS.WINS];}
        },
        {
            header: 'Losses',
            getValue: function(personSport){return personSport[PhysEd.PersonSport.STREAKABLE_PROPS.LOSSES];}
        },
        {
            header: 'Ties',
            getValue: function(personSport){return personSport[PhysEd.PersonSport.STREAKABLE_PROPS.TIES];}
        },
        {
            header: 'Win streak',
            getValue: function(personSport){
                return {
                    color: streakablePropsColorMap[personSport.streakDir],
                    html: personSport.streak + personSport.streakDir[0].toUpperCase()
                };
            }
        },
        {
            header: '+/-',
            getValue: function(personSport){return (personSport.plusMinus > 0 ? '+' : '') + personSport.plusMinus;}
        },
        {
            header: 'Participation %',
            getValue: function(personSport){return personSport.getParticipationPercentage() + '%';}
        },
        {
            header: 'Ins',
            getValue: function(personSport){return personSport[PhysEd.PersonSport.STREAKABLE_PROPS.INS];}
        },
        {
            header: 'Outs',
            getValue: function(personSport){return personSport[PhysEd.PersonSport.STREAKABLE_PROPS.OUTS];}
        },
        {
            header: 'Participation streak',
            getValue: function(personSport){
                return {
                    color: streakablePropsColorMap[personSport.participationStreakDir],
                    html: personSport.participationStreak + personSport.participationStreakDir
                };
            }
        },
    ];

    return 'Leaderboard for ' + sportName + '<br/>' +
        '<table>' +
            '<tr>' +
                JSUtil.ArrayUtil.map(columns, function(column){
                    return '<th>' + column.header + '</th>';
                }).join('') +
            '</tr>' +
            JSUtil.ArrayUtil.map(personSports, function(personSport){
                return '<tr' + (JSUtil.ArrayUtil.contains(boldPlayerEmails, personSport.getPerson().email) ? ' style="font-weight: bold;"' : '') + '>' +
                        JSUtil.ArrayUtil.map(columns, function(column){
                            var rowItem = column.getValue(personSport);
                            return '<td' + (rowItem.color ? ' style="color: ' + rowItem.color + ';"' : '') + '>' +
                                    (rowItem.html || rowItem) +
                                '</td>';
                        }).join('') +
                    '</tr>';
            }).join('') +
        '</table><br/><br/>';
};
