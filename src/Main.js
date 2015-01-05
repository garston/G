function notifyPhysEd() {
    new PhysEd().notifyPhysEd();
}

function notifyFullCourtFriday(){
    InBasedThread.sendInitialEmail(InBasedThread.BASKETBALL_PRETTY_NAME, 'Friday', CONST.PHYS_ED_EMAIL);
}

function notifyVolleyball(){
    InBasedThread.sendInitialEmail('Volleyball', 'Tomorrow', CONST.VOLLEYBALL_EMAIL);
}

function checkGameStatus(){
    var threads = GmailApp.search('-subject:re: from:' + CONST.PHYS_ED_NAME + ' -to:' + CONST.PHYS_ED_STATS_EMAIL, 0, 1);
    if(threads.length === 0){
        return;
    }

    var inBasedThread = new InBasedThread(threads[0]);
    if(inBasedThread.isForToday()){
        new BeforeGameHandler().checkGameStatus(inBasedThread);
    }
}

function recordGames(){
    var sides = Database.hydrateAll(Side);
    if(sides.length >= 2){
        var side1 = sides[0];
        var side2 = sides[1];
        if(side1.score !== '' && side2.score !== ''){
            new GameRecorder().record(side1, side2);
        }
    }
}
