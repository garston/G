PhysEd.PlayerStatusParser = function(dateSortedMessages){
    this.inPlayers = [];
    this.maybePlayers = [];
    this.outPlayers = [];
    this.unknownPlayers = [];

    var statusArrayByPersonGuid = {};
    dateSortedMessages.
        filter(function(m){ return !m.sentByScript; }).
        forEach(function(m){ this._processMessage(m, statusArrayByPersonGuid); }, this);

    for(var personGuid in statusArrayByPersonGuid) {
        this[statusArrayByPersonGuid[personGuid]].push(GASton.Database.findBy(PhysEd.Person, 'guid', personGuid));
    }
};

PhysEd.PlayerStatusParser.prototype._getPersonGuid = function(message){
    var fromParts = message.fromParts;
    const person = GASton.Database.hydrate(PhysEd.Person).find(person =>
        person.email === fromParts.email ||
            (person.firstName === fromParts.firstName && person.lastName === fromParts.lastName) ||
            person.getAlternateNames().some(name => name === fromParts.email || name === fromParts.firstName + ' ' + fromParts.lastName)
    ) || new PhysEd.Person(fromParts.email, fromParts.firstName, fromParts.lastName);
    return person.guid;
};

PhysEd.PlayerStatusParser.prototype._processMessage = function (message, statusArrayByPersonGuid) {
    var newStatusArray = message.words.reduce(function(playerStatusArray, word, index, words){
        var statusArray;
        if (/^in\W*$/i.test(word)) {
            statusArray = 'inPlayers';
        } else if (/^(maybe|50\W?50)\W*$/i.test(word)) {
            statusArray = 'maybePlayers';
        } else if (/^out\W*$/i.test(word)) {
            statusArray = 'outPlayers';
        } else {
            return playerStatusArray;
        }

        var isPhraseForOtherPlayer;
        words.slice(0, index).reverse().some(function(wordInPhrase){
            if(/[.!?;]$/.test(wordInPhrase)){
                return true;
            }

            var possibleOtherPlayerName = JSUtil.StringUtil.capitalize(wordInPhrase.replace(/,$/, '').toLowerCase());
            const otherPlayer = GASton.Database.hydrate(PhysEd.Person).find(p => [p.firstName, p.lastName].includes(possibleOtherPlayerName));
            if(otherPlayer) {
                isPhraseForOtherPlayer = true;
                statusArrayByPersonGuid[otherPlayer.guid] = statusArray;
            }
        });

        return playerStatusArray || (!isPhraseForOtherPlayer && statusArray);
    }, null);

    var personGuid = this._getPersonGuid(message);
    statusArrayByPersonGuid[personGuid] = newStatusArray || statusArrayByPersonGuid[personGuid] || 'unknownPlayers';
};
