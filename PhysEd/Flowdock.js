PhysEd.Flowdock = class {
    constructor(apiToken, flow){
        this._headers = {headers: {Authorization: ' Basic ' + Utilities.base64Encode(apiToken + ':')}};
        this._flowUrl = 'https://api.flowdock.com/flows/' + flow;;
    }

    static messageStart() {
        return SpreadsheetApp.getActiveSpreadsheet().getName() + ' - ';
    }

    fetchMessages() {
        return this._get(this._flowUrl + '/messages?event=message&limit=100');
    }

    fetchUsers() {
        return this._get(this._flowUrl + '/users');
    }

    isSentByScript(message) {
        this._userId = this._userId || this._get('https://api.flowdock.com/user').id;
        return +message.user === this._userId && message.content.startsWith(PhysEd.Flowdock.messageStart());
    }

    sendMessage(content, threadId) {
        GASton.Url.post(this._flowUrl + '/messages', {
            ...this._headers,
            payload: {
                content: PhysEd.Flowdock.messageStart() + content,
                event: 'message',
                thread_id: threadId
            }
        });
    }

    _get(url) {
        return JSON.parse(UrlFetchApp.fetch(url, this._headers));
    }
};
