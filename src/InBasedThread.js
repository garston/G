InBasedThread = function(thread){
    this.thread = thread;
    this._parseInitialEmail();
    this._parsePlayers();
};

InBasedThread.BASKETBALL_PRETTY_NAME = 'Full Court';
InBasedThread.BASKETBALL_STORED_NAME = 'Basketball';

InBasedThread.STATUSES = {
    IN: 'In',
    OUT: 'Out',
    UNKNOWN: 'Unknown'
};

InBasedThread.prototype.getInPlayers = function() {
    return this.players[InBasedThread.STATUSES.IN] || [];
};

InBasedThread.prototype.isForToday = function(){
    return this.metadata.date === DateUtil.prettyDate(new Date());
};

InBasedThread.sendInitialEmail = function(sportName, dayWord, email){
    MailSender.send(sportName + ' ' + dayWord + this._generateRandomExclamations(), '', email);
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
    if(ArrayUtil.any(words, function(word){ return /^(in|yes|yep|yea|yeah|yay)\W*$/i.test(word); })){
        return InBasedThread.STATUSES.IN;
    }else if(ArrayUtil.any(words, function(word){ return /^out\W*$/i.test(word); })){
        return InBasedThread.STATUSES.OUT
    }
    return InBasedThread.STATUSES.UNKNOWN;
};

InBasedThread.prototype._parseFromString = function(fromString){
    var parts = fromString.split(' ');
    return {
        firstName: parts[0],
        lastName: parts[1],
        email: parts[2] && parts[2].replace(/[<>]/g, '')
    };
};

InBasedThread.prototype._parseInitialEmail = function() {
    var sportName = this.thread.getFirstMessageSubject().replace(/ [a-z]+[!]*$/i, '');
    var initialMessage = this.thread.getMessages()[0];
    this.metadata = {
        date: DateUtil.prettyDate(DateUtil.addDays(1, initialMessage.getDate())),
        replyTo: initialMessage.getReplyTo(),
        sportName: sportName === InBasedThread.BASKETBALL_PRETTY_NAME ? InBasedThread.BASKETBALL_STORED_NAME : sportName
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
    }, this);
};
