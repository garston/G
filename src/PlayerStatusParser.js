PhysEd.PlayerStatusParser = function(thread){
    this.inPlayers = [];
    this.plus1Players = [];
    this.maybePlayers = [];
    this.outPlayers = [];
    this.unknownPlayers = [];

    var replyMessages = JSUtil.ArrayUtil.filter(thread.getMessages(), function(message){
        return !JSUtil.StringUtil.contains(message.getFrom(), GASton.MailSender.getNameUsedForSending());
    });

    var people = [];
    var messagesByPersonGuid = JSUtil.ArrayUtil.groupBy(replyMessages, function(message){
        var fromParts = this._parseFromString(message.getFrom());

        var person = JSUtil.ArrayUtil.find(people, function(person) { return person.firstName === fromParts.firstName && person.lastName === fromParts.lastName; });
        if(!person){
            person = GASton.Database.hydrateBy(PhysEd.Person, ['firstName', fromParts.firstName, 'lastName', fromParts.lastName]);
            if(!person){
                person = new PhysEd.Person(fromParts.email, fromParts.firstName, fromParts.lastName);
                GASton.Database.persist(PhysEd.Person, person);
            }
            people.push(person);
        }

        return person.guid;
    }, this);

    for(var personGuid in messagesByPersonGuid) {
        var playerStatusParser = this;
        var statusArray = JSUtil.ArrayUtil.reduce(messagesByPersonGuid[personGuid], function(currentStatusArray, message){
            var newStatusArray = playerStatusParser._determineStatusArrayFromMessage(message);
            return currentStatusArray && newStatusArray === playerStatusParser.unknownPlayers ? currentStatusArray : newStatusArray;
        }, undefined);
        statusArray.push(JSUtil.ArrayUtil.find(people, function(person){ return person.guid === personGuid; }));
    }

    this.inPlayers = this.inPlayers.concat(this.plus1Players);
};

PhysEd.PlayerStatusParser.prototype._determineStatusArrayFromMessage = function (message) {
    var words = JSUtil.ArrayUtil.reduce(message.getPlainBody().split('\n'), function(allWords, line) {
        return line[0] === '>' ? allWords : allWords.concat(JSUtil.ArrayUtil.compact(line.trim().split(' ')));
    }, []);

    if(words.length === 0){
        return this.inPlayers;
    }

    var statusArray = this.unknownPlayers;
    JSUtil.ArrayUtil.any(words, function(word, index){
        if (/^(in|yes|yep|yea|yeah|yay)\W*$/i.test(word)) {
            statusArray = this.inPlayers;

            var possibleIsIndex = index - (words[index - 1] === 'also' ? 2 : 1);
            var possiblePlus1PlayerName = words[possibleIsIndex - 1];
            if(words[possibleIsIndex] === 'is' && possiblePlus1PlayerName) {
                var plus1Player = GASton.Database.hydrateBy(PhysEd.Person, ['firstName', possiblePlus1PlayerName]) || GASton.Database.hydrateBy(PhysEd.Person, ['lastName', possiblePlus1PlayerName]);
                if(plus1Player) {
                    this.plus1Players.push(plus1Player);
                }
            }

            return true;
        } else if (/^(maybe|50\W?50)\W*$/i.test(word)) {
            statusArray = this.maybePlayers;
            return true;
        } else if (/^out\W*$/i.test(word)) {
            statusArray = this.outPlayers;
            return true;
        }
    }, this);
    return statusArray;
};

PhysEd.PlayerStatusParser.prototype._parseFromString = function(fromString){
    var parts = fromString.split(' ');

    var parsed = {firstName: parts[0]};
    JSUtil.ArrayUtil.remove(parts, parsed.firstName);

    if(parts.length > 1) {
        var emailPart = parts[parts.length - 1];
        parsed.email = emailPart.replace(/[<>]/g, '');
        JSUtil.ArrayUtil.remove(parts, emailPart);
    }

    parsed.lastName = parts.join(' ');

    return parsed;
};
