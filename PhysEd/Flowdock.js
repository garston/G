PhysEd.Flowdock = function(apiToken, flow){
    this._header = {Authorization : ' Basic ' + Utilities.base64Encode(apiToken + ':')};
    this._flowUrl = 'https://api.flowdock.com/flows/' + flow;;
};

PhysEd.Flowdock.MESSAGE_START = SpreadsheetApp.getActiveSpreadsheet().getName() + ' - @team\n';

PhysEd.Flowdock.prototype.fetchMessages = function(){
    return this._request(this._flowUrl + '/messages?event=message&limit=100');
};

PhysEd.Flowdock.prototype.fetchUsers = function(){
    return this._request(this._flowUrl + '/users');
};

PhysEd.Flowdock.prototype.isSentByScript = function(message){
    this._userId = this._userId || this._request('https://api.flowdock.com/user').id;
    return +message.user === this._userId && JSUtil.StringUtil.startsWith(message.content, PhysEd.Flowdock.MESSAGE_START);
};

PhysEd.Flowdock.prototype.sendMessage = function (content, threadId) {
    content = PhysEd.Flowdock.MESSAGE_START + content;
    GASton.checkProdMode('SEND FD MESSAGE\nFlow: %s\nThread Id: %s\nContent: %s', [this._flowUrl, threadId, content]) &&
        this._request(this._flowUrl + '/messages', {
            method: 'post',
            payload: {
                content: content,
                event: 'message',
                thread_id: threadId
            }
        });
};

PhysEd.Flowdock.prototype._request = function (url, params) {
    params = params || {};
    params.headers = this._header;
    return JSON.parse(UrlFetchApp.fetch(url, params));
};
