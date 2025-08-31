PhysEd.Flowdock = function(apiToken, flow){
    this._headers = {headers: {Authorization: ' Basic ' + Utilities.base64Encode(apiToken + ':')}};
    this._flowUrl = 'https://api.flowdock.com/flows/' + flow;;
};

PhysEd.Flowdock.messageStart = () => SpreadsheetApp.getActiveSpreadsheet().getName() + ' - ';

PhysEd.Flowdock.prototype.fetchMessages = function(){
    return this._get(this._flowUrl + '/messages?event=message&limit=100');
};

PhysEd.Flowdock.prototype.fetchUsers = function(){
    return this._get(this._flowUrl + '/users');
};

PhysEd.Flowdock.prototype.isSentByScript = function(message){
    this._userId = this._userId || this._get('https://api.flowdock.com/user').id;
    return +message.user === this._userId && message.content.startsWith(PhysEd.Flowdock.messageStart());
};

PhysEd.Flowdock.prototype.sendMessage = function (content, threadId) {
    GASton.Url.post(this._flowUrl + '/messages', {
        ...this._headers,
        payload: {
            content: PhysEd.Flowdock.messageStart() + content,
            event: 'message',
            thread_id: threadId
        }
    });
};

PhysEd.Flowdock.prototype._get = function (url) { return JSON.parse(UrlFetchApp.fetch(url, this._headers)); };
