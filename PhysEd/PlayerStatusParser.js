PhysEd.PlayerStatusParser = class {
    constructor(dateSortedMessages){
        this.inPlayers = [];
        this.maybePlayers = [];
        this.outPlayers = [];
        this.unknownPlayers = [];

        const statusArrayByPersonGuid = {};
        dateSortedMessages.
            filter(m => !m.sentByScript).
            forEach(m => this._processMessage(m, statusArrayByPersonGuid));

        for(const personGuid in statusArrayByPersonGuid) {
            this[statusArrayByPersonGuid[personGuid]].push(GASton.Database.findBy(PhysEd.Person, 'guid', personGuid));
        }
    }

    _getPersonGuid = function(message){
        var fromParts = message.fromParts;
        const person = GASton.Database.hydrate(PhysEd.Person).find(person =>
            person.email === fromParts.email ||
                (person.firstName === fromParts.firstName && person.lastName === fromParts.lastName) ||
                JSUtil.StringUtil.splitPossiblyEmpty(person.alternateNames).some(name => name === fromParts.email || name === fromParts.firstName + ' ' + fromParts.lastName)
        ) || new PhysEd.Person(fromParts.email, fromParts.firstName, fromParts.lastName);
        return person.guid;
    }

    _processMessage(message, statusArrayByPersonGuid) {
        const newStatusArray = message.words.reduce((playerStatusArray, word, index, words) => {
            let statusArray;
            if (/^in\W*$/i.test(word)) {
                statusArray = 'inPlayers';
            } else if (/^(maybe|50\W?50)\W*$/i.test(word)) {
                statusArray = 'maybePlayers';
            } else if (/^out\W*$/i.test(word)) {
                statusArray = 'outPlayers';
            } else {
                return playerStatusArray;
            }

            let isPhraseForOtherPlayer;
            words.slice(0, index).reverse().some(wordInPhrase => {
                if(/[.!?;]$/.test(wordInPhrase)){
                    return true;
                }

                const possibleOtherPlayerName = JSUtil.StringUtil.capitalize(wordInPhrase.replace(/,$/, '').toLowerCase());
                const otherPlayer = GASton.Database.hydrate(PhysEd.Person).find(p => [p.firstName, p.lastName].includes(possibleOtherPlayerName));
                if(otherPlayer) {
                    isPhraseForOtherPlayer = true;
                    statusArrayByPersonGuid[otherPlayer.guid] = statusArray;
                }
            });

            return playerStatusArray || (!isPhraseForOtherPlayer && statusArray);
        }, null);

        const personGuid = this._getPersonGuid(message);
        statusArrayByPersonGuid[personGuid] = newStatusArray || statusArrayByPersonGuid[personGuid] || 'unknownPlayers';
    };
};
