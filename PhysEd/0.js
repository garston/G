PhysEd = {};

function notifyGameTomorrow(){
    new PhysEd.GamePreparer().notifyGameTomorrow();
}

function checkGameStatus(){
    new PhysEd.GamePreparer().sendPlayerCounts();
}

function persistSides(){
    new PhysEd.GamePreparer().persistSides();
}

function recordGames(){
    var sides = GASton.Database.hydrate(PhysEd.Side);
    if(sides.length >= 2){
        var side1 = sides[0];
        var side2 = sides[1];
        if(side1.score !== '' && side2.score !== ''){
            PhysEd.GameRecorder.record(side1, side2);
        }
    }
}

function createPerson(){
    new PhysEd.Person('email@test.com', 'first', 'last');
}
