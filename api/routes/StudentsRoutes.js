'use strict';
module.exports = function(app) {
    //Get a reference to the StudentsController, as a variable called studentsController.
    //we need this so we can talk to the StudentsController below (i.e. make method calls to it).
    var studentsController = require('../controllers/StudentsController');

    //When a HTTP GET request is sent to <website.com>/students, go to the StudentsController,
    //and run the getStudents() method. This will get a list of all students from the database.
    //When a HTTP POST request is sent to <website.com>/students, go to the StudentsController,
    //and run the insertStudents() method. This will insert a new student into the database.
    //The details for the new student will be contained in the body of the HTTP POST request, in JSON format.
    app.route('/students')
        .get(studentsController.getStudents)
        .post(studentsController.insertStudent);

    //When a HTTP GET request is sent to <website.com>/students/<studentid>, go to the StudentsController,
    //and run the getStudent() method. The method will be passed whatever is provided for <studentid> in the URL,
    //to fetch the record for the student from the database with an id of <studentid>
    app.route('/students/:studentid')
        .get(studentsController.getStudent)
        .delete(studentsController.deleteStudent);

};