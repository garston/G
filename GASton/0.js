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
        REPLY_ALL: 'REPLY ALL',
        SEND: 'SEND EMAIL'
    }
};

GASton.checkProdMode = function(){ return true; };
