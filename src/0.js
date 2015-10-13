PhysEd = {};

function notifyPhysEd() {
    PhysEd.PhysEdNotifier.notifyPhysEd();
}

function notifyFullCourtFriday(){
    PhysEd.InBasedThread.sendInitialEmails(PhysEd.InBasedThread.BASKETBALL_PRETTY_NAME, 'Friday');
}

function notifyVolleyball(){
    PhysEd.InBasedThread.sendInitialEmails('Volleyball', 'Tomorrow');
}

function checkGameStatus(){
    new PhysEd.TodayGameService().checkGameStatus();
}

function earlyWarnGameStatus(){
    new PhysEd.TodayGameService().sendEarlyWarning();
}

function recordGames(){
    var sides = GASton.Database.hydrateAll(PhysEd.Side);
    if(sides.length >= 2){
        var side1 = sides[0];
        var side2 = sides[1];
        if(side1.score !== '' && side2.score !== ''){
            new PhysEd.GameRecorder().record(side1, side2);
        }
    }
}

function createPerson(){
    GASton.Database.persist(PhysEd.Person, new PhysEd.Person('email@test.com', 'first', 'last'));
}
