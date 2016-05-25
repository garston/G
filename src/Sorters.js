PhysEd.Sorters = {
    PersonSports: {
        byAverageOpponentWinPercentage: function(ps1, ps2){ return ps2.getAverageOpponentWinPercentage() - ps1.getAverageOpponentWinPercentage(); },
        byAverageOwnTeamWinPercentage: function(ps1, ps2){ return ps2.getAverageOwnTeamWinPercentage() - ps1.getAverageOwnTeamWinPercentage(); },
        byIns: function(ps1, ps2){ return ps2[PhysEd.PersonSport.STREAKABLE_PROPS.INS] - ps1[PhysEd.PersonSport.STREAKABLE_PROPS.INS]; },
        byLosses: function(ps1, ps2){ return ps2[PhysEd.PersonSport.STREAKABLE_PROPS.LOSSES] - ps1[PhysEd.PersonSport.STREAKABLE_PROPS.LOSSES]; },
        byOuts: function(ps1, ps2){ return ps2[PhysEd.PersonSport.STREAKABLE_PROPS.OUTS] - ps1[PhysEd.PersonSport.STREAKABLE_PROPS.OUTS]; },
        byNumUpsetWins: function(ps1, ps2){ return ps2.numUpsetWins - ps1.numUpsetWins; },
        byParticipationPercentage: function(ps1, ps2){ return ps2.getParticipationPercentage() - ps1.getParticipationPercentage(); },
        byParticipationStreak: function(ps1, ps2){
            return PhysEd.Sorters.PersonSports._byStreak(
                ps1.participationStreakDir, ps2.participationStreakDir, ps1.participationStreak, ps2.participationStreak,
                [PhysEd.PersonSport.STREAKABLE_PROPS.INS, PhysEd.PersonSport.STREAKABLE_PROPS.OUTS]
            );
        },
        byPersonName: function(ps1, ps2){ return ps1.getPerson().getDisplayString().localeCompare(ps2.getPerson().getDisplayString()); },
        byPlusMinus: function(ps1, ps2){ return ps2.plusMinus - ps1.plusMinus; },
        byPlusMinusPerGame: function(ps1, ps2){ return ps2.getPlusMinusPerGame() - ps1.getPlusMinusPerGame(); },
        byTies: function(ps1, ps2){ return ps2[PhysEd.PersonSport.STREAKABLE_PROPS.TIES] - ps1[PhysEd.PersonSport.STREAKABLE_PROPS.TIES]; },
        byWins: function(ps1, ps2){ return ps2[PhysEd.PersonSport.STREAKABLE_PROPS.WINS] - ps1[PhysEd.PersonSport.STREAKABLE_PROPS.WINS]; },
        byWinPercentage: function(ps1, ps2){ return ps2.getWinPercentage() - ps1.getWinPercentage(); },
        byWinStreak: function(ps1, ps2){
            return PhysEd.Sorters.PersonSports._byStreak(
                ps1.streakDir, ps2.streakDir, ps1.streak, ps2.streak,
                [PhysEd.PersonSport.STREAKABLE_PROPS.WINS, PhysEd.PersonSport.STREAKABLE_PROPS.TIES, PhysEd.PersonSport.STREAKABLE_PROPS.LOSSES]
            );
        },
        _byStreak: function(streakDir1, streakDir2, streak1, streak2, streakOrder){
            return (streakOrder.indexOf(streakDir1) - streakOrder.indexOf(streakDir2)) || (streakDir1 === streakOrder[streakOrder.length - 1] ? streak1 - streak2 : streak2 - streak1);
        }
    }
};
