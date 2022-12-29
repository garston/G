GASton = {};
GASton.UPDATE_TYPES = {
    DB: {
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
    }
};

GASton.checkProdMode = function(){ return true; };

function emailLog() {
    const log = GASton.Database.hydrate(GASton.ExecutionLog);
    if(!log.length){
        return;
    }

    GASton.Mail.sendNewEmail(Session.getActiveUser().getEmail(), SpreadsheetApp.getActiveSpreadsheet().getName(), log.map(l => `${JSUtil.DateUtil.timeString(new Date(l.createdAt))} ${l.params}`).join('<br/>'));
    log.slice(0).forEach(l => GASton.Database.remove(l));
}
