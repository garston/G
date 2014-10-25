InBasedThread = function(thread){
    this.thread = thread;
};

InBasedThread.BASKETBALL_PRETTY_NAME = 'Full Court';
InBasedThread.BASKETBALL_STORED_NAME = 'Basketball';

InBasedThread.STATUSES = {
    IN: 'in',
    OUT: 'out'
};

InBasedThread.sendInitialEmail = function(sportName, dayWord, sport, email){
    MailSender.send(sportName + ' ' + dayWord + ExclamationUtil.generateRandom(), /*new Leaderboard().getLeaderboards(sport)*/ '', email);
};

InBasedThread.prototype.isForToday = function(){
    return this.parseInitialEmail().date === DateUtil.prettyDate(new Date());
};

InBasedThread.prototype.parseInitialEmail = function(){
    var sportName = this.thread.getFirstMessageSubject().replace(/ [a-z]+[!]*$/i, '');
    var initialMessage = this.thread.getMessages()[0];
    return {
        date: DateUtil.prettyDate(DateUtil.addDays(1, initialMessage.getDate())),
        replyTo: initialMessage.getReplyTo(),
        sportName: sportName === InBasedThread.BASKETBALL_PRETTY_NAME ? InBasedThread.BASKETBALL_STORED_NAME : sportName
    };
};

InBasedThread.prototype.parsePlayers = function(){
    var players = {
        ins: [],
        outs: [],
        plusOnes: [],
        unknowns: []
    };

    var messages = this.thread.getMessages();
    for(var i = 1; i < messages.length; i++){
        var message = messages[i];
        if(message.getFrom().indexOf(CONST.PHYS_ED_NAME) === -1){
            var inStatus = this._getInStatus(i);
            var fromParts = this._parseFromString(message.getFrom());

            var person = Database.hydrateBy(Person, ['email', fromParts.email]) || new Person(fromParts.email);
            if(!person.firstName || !person.lastName){
                person.firstName = fromParts.firstName;
                person.lastName = fromParts.lastName;
                Database.persist(Person, person);
            }

            if(inStatus === InBasedThread.STATUSES.IN){
                players.ins.push(person);
            }else if(inStatus === InBasedThread.STATUSES.OUT){
                for(var j = 0; j < players.ins.length; j++){
                    if(players.ins[j].email === fromParts.email){
                        ArrayUtil.remove(players.ins, players.ins[j]);
                        break;
                    }
                }

                players.outs.push(person);
            }else{
                players.unknowns.push(person);
            }
        }
    }

    return players;
};

InBasedThread.prototype._getInStatus = function(messageNum){
    var words = this._getMessageLines(messageNum)[0].split(' ');
    if(words.length === 0) {
        return InBasedThread.STATUSES.IN;
    }

    for(var j = 0; j < words.length; j++){
        var word = words[j].toLowerCase();
        if(/^(in|yes|yep|yea|yeah|yay)\W*$/.test(word)){
            return InBasedThread.STATUSES.IN;
        }else if (/^out\W*$/.test(word)){
            return InBasedThread.STATUSES.OUT;
        }
    }
};

InBasedThread.prototype._getMessageLines = function(messageNum){
    var lines = this.thread.getMessages()[messageNum].getPlainBody().split('\n');
    for(var i = 0; i < lines.length; i++){
        lines[i] = lines[i].trim();
    }
    return lines;
};

InBasedThread.prototype._parseFromString = function(fromString){
    var parts = fromString.split(' ');
    return {
        firstName: parts[0],
        lastName: parts[1],
        email: parts[2] && parts[2].replace(/[<>]/g, '')
    };
};
