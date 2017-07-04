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
        if (/^(in|yes|yep|yea|yeah|yay)\W*$/i.test(word)) {
            var possibleIsIndex = index - (words[index - 1] === 'also' ? 2 : 1);
            var possiblePlus1PlayerName = words[possibleIsIndex - 1];
            if(words[possibleIsIndex] === 'is' && possiblePlus1PlayerName) {
                possiblePlus1PlayerName = JSUtil.StringUtil.capitalize(possiblePlus1PlayerName.toLowerCase());
                var plus1Player = JSUtil.ArrayUtil.find(GASton.Database.hydrate(PhysEd.Person), function(person){
                    return JSUtil.ArrayUtil.contains([person.firstName, person.lastName], possiblePlus1PlayerName);
                });
                if(plus1Player) {
                    statusArrayByPersonGuid[plus1Player.guid] = 'inPlayers';
                    return false;
                }
            }

            statusArray = 'inPlayers';
            return true;
        } else if (/^(maybe|50\W?50)\W*$/i.test(word)) {
            statusArray = 'maybePlayers';
            return true;
        } else if (/^out\W*$/i.test(word)) {
            statusArray = 'outPlayers';
            return true;
        }
    }, this);
    statusArrayByPersonGuid[personGuid] = statusArray;
};
