PhysEd.Leaderboard = {};

PhysEd.Leaderboard.getLeaderboard = function(sportName, personSports, boldPlayerEmails){
    var columns = [
        {
            header: 'Name',
            getValue: function(personSport){return personSport.getPerson().getDisplayString();},
            sorted: this._sort(personSports, [PhysEd.Sorters.PersonSports.byPersonName])
        },
        {
            header: 'Win %',
            getValue: function(personSport){return personSport.getWinPercentage() + '%';},
            sorted: this._sort(personSports, [PhysEd.Sorters.PersonSports.byWinPercentage, PhysEd.Sorters.PersonSports.byWins, PhysEd.Sorters.PersonSports.byPlusMinus])
        },
        {
            header: 'Wins',
            getValue: function(personSport){return personSport[PhysEd.PersonSport.STREAKABLE_PROPS.WINS];},
            sorted: this._sort(personSports, [PhysEd.Sorters.PersonSports.byWins, PhysEd.Sorters.PersonSports.byWinPercentage, PhysEd.Sorters.PersonSports.byPlusMinus])
        },
        {
            header: 'Losses',
            getValue: function(personSport){return personSport[PhysEd.PersonSport.STREAKABLE_PROPS.LOSSES];},
            sorted: this._sort(personSports, [PhysEd.Sorters.PersonSports.byLosses, PhysEd.Sorters.PersonSports.byWinPercentage, PhysEd.Sorters.PersonSports.byPlusMinus])
        },
        {
            header: 'Ties',
            getValue: function(personSport){return personSport[PhysEd.PersonSport.STREAKABLE_PROPS.TIES];},
            sorted: this._sort(personSports, [PhysEd.Sorters.PersonSports.byTies, PhysEd.Sorters.PersonSports.byWinPercentage, PhysEd.Sorters.PersonSports.byWins, PhysEd.Sorters.PersonSports.byPlusMinus])
        },
        {
            header: 'Win streak',
            getValue: function(personSport){
                return {
                    color: personSport.streakDir !== PhysEd.PersonSport.STREAKABLE_PROPS.TIES && (personSport.streakDir === PhysEd.PersonSport.STREAKABLE_PROPS.WINS ? 'red' : 'blue'),
                    html: personSport.streak + personSport.streakDir[0].toUpperCase()
                };
            },
            sorted: this._sort(personSports, [PhysEd.Sorters.PersonSports.byWinStreak, PhysEd.Sorters.PersonSports.byWinPercentage, PhysEd.Sorters.PersonSports.byWins, PhysEd.Sorters.PersonSports.byPlusMinus])
        },
        {
            header: '+/-',
            getValue: function(personSport){return (personSport.plusMinus > 0 ? '+' : '') + personSport.plusMinus;},
            sorted: this._sort(personSports, [PhysEd.Sorters.PersonSports.byPlusMinus, PhysEd.Sorters.PersonSports.byWinPercentage, PhysEd.Sorters.PersonSports.byWins])
        },
        {
            header: 'Participation %',
            getValue: function(personSport){return personSport.getParticipationPercentage() + '%';},
            sorted: this._sort(personSports, [PhysEd.Sorters.PersonSports.byParticipationPercentage, PhysEd.Sorters.PersonSports.byIns])
        },
        {
            header: 'Ins',
            getValue: function(personSport){return personSport[PhysEd.PersonSport.STREAKABLE_PROPS.INS];},
            sorted: this._sort(personSports, [PhysEd.Sorters.PersonSports.byIns, PhysEd.Sorters.PersonSports.byParticipationPercentage])
        },
        {
            header: 'Outs',
            getValue: function(personSport){return personSport[PhysEd.PersonSport.STREAKABLE_PROPS.OUTS];},
            sorted: this._sort(personSports, [PhysEd.Sorters.PersonSports.byOuts, PhysEd.Sorters.PersonSports.byParticipationPercentage])
        },
        {
            header: 'Participation streak',
            getValue: function(personSport){
                return {
                    color: personSport.participationStreakDir === PhysEd.PersonSport.STREAKABLE_PROPS.INS ? 'red' : 'blue',
                    html: personSport.participationStreak + personSport.participationStreakDir
                };
            },
            sorted: this._sort(personSports, [PhysEd.Sorters.PersonSports.byParticipationStreak, PhysEd.Sorters.PersonSports.byParticipationPercentage, PhysEd.Sorters.PersonSports.byIns])
        },
    ];

    var sortColumnIndex = 0;
    return 'Leaderboard for ' + sportName + ' (ranks in parens)<br/>' +
        '<table>' +
            '<tr>' +
                columns.map(function(column){
                    return '<th>' + column.header + '</th>';
                }).join('') +
            '</tr>' +
            columns[sortColumnIndex].sorted.map(function(personSport){
                return '<tr' + (JSUtil.ArrayUtil.contains(boldPlayerEmails, personSport.getPerson().email) ? ' style="font-weight: bold;"' : '') + '>' +
                        columns.map(function(column, columnIndex){
                            var rowItem = column.getValue(personSport);
                            return '<td' + (rowItem.color ? ' style="color: ' + rowItem.color + ';"' : '') + '>' +
                                    (rowItem.html || rowItem) + (columnIndex === sortColumnIndex ? '' : ' (' + (column.sorted.indexOf(personSport) + 1) + ')') +
                                '</td>';
                        }).join('') +
                    '</tr>';
            }).join('') +
        '</table><br/><br/>';
};

PhysEd.Leaderboard._sort = function(personSports, sorters){
    return personSports.map(function(personSport){return personSport;}).sort(function(ps1, ps2){
        var sortVal;
        return sorters.some(function(sorter){
            sortVal = sorter(ps1, ps2);
            return sortVal;
        }) ? sortVal : 0;
    });
};
