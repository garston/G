GASton = {};
GASton.UPDATE_TYPES = {
    DB: {
        CLEAR: 'CLEAR',
        DELETE: 'DELETE',
        INSERT: 'INSERT',
        UPDATE: 'UPDATE'
    },
    MAIL: {
        ADD_LABEL: 'ADD LABEL',
        MARK_READ: 'MARK READ',
        MOVE_TO_TRASH: 'MOVE TO TRASH',
        REPLY: 'REPLY',
        REPLY_ALL: 'REPLY ALL',
        SEND: 'SEND EMAIL'
    },
    URL: {
        FETCH: 'URL FETCH'
    }
};

GASton.checkProdMode = function(){ return true; };

function emailLog() {
    const log = GASton.Database.hydrate(GASton.ExecutionLog);
    if(log.length){
        GASton.Mail.sendNewEmail(
            Session.getActiveUser().getEmail(),
            SpreadsheetApp.getActiveSpreadsheet().getName(),
            log.map(l => `${JSUtil.DateUtil.timeString(new Date(l.createdAt))} ${l.params}`).join('<br/>')
        );
        GASton.Database.clear(GASton.ExecutionLog);
    }
}
