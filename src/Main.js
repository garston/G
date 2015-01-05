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
    new TodayGameService().checkGameStatus();
}

function earlyWarnGameStatus(){
    new TodayGameService().sendEarlyWarning();
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
