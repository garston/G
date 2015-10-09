PhysEd.InBasedThread = function(thread){
    this.thread = thread;
    this.playerStatusParser = new PhysEd.PlayerStatusParser(thread);

    this.sportName = this.thread.getFirstMessageSubject().replace(/ [a-z]+[!]*$/i, '');
    if(this.sportName === PhysEd.InBasedThread.BASKETBALL_PRETTY_NAME) {
        this.sportName = PhysEd.InBasedThread.BASKETBALL_STORED_NAME;
    }
};

PhysEd.InBasedThread.BASKETBALL_PRETTY_NAME = 'Full Court';
PhysEd.InBasedThread.BASKETBALL_STORED_NAME = 'Basketball';

PhysEd.InBasedThread.sendInitialEmail = function(sportName, dayWord, email){
    GASton.MailSender.sendToList(sportName + ' ' + dayWord + this._generateRandomExclamations(), '', email);
};

PhysEd.InBasedThread.prototype.sendPlayerCountEmail = function(additionalPlayerStatusParser) {
    GASton.MailSender.replyAll(this.thread, JSUtil.ArrayUtil.compact([
        this._toPlayerNames('inPlayers', 'In', additionalPlayerStatusParser),
        this._toPlayerNames('maybePlayers', 'Maybe', additionalPlayerStatusParser),
        this._toPlayerNames('outPlayers', 'Out', additionalPlayerStatusParser),
        this._toPlayerNames('unknownPlayers', 'Unknown', additionalPlayerStatusParser)
    ]).join('<br/>'), this.thread.getMessages()[0].getReplyTo());
};

PhysEd.InBasedThread._generateRandomExclamations = function(){
    var maxExclamations = 5;
    var num = Math.floor(Math.random() * (maxExclamations + 1));
    return JSUtil.ArrayUtil.range(num).reduce(function(str){ return str + '!'; }, '');
};

PhysEd.InBasedThread.prototype._toPlayerNames = function(playerStatusParserCategoryName, categoryDisplayString, additionalPlayerStatusParser) {
    var players = JSUtil.ArrayUtil.compact([this.playerStatusParser, additionalPlayerStatusParser]).reduce(function(players, playerStatusParser){
        return players.concat(playerStatusParser[playerStatusParserCategoryName]);
    }, []);
    if(players.length){
        var playerStrings = JSUtil.ArrayUtil.unique(players.map(PhysEd.Transformers.personToDisplayString));
        return categoryDisplayString + ' (' + playerStrings.length + '): ' + playerStrings.join(', ');
    }
};
