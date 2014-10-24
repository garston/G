ExclamationUtil = {
    MAX_EXCLAMATIONS: 5,
    generateRandom: function(){
        var str = '';
        var num = Math.floor(Math.random() * (ExclamationUtil.MAX_EXCLAMATIONS + 1));
        for(var i = 0; i < num; i++){
            str += '!';
        }
        return str;
    }
};