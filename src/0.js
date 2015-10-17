PhysEd = {};

function notifyGameTomorrow(){
    new PhysEd.GamePreparer().notifyGameTomorrow();
}

function checkGameStatus(){
    new PhysEd.GamePreparer().checkGameStatus();
}

function earlyWarnGameStatus(){
    new PhysEd.GamePreparer().sendEarlyWarning();
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
