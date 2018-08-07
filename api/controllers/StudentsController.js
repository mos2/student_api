'use strict'

//Get a reference to nano, an npm library for working with CouchDB. Store it in the variable
//called nano. We need to tell it where CouchDB is running. On our local laptops, this should be
//http://localhost:5984 by default.
var nano = require('nano')(process.env.CLOUDANT_CONNECTION);
//Get a reference to the database in CouchDB called students, and store it in a variable called students.
// All calls we need to make to the students database should now go through this variable.
var students = nano.use('students');
var parents = nano.use('parents');

//Each function below talks to our students Database in CouchDB, and will either retrieve information
//about students, or insert/update information in the database about students.

//Each function takes two paramaters as input: one called request, and another called response.
//request is the HTTP request object sent to the API server from a client.
//response is the HTTP response object that the server will send back to the client that made the request.

//We can read information from the request object about what information the client is requesting from the server.
//We will write the information that the client is looking for into the response objects,
//before the server returns them to the client.

//Export a new function called getStudents. This will return a list of all students
//in the database when called.
exports.getStudents = function(request, response) {
    //Specify some paramaters to query the students database with in a JSON object.
    //include_docs set to true will force CouchDB to give back the entire student record (by default it does not do this).
    //limit set to 10 will return a maxiumum of 10 student records.
    //descending set to true will return the student records in a descending order from highest id, to lowest id.
    var params  = {include_docs: true, descending: true}

    //Call the nano list function on the students database to get the list of all student records, passing the params we specified.
    students.list(params, function(error, body) {
        //We are now inside an anonymous callback function. An anonymous function is a function with no name.
        //It is known here as a callback function because it is the function that is called when nano is ready to "call us back"
        //with the results of the query (in this case, the list of students).

        //These callback functions receive two paramaters as input: error, and body.
        //error will contain the error from Nano if there was one, otherwise it will be empty/null.
        //body will contain the Database results of the query.
        //Any actions we want to take when the results are ready are written here.
        //First, check that there was no error when running the query...
        if (!error) {
            ///...and if there were no errors, loop over each row in the result of the query (remember, result is contained in body).
            //In this case, we asked Nano for a list of students, so there is more than one result. Hence, why we have rows, where each row is a student record.
            body.rows.forEach(function(student) {
                //In this anonymous function, each result row is assigned to the variable called student.
                //On each run of the loop, we just print out the student data contained in the row to the console.
                console.log(student);
            });
            //Finally, use the response object to send the list of students (remember, contained in body) to the client.
            //This sends back a HTTP 200 OK status as well by default, no need to specify it.
            response.send(body)
        }
        else {
            //... or if there was an error (error is not empty), just print it out on the console as an error message.
            console.error("An error occurred while fetching the list of students from the database: " + error);
            //Send the client back a HTTP 500 Internal Server Error Status, and give them a friendly message that something went wrong...
            response.status(500).send("Sorry, something went wrong while getting the list of students, " +
                "try again later!");
        }
    });
};

//Export a new function called getStudent. This will return the record of a single student
//who has an id of <studentid> (found from request.params.studentid).
exports.getStudent = function(request, response) {
    var studentPromise = getStudentFromDatabase(request.params.studentid);
    studentPromise.then(function(student) {
        var parent_ids = student.parents;
        var parents_list = [];
        console.log(parent_ids);
        var parentPromise = getParentsFromDatabase(parent_ids);
        parentPromise.then(function(parents) {
            parents.rows.forEach(function(parent, index) {
                console.log(parent);
                parents_list.push({"firstname": parent.doc.firstname, "surname": parent.doc.surname, "email": parent.doc.email, "phone": parent.doc.phone});
            });
            console.log(parents_list);
            var studentResponse = {"firstName": student.firstname, "surname": student.surname, "dob": student.dob,   "parents": parents_list};
            response.send(studentResponse);
        }, function(error) {
            console.error("Error retrieving parent from database: " + error);
        })
    }, function(error) {
        console.error("Error retrieving student from database: " + error);
    });
};

var getStudentFromDatabase = function(student_id) {

    //Call the nano get function, which will fetch a single record from the database, by using the id of the record.
    //Here, we get the studentid that the client sent us from the paramaters of the request object.
    return new Promise(function(resolve, reject) {
        students.get(student_id, function(error, student) {
            if (!error) {
                resolve(student)
            } else {
                reject(error);
            }
        });
    });
};

var getParentsFromDatabase = function(parent_ids) {

    //Call the nano get function, which will fetch a single record from the database, by using the id of the record.
    //Here, we get the studentid that the client sent us from the paramaters of the request object.
    return new Promise(function(resolve, reject) {
        parents.fetch({keys: parent_ids}, function(error, parents) {
            if (!error) {
                console.log("Parents in here are: " + parents);
                resolve(parents)
            } else {
                reject(error);
            }
        });
    });
};

// students.get(request.params.studentid, function(error, student) {
//     //In this anonymous callback function, the result from the database is just a body containing one student record,
//     //not rows of multiple records. So we can just use the result as it is without having to loop over it.
//     if (!error) {
//         //Print all the student's details to the Console.
//         console.log(student);
//         var parent_ids = student.parents;
//         var parents_list = [];
//         console.log(parent_ids);
//         parent_ids.forEach(function(item, index) {
//             console.log(item + " " + index)
//             parents.get(item, function(error, parent) {
//                 parents_list.push(parent);
//                 console.log("Parents list now: " + parents_list);
//             })
//             response.send(student)
//         });
//         console.log("Parents list here: " + parents_list);
//         //Use the response object to send the student record back to the client.
//     }
//     else {
//         console.error("An error occurred while fetching student with ID " + request.params.studentid + ": "
//             + error);
//         response.status(404).send("Sorry, something went wrong while trying to fetch the student you requested, " +
//             "try again later!");
//     }
// });

//Export a new function called insertStudent. This will insert a new student record into the database.
exports.insertStudent = function(request, response) {
    //Call the nano insert function, which will insert a new student record, formatted as a JSON document, into the database.
    //The student record is contained in the body of the request object.
    students.insert(request.body, function (error, body) {
        if (!error) {
            //If no errors, just print out the result of the insertion to the console (contained in the body variable).
            console.log(body);
            //Also send the result of the insertion back to the client for now (may not be a good idea...).
            response.send(body)
        }
        else {
            console.error("An error occurred while trying to insert the student: " + error);
            response.status(500).send("Sorry, something went wrong while trying to insert the new student, " +
                "try again later!");
        }
    });
};

exports.deleteStudent = function(request, response) {
    students.get(request.params.studentid, function(error, student) {
        if (!error) {
            students.destroy(student._id, student._rev, function(error, body) {
                if (!error) {
                    console.log(body);
                    response.send(body)
                }
                else {
                    console.error("An error occurred while trying to delete the student with ID : "
                        + request.params.studentid + ": " + error);
                    response.status(500).send("Sorry, something went wrong while trying to delete the student, " +
                        "try again later!");
                }
            });
        }
        else {
            console.error("An error occurred while trying to find student to delete, with ID " +
                request.params.studentid + ": " + error);
            response.status(500).send("Sorry, something went wrong while trying to delete the student, " +
                "try again later!");
        }
    });
};