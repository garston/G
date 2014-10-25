var TeamSuggester = function(){};

TeamSuggester.prototype.suggestTeams = function(thread){
    var emailMetadata = thread.parseInitialEmail();
    var sportName = emailMetadata.sportName;
    var sport = Database.hydrateBy(Sport, ['name', sportName]) || new Sport(sportName);

    var persons = thread.parsePlayers().ins;

    var personSports = [];
    for(var i = 0; i < persons.length; i++){
        personSports.push(persons[i].getPersonSport(sport));
    }

    var teams = TeamSuggester._snakeDraft(personSports);

    //TeamSuggester._sendEmail(personSports.length, teams, sport, thread);
    TeamSuggester._persist(teams, emailMetadata.date, sportName);
};

TeamSuggester._sendEmail = function(numPlayers, teams, sport, thread){
    var body = [numPlayers + ' players. Suggested teams:'];
    for(var i = 0; i < teams.length; i++){
        body.push(teams[i].toString('Team ' + (i+1)));
    }

    body = body.concat([
        '',
        'Record game at: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl()
    ]);
    //MailSender.replyAll(thread.thread, body.join('<br/>', ));
};

TeamSuggester._snakeDraft = function(personSports){
    personSports.sort(function(ps1, ps2){
        return ps2.getWinScore() - ps1.getWinScore();
    });

    var teams = [new TemporalTeam(), new TemporalTeam()];
    var isOddNumberOfPlayers = personSports.length % 2 !== 0;
    for(var i = 0; i < personSports.length; i++){
        if(i % teams.length === 0){
            teams.reverse();
        }

        var isLastPlayer = i === personSports.length - 1;
        var team = isLastPlayer && isOddNumberOfPlayers ? teams.sort(TemporalTeam.compare)[teams.length - 1] : teams[i % teams.length];
        team.personSports.push(personSports[i]);
    }
    return teams;
};

TeamSuggester._persist = function(teams, date, sportName){
    for(var i = 0; i < teams.length; i++){
        var team = teams[i];
        var playerEmails = [];
        for(var j = 0; j < team.personSports.length; j++){
            playerEmails.push(team.personSports[j].getPerson().email);
        }
        var dateParts = DateUtil.splitPrettyDate(date);
        Database.persist(Side, new Side(dateParts.month, dateParts.day, dateParts.year, sportName, '', playerEmails));
    }
};
