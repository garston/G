PhysEd = {};

function notifyPhysEd() {
    new PhysEd.PhysEdNotifier().notifyPhysEd();
}

function notifyFullCourtFriday(){
    PhysEd.InBasedThread.sendInitialEmail(PhysEd.InBasedThread.BASKETBALL_PRETTY_NAME, 'Friday', PhysEd.Const.PHYS_ED_EMAIL);
}

function notifyVolleyball(){
    PhysEd.InBasedThread.sendInitialEmail('Volleyball', 'Tomorrow', PhysEd.Const.VOLLEYBALL_EMAIL);
}

function checkGameStatus(){
    new PhysEd.TodayGameService().checkGameStatus();
}

function earlyWarnGameStatus(){
    new PhysEd.TodayGameService().sendEarlyWarning();
}

function recordGames(){
    var sides = Database.hydrateAll(PhysEd.Side);
    if(sides.length >= 2){
        var side1 = sides[0];
        var side2 = sides[1];
        if(side1.score !== '' && side2.score !== ''){
            new PhysEd.GameRecorder().record(side1, side2);
        }
    }
}

function createPerson(){
    Database.persist(PhysEd.Person, new PhysEd.Person('email@test.com', 'first', 'last'));
}
