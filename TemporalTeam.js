TemporalTeam = function(personSports){
    this.personSports = personSports || [];
};

TemporalTeam.prototype.getOverallScore = function(){
    var total = 0;
    for(var i = 0; i < this.personSports.length; i++){
        total += this.personSports[i].getWinScore();
    }
    return (total / this.personSports.length).toFixed(0);
};

TemporalTeam.prototype.toString = function(name){
    var playerStrings = [];
    for(var i = 0; i < this.personSports.length; i++){
        var personSport = this.personSports[i];
        playerStrings.push(personSport.getPerson().getDisplayString() + ' (' + personSport.getWinScore() + ')');
    }
    return name + '(' + this.getOverallScore() + '): ' + playerStrings.join(', ');
};

TemporalTeam.compare = function(tt1, tt2){
    return tt2.getOverallScore() - tt1.getOverallScore();
};