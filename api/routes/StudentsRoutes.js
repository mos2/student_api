'use strict';
module.exports = function(app) {
    var studentsController = require('../controllers/StudentsController');

    app.route('/students')
        .get(studentsController.getStudents)
        .post(studentsController.insertStudent);

    app.route('/students/:studentid')
        .get(studentsController.getStudent);

};