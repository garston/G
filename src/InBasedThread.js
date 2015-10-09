PhysEd.InBasedThread = function(thread){
    this.thread = thread;
    this.mailingListEmail = thread.getMessages()[0].getReplyTo();
    this.sportName = PhysEd.InBasedThread._translateSportNameToStoredName(thread.getFirstMessageSubject().replace(/ [a-z]+[!]*$/i, ''));
    this.playerStatusParser = new PhysEd.PlayerStatusParser(thread);
};

PhysEd.InBasedThread.BASKETBALL_PRETTY_NAME = 'Full Court';
PhysEd.InBasedThread.BASKETBALL_STORED_NAME = 'Basketball';

PhysEd.InBasedThread.sendInitialEmails = function(sportName, dayWord){
    var sportMailingLists = GASton.Database.hydrateAllBy(PhysEd.SportMailingList, ['sportGuid', PhysEd.Sport.hydrateByName(this._translateSportNameToStoredName(sportName)).guid]);
    sportMailingLists.forEach(function(sportMailingList) {
        GASton.MailSender.sendToList(sportName + ' ' + dayWord + this._generateRandomExclamations(), '', GASton.Database.hydrate(PhysEd.MailingList, sportMailingList.mailingListGuid).email);
    }, this);
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

PhysEd.InBasedThread._translateSportNameToStoredName = function(sportName) {
    return sportName === PhysEd.InBasedThread.BASKETBALL_PRETTY_NAME ? PhysEd.InBasedThread.BASKETBALL_STORED_NAME : sportName;
};
