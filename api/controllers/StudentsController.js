'use strict'

var nano = require('nano')('http://localhost:5984');
var students = nano.use('students');

exports.getStudents = function(request, response) {
    var params  = {include_docs: true, limit: 10, descending: true}
    students.list(params, function(error, body) {
        if (!error) {
            body.rows.forEach(function(student) {
                console.log(student);
            });
            response.send(body)
        }
    });
};

exports.getStudent = function(request, response) {
    students.get(request.params.studentid, function(error, student) {
        if (!error) {
            console.log(student);
        }
        response.send(student)
    });
};

exports.insertStudent = function(request, response) {
    students.insert(request.body, function(error, body) {
        if (!error) {
            console.log(body);
        }
        response.send(body)
    });
};