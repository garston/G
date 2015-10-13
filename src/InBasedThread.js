PhysEd.InBasedThread = function(thread){
    this.thread = thread;
    this.mailingListEmail = thread.getMessages()[0].getReplyTo();
    this.sportName = thread.getFirstMessageSubject().replace(/ [a-z]+[!]*$/i, '').replace(/^Full Court$/, 'Basketball');
    this.playerStatusParser = new PhysEd.PlayerStatusParser(thread);
};

PhysEd.InBasedThread.sendInitialEmails = function(sport){
    var subject = (sport.name === 'Basketball' ? 'Full Court Friday' : sport.name + ' Tomorrow') + this._generateRandomExclamations();
    GASton.Database.hydrateAllBy(PhysEd.SportMailingList, ['sportGuid', sport.guid]).forEach(function(sportMailingList) {
        GASton.MailSender.sendToList(subject, '', GASton.Database.hydrate(PhysEd.MailingList, sportMailingList.mailingListGuid).email);
    });
};

PhysEd.InBasedThread.prototype.sendPlayerCountEmail = function(additionalPlayerStatusParser) {
    GASton.MailSender.replyAll(this.thread, JSUtil.ArrayUtil.compact([
        this._toPlayerNames('inPlayers', 'In', additionalPlayerStatusParser),
        this._toPlayerNames('maybePlayers', 'Maybe', additionalPlayerStatusParser),
        this._toPlayerNames('outPlayers', 'Out', additionalPlayerStatusParser),
        this._toPlayerNames('unknownPlayers', 'Unknown', additionalPlayerStatusParser)
    ]).join('<br/>'), this.mailingListEmail);
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
