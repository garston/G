PhysEd.PlayerStatusParser = function(messages){
    this.inPlayers = [];
    this.maybePlayers = [];
    this.outPlayers = [];
    this.unknownPlayers = [];

    var statusArrayByPersonGuid = {};
    messages.
        filter(function(m){ return !m.sentByUs; }).
        sort(function(m1, m2){ return m1.date - m2.date; }).
        forEach(function(m){ this._processMessage(m, statusArrayByPersonGuid); }, this);

    for(var personGuid in statusArrayByPersonGuid) {
        this[statusArrayByPersonGuid[personGuid]].push(GASton.Database.findBy(PhysEd.Person, 'guid', personGuid));
    }
};

PhysEd.PlayerStatusParser.prototype._getPersonGuid = function(message){
    var fromParts = message.fromParts;
    var person = JSUtil.ArrayUtil.find(GASton.Database.hydrate(PhysEd.Person), function(person) {
        return person.email === fromParts.email ||
            (person.firstName === fromParts.firstName && person.lastName === fromParts.lastName) ||
            person.getAlternateNames().some(function(name){ return name === fromParts.email || name === fromParts.firstName + ' ' + fromParts.lastName; });
    }) || GASton.Database.persist(new PhysEd.Person(fromParts.email, fromParts.firstName, fromParts.lastName));
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
            var otherPlayer = JSUtil.ArrayUtil.find(GASton.Database.hydrate(PhysEd.Person), function(person){
                return JSUtil.ArrayUtil.contains([person.firstName, person.lastName], possibleOtherPlayerName);
            });
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
