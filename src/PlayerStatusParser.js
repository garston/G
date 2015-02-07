PlayerStatusParser = function(thread){
    this.players = {};

    var replyMessages = ArrayUtil.filter(thread.getMessages(), function(message){
        return message.getFrom().indexOf(CONST.PHYS_ED_NAME) === -1;
    });
    ArrayUtil.forEach(replyMessages, function(message){
        var fromParts = this._parseFromString(message.getFrom());

        var person = Database.hydrateBy(Person, ['email', fromParts.email]) || new Person(fromParts.email);
        if(!person.firstName || !person.lastName){
            person.firstName = fromParts.firstName;
            person.lastName = fromParts.lastName;
            Database.persist(Person, person);
        }

        var inStatus = this._getInStatus(message);
        this.players[inStatus] = this.players[inStatus] || [];
        this.players[inStatus].push(person);

        if(inStatus === PlayerStatusParser.STATUSES.OUT) {
            this.players[PlayerStatusParser.STATUSES.IN] = ArrayUtil.filter(this.getInPlayers(), function(player) {
                return player.guid !== person.guid;
            });
        }
    }, this);
};

PlayerStatusParser.STATUSES = {
    IN: 'In',
    OUT: 'Out',
    UNKNOWN: 'Unknown'
};

PlayerStatusParser.prototype.getInPlayers = function() {
    return this.players[PlayerStatusParser.STATUSES.IN] || [];
};

PlayerStatusParser.prototype._getInStatus = function(message){
    var words = ArrayUtil.reduce(message.getPlainBody().split('\n'), function(allWords, line) {
        return line[0] === '>' ? allWords : allWords.concat(ArrayUtil.compact(line.trim().split(' ')));
    }, []);
    return words.length === 0 ? PlayerStatusParser.STATUSES.IN : ArrayUtil.reduce(words, function(status, word){
        if(status) {
            return status;
        } else if (/^(in|yes|yep|yea|yeah|yay)\W*$/i.test(word)) {
            return PlayerStatusParser.STATUSES.IN;
        } else if (/^out\W*$/i.test(word)) {
            return PlayerStatusParser.STATUSES.OUT;
        }
    }, undefined) || PlayerStatusParser.STATUSES.UNKNOWN;
};

PlayerStatusParser.prototype._parseFromString = function(fromString){
    var parts = fromString.split(' ');
    return {
        firstName: parts[0],
        lastName: parts[1],
        email: parts[2] && parts[2].replace(/[<>]/g, '')
    };
};
