PeoplePopulator = function(){};

PeoplePopulator.prototype.populateFromGroup = function(groupEmail){
    var sports = Database.hydrateAll(Sport);
    var knownEmails = this._getKnownEmails();

    var users = GroupsApp.getGroupByEmail(groupEmail).getUsers();
    for(var i = 0; i < users.length; i++){
        var email = users[i].getEmail();
        if(!ArrayUtil.contains(knownEmails, email)){
            var person = new Person(email);
            Database.persist(Person, person);

            for(var j = 0; j < sports.length; j++){
                Database.persist(PersonSport, person.getPersonSport(sports[j]));
            }
        }
    }
};

PeoplePopulator.prototype._getKnownEmails = function(){
    var people = Database.hydrateAll(Person);
    var peopleEmails = [];
    for(var i = 0; i < people.length; i++){
        peopleEmails.push(people[i].email);
    }
    return peopleEmails;
};