PhysEd.Leaderboard = {};

PhysEd.Leaderboard.MIN_PARTICIPATION_PERCENTAGE = 20;

PhysEd.Leaderboard.getLeaderboard = function(sportName, personSports, boldPlayerEmails){
    personSports = personSports.filter(function(personSport){ return personSport.getParticipationPercentage() >= this.MIN_PARTICIPATION_PERCENTAGE; }, this);

    var columns = [
        {
            header: 'Name',
            getValue: function(personSport){return personSport.getPerson().getDisplayString();},
            sorted: this._sort(personSports, [PhysEd.Sorters.PersonSports.byPersonName])
        },
        {
            header: 'Win %',
            borderBefore: true,
            getValue: function(personSport){return personSport.getWinPercentage() + '%';},
            sorted: this._sort(personSports, [PhysEd.Sorters.PersonSports.byWinPercentage, PhysEd.Sorters.PersonSports.byWins, PhysEd.Sorters.PersonSports.byPlusMinusPerGame])
        },
        {
            header: 'Wins',
            getValue: function(personSport){return personSport[PhysEd.PersonSport.STREAKABLE_PROPS.WINS];},
            sorted: this._sort(personSports, [PhysEd.Sorters.PersonSports.byWins, PhysEd.Sorters.PersonSports.byWinPercentage, PhysEd.Sorters.PersonSports.byPlusMinusPerGame])
        },
        {
            header: 'Losses',
            getValue: function(personSport){return personSport[PhysEd.PersonSport.STREAKABLE_PROPS.LOSSES];},
            sorted: this._sort(personSports, [PhysEd.Sorters.PersonSports.byLosses, PhysEd.Sorters.PersonSports.byWinPercentage, PhysEd.Sorters.PersonSports.byPlusMinusPerGame])
        },
        {
            header: 'Ties',
            getValue: function(personSport){return personSport[PhysEd.PersonSport.STREAKABLE_PROPS.TIES];},
            sorted: this._sort(personSports, [PhysEd.Sorters.PersonSports.byTies, PhysEd.Sorters.PersonSports.byWinPercentage, PhysEd.Sorters.PersonSports.byPlusMinusPerGame])
        },
        {
            header: 'Win streak',
            getValue: function(personSport){
                return {
                    color: personSport.streakDir !== PhysEd.PersonSport.STREAKABLE_PROPS.TIES && (personSport.streakDir === PhysEd.PersonSport.STREAKABLE_PROPS.WINS ? 'red' : 'blue'),
                    html: personSport.streak + personSport.streakDir[0].toUpperCase()
                };
            },
            sorted: this._sort(personSports, [PhysEd.Sorters.PersonSports.byWinStreak, PhysEd.Sorters.PersonSports.byWinPercentage])
        },
        {
            header: '+/-',
            borderBefore: true,
            getValue: function(personSport){ return PhysEd.Leaderboard._toPrettyPlusMinus(personSport.plusMinus); },
            sorted: this._sort(personSports, [PhysEd.Sorters.PersonSports.byPlusMinus, PhysEd.Sorters.PersonSports.byPlusMinusPerGame])
        },
        {
            header: '+/- per game',
            getValue: function(personSport){ return PhysEd.Leaderboard._toPrettyPlusMinus(personSport.getPlusMinusPerGame().toFixed(2)); },
            sorted: this._sort(personSports, [PhysEd.Sorters.PersonSports.byPlusMinusPerGame, PhysEd.Sorters.PersonSports.byPlusMinus])
        },
        {
            header: 'Participation %',
            borderBefore: true,
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
        {
            header: 'Avg own team strength',
            borderBefore: true,
            getValue: function(personSport){return Math.round(personSport.getAverageOwnTeamWinPercentage());},
            sorted: this._sort(personSports, [PhysEd.Sorters.PersonSports.byAverageOwnTeamWinPercentage])
        },
        {
            header: 'Avg opposing team strength',
            getValue: function(personSport){return Math.round(personSport.getAverageOpponentWinPercentage());},
            sorted: this._sort(personSports, [PhysEd.Sorters.PersonSports.byAverageOpponentWinPercentage])
        },
        {
            header: 'Num upset wins',
            getValue: function(personSport){ return personSport.numUpsetWins; },
            sorted: this._sort(personSports,  [PhysEd.Sorters.PersonSports.byNumUpsetWins, PhysEd.Sorters.PersonSports.byUpsetWinPercentage])
        },
        {
            header: '% of wins that were upsets',
            getValue: function(personSport){ return personSport.getUpsetWinPercentage() + '%'; },
            sorted: this._sort(personSports,  [PhysEd.Sorters.PersonSports.byUpsetWinPercentage, PhysEd.Sorters.PersonSports.byNumUpsetWins])
        }
    ];

    var sortColumnIndex = 0;
    return 'Leaderboard for ' + sportName + ' (min. ' + this.MIN_PARTICIPATION_PERCENTAGE + '% participation, ranks in parens)<br/>' +
        '<table style="border-collapse: collapse;">' +
            '<tr>' +
                columns.map(function(column){
                    return '<th style="' + this._getCellStyle(column) + '">' + column.header + '</th>';
                }, this).join('') +
            '</tr>' +
            columns[sortColumnIndex].sorted.map(function(personSport, rowIndex){
                return '<tr style="' + (rowIndex % 2 ? '' : 'background-color: lightgray;') + (JSUtil.ArrayUtil.contains(boldPlayerEmails, personSport.getPerson().email) ? ' font-weight: bold;' : '') + '">' +
                        columns.map(function(column, columnIndex){
                            var rowItem = column.getValue(personSport);
                            return '<td style="' + this._getCellStyle(column) + (rowItem.color ? ' color: ' + rowItem.color + ';' : '') + '">' +
                                    (rowItem.html || rowItem) + (columnIndex === sortColumnIndex ? '' : ' (' + (column.sorted.indexOf(personSport) + 1) + ')') +
                                '</td>';
                        }, this).join('') +
                    '</tr>';
            }, this).join('') +
        '</table><br/><br/>';
};

PhysEd.Leaderboard._getCellStyle = function(column){ return 'border: 1px solid black;' + (column.borderBefore ? ' border-left-width: 3px;' : '') + ' padding: 4px;'; };

PhysEd.Leaderboard._sort = function(personSports, sorters){
    return personSports.map(function(personSport){return personSport;}).sort(function(ps1, ps2){
        var sortVal;
        return sorters.some(function(sorter){
            sortVal = sorter(ps1, ps2);
            return sortVal;
        }) ? sortVal : 0;
    });
};

PhysEd.Leaderboard._toPrettyPlusMinus = function(plusMinus){ return (plusMinus > 0 ? '+' : '') + plusMinus; };
