PhysEd.PlayerStatusParser = function(threads){
    this.inPlayers = [];
    this.maybePlayers = [];
    this.outPlayers = [];
    this.unknownPlayers = [];

    var statusArrayByPersonGuid = {};
    JSUtil.ArrayUtil.flatten(threads.map(function(thread){ return thread.getMessages(); })).
        filter(function(message){ return !GASton.Mail.isSentByUs(message); }).
        sort(function(m1, m2){ return m1.getDate() - m2.getDate(); }).
        forEach(function(message){ this._processMessage(message, statusArrayByPersonGuid); }, this);

    for(var personGuid in statusArrayByPersonGuid) {
        this[statusArrayByPersonGuid[personGuid]].push(GASton.Database.findBy(PhysEd.Person, 'guid', personGuid));
    }
};

PhysEd.PlayerStatusParser.prototype._getPersonGuid = function(message){
    var fromParts = GASton.Mail.parseFrom(message);
    var person = JSUtil.ArrayUtil.find(GASton.Database.hydrate(PhysEd.Person), function(person) {
        return person.email === fromParts.email ||
            (person.firstName === fromParts.firstName && person.lastName === fromParts.lastName) ||
            person.getAlternateNames().some(function(name){ return name === fromParts.email || name === fromParts.firstName + ' ' + fromParts.lastName; });
    });
    if(!person){
        person = new PhysEd.Person(fromParts.email, fromParts.firstName, fromParts.lastName);
        GASton.Database.persist(PhysEd.Person, person);
    }
    return person.guid;
};

PhysEd.PlayerStatusParser.prototype._processMessage = function (message, statusArrayByPersonGuid) {
    var personGuid = this._getPersonGuid(message);
    var statusArray = statusArrayByPersonGuid[personGuid] || 'unknownPlayers';
    GASton.Mail.getMessageWords(message).some(function(word, index, words){
        var wordStatusArray;
        if (/^in\W*$/i.test(word)) {
            wordStatusArray = 'inPlayers';
        } else if (/^(maybe|50\W?50)\W*$/i.test(word)) {
            wordStatusArray = 'maybePlayers';
        } else if (/^out\W*$/i.test(word)) {
            wordStatusArray = 'outPlayers';
        } else {
            return false;
        }

        var isPhraseForOtherPlayer = false;
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
                statusArrayByPersonGuid[otherPlayer.guid] = wordStatusArray;
            }
        });

        if(!isPhraseForOtherPlayer) {
            statusArray = wordStatusArray;
            return true;
        }
    }, this);
    statusArrayByPersonGuid[personGuid] = statusArray;
};
