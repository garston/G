InBasedThread = function(thread){
    this.thread = thread;

    this.sportName = this.thread.getFirstMessageSubject().replace(/ [a-z]+[!]*$/i, '');
    if(this.sportName === InBasedThread.BASKETBALL_PRETTY_NAME) {
        this.sportName = InBasedThread.BASKETBALL_STORED_NAME;
    }

    this._parsePlayers();
};

InBasedThread.BASKETBALL_PRETTY_NAME = 'Full Court';
InBasedThread.BASKETBALL_STORED_NAME = 'Basketball';

InBasedThread.STATUSES = {
    IN: 'In',
    OUT: 'Out',
    UNKNOWN: 'Unknown'
};

InBasedThread.sendInitialEmail = function(sportName, dayWord, email){
    MailSender.send(sportName + ' ' + dayWord + this._generateRandomExclamations(), '', email);
};

InBasedThread.prototype.getInPlayers = function() {
    return this.players[InBasedThread.STATUSES.IN] || [];
};

InBasedThread.prototype.getSport = function() {
    return Database.hydrateBy(Sport, ['name', this.sportName]);
};

InBasedThread.prototype.sendPlayerCountEmail = function() {
    MailSender.replyAll(this.thread, ArrayUtil.compact([
        this._toPlayerNames(InBasedThread.STATUSES.IN),
        this._toPlayerNames(InBasedThread.STATUSES.OUT),
        this._toPlayerNames(InBasedThread.STATUSES.UNKNOWN)
    ]).join('<br/>'), this.thread.getMessages()[0].getReplyTo());
};

InBasedThread._generateRandomExclamations = function(){
    var maxExclamations = 5;
    var num = Math.floor(Math.random() * (maxExclamations + 1));
    return ArrayUtil.reduce(ArrayUtil.range(num), function(str){
        return str + '!';
    }, '');
};

InBasedThread.prototype._getInStatus = function(message){
    var firstLine = message.getPlainBody().split('\n')[0].trim();
    if(!firstLine) {
        return InBasedThread.STATUSES.IN;
    }

    var words = firstLine.split(' ');
    return ArrayUtil.reduce(words, function(status, word){
        if(status) {
            return status;
        } else if (/^(in|yes|yep|yea|yeah|yay)\W*$/i.test(word)) {
            return InBasedThread.STATUSES.IN;
        } else if (/^out\W*$/i.test(word)) {
            return InBasedThread.STATUSES.OUT;
        }
    }, undefined) || InBasedThread.STATUSES.UNKNOWN;
};

InBasedThread.prototype._parseFromString = function(fromString){
    var parts = fromString.split(' ');
    return {
        firstName: parts[0],
        lastName: parts[1],
        email: parts[2] && parts[2].replace(/[<>]/g, '')
    };
};

InBasedThread.prototype._parsePlayers = function() {
    this.players = {};
    var replyMessages = ArrayUtil.filter(this.thread.getMessages(), function(message){
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

        if(inStatus === InBasedThread.STATUSES.OUT) {
            this.players[InBasedThread.STATUSES.IN] = ArrayUtil.filter(this.getInPlayers(), function(player) {
                return player.guid !== person.guid;
            });
        }
    }, this);
};

InBasedThread.prototype._toPlayerNames = function(categoryName) {
    if(this.players[categoryName]){
        var playerStrings  = ArrayUtil.unique(ArrayUtil.map(this.players[categoryName], Transformers.personToDisplayString));
        return categoryName + ' (' + playerStrings.length + '): ' + playerStrings.join(', ');
    }
};
