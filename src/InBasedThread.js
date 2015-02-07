InBasedThread = function(thread){
    this.thread = thread;
    this.playerStatusParser = new PlayerStatusParser(thread);

    this.sportName = this.thread.getFirstMessageSubject().replace(/ [a-z]+[!]*$/i, '');
    if(this.sportName === InBasedThread.BASKETBALL_PRETTY_NAME) {
        this.sportName = InBasedThread.BASKETBALL_STORED_NAME;
    }
};

InBasedThread.BASKETBALL_PRETTY_NAME = 'Full Court';
InBasedThread.BASKETBALL_STORED_NAME = 'Basketball';

InBasedThread.sendInitialEmail = function(sportName, dayWord, email){
    MailSender.send(sportName + ' ' + dayWord + this._generateRandomExclamations(), '', email);
};

InBasedThread.prototype.getSport = function() {
    return Database.hydrateBy(Sport, ['name', this.sportName]);
};

InBasedThread.prototype.sendPlayerCountEmail = function() {
    MailSender.replyAll(this.thread, ArrayUtil.compact([
        this._toPlayerNames(this.playerStatusParser.inPlayers, 'In'),
        this._toPlayerNames(this.playerStatusParser.outPlayers, 'Out'),
        this._toPlayerNames(this.playerStatusParser.unknownPlayers, 'Unknown')
    ]).join('<br/>'), this.thread.getMessages()[0].getReplyTo());
};

InBasedThread._generateRandomExclamations = function(){
    var maxExclamations = 5;
    var num = Math.floor(Math.random() * (maxExclamations + 1));
    return ArrayUtil.reduce(ArrayUtil.range(num), function(str){
        return str + '!';
    }, '');
};

InBasedThread.prototype._toPlayerNames = function(players, categoryName) {
    if(players.length){
        var playerStrings = ArrayUtil.unique(ArrayUtil.map(players, Transformers.personToDisplayString));
        return categoryName + ' (' + playerStrings.length + '): ' + playerStrings.join(', ');
    }
};
