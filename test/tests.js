$(document).ready(function(){
    
    html5sql.logInfo = true;
    html5sql.logErrors = true;
    
    test("Create a global html5sql variable is created using the modular pattern containing all functions.", function() {
        expect(4);
        ok(html5sql, "Global html5sql exists" );
        ok(html5sql.openDatabase, "html5sql.openDatabse function exists");
        ok(html5sql.process, "html5sql.process function exists");
        ok(html5sql.changeVersion, "html5sql.changeVersion function exists");
    });
    
    test("OPEN DATABASE: When unexpected parameters are passed to the openDatabase function an error is returned", function(){
        raises(html5sql.openDatabase(123, 123, "string"), "An error is returned.")
    });    
    
    test("OPEN DATABASE: Successfully open the database and store it as html5sql.database", function() {
        html5sql.openDatabase("test", "Testing Database", 5*1024*1024);
        ok(html5sql.database, "Database was successfully created by calling html5sql.openDatabase with thie correct parameters");
    });
    
    test("PROCESS: a set of sql statement objects.", 8, function() {
        stop();
        html5sql.process(
            [
             {
                "sql": "CREATE TABLE sequenceTest (sequence  INTEGER PRIMARY KEY, label TEXT);",
                "data": [],
                "success": function(transaction, results){
                    ok(true, "Created sequence Testing Table")
                }
             },
             {
                "sql": "INSERT INTO sequenceTest (label) VALUES ('First');",
                "data": [],
                "success": function(transaction, results){
                    equal(1, results.insertId, "Inserted first record in sequence.");
                }
             },
             {
                "sql": "INSERT INTO sequenceTest (label) VALUES ('Second');",
                "data": [],
                "success": function(transaction, results){
                    equal(2, results.insertId, "Inserted second record in sequence.");
                }
             },
             {
                "sql": "INSERT INTO sequenceTest (label) VALUES ('Third');",
                "data": [],
                "success": function(transaction, results){
                    equal(3, results.insertId, "Inserted third record in sequence.");
                }
             },
             {
                "sql": "INSERT INTO sequenceTest (label) VALUES ('Fourth');",
                "data": [],
                "success": function(transaction, results){
                    equal(4, results.insertId, "Inserted fourth record in sequence.");
                }
             },
             {
                "sql": "INSERT INTO sequenceTest (label) VALUES ('Fifth');",
                "data": [],
                "success": function(transaction, results){
                    equal(5, results.insertId, "Inserted fifth record in sequence.");
                }
             },
             {
                "sql": "DROP TABLE sequenceTest;",
                "data": [],
                "success": function(transaction, results){
                    ok(true, "Droped Return Table after all records were inserted.")
                }
             }
            ],
            function(){
                ok(true, "Final Callback Executed" );
                start();
            },
            function(){
                throw new Error("Error Processing SQL");
            }
        );
    });
    
    test("PROCESS: ensure that an array returned by the success function of individual sql statement objects is used as the data for the next statement.", function(){
        stop();
        html5sql.process(
            [
             {
                "sql": "CREATE TABLE returnTest (sequence  INTEGER PRIMARY KEY, label TEXT);",
                "data": [],
                "success": function(transaction, results){
                    ok(true, "Created sequence Testing Table")
                    return ["Five"];
                }
             },
             {
                "sql": "INSERT INTO returnTest (label) VALUES (?);",
                "data": [],
                "success": function(transaction, results){
                    equal(1, results.insertId, "Inserted first record in sequence.");
                    return ["Four"];
                }
             },
             {
                "sql": "INSERT INTO returnTest (label) VALUES (?);",
                "data": [],
                "success": function(transaction, results){
                    equal(2, results.insertId, "Inserted second record in sequence.");
                    return ["Three"];
                }
             },
             {
                "sql": "INSERT INTO returnTest (label) VALUES (?);",
                "data": [],
                "success": function(transaction, results){
                    equal(3, results.insertId, "Inserted third record in sequence.");
                    return ["Two"];
                }
             },
             {
                "sql": "INSERT INTO returnTest (label) VALUES (?);",
                "data": [],
                "success": function(transaction, results){
                    equal(4, results.insertId, "Inserted fourth record in sequence.");
                    return ["One"];
                }
             },
             {
                "sql": "INSERT INTO returnTest (label) VALUES (?);",
                "data": [],
                "success": function(transaction, results){
                    equal(results.insertId, 5, "Inserted fifth record in sequence.");
                }
             },
             {
                "sql": "SELECT * FROM returnTest;",
                "data": [],
                "success": function(transaction, results){
                    equal(results.rows.item(0).label, "Five");
                    equal(results.rows.item(1).label, "Four");
                    equal(results.rows.item(2).label, "Three");
                    equal(results.rows.item(3).label, "Two");
                    equal(results.rows.item(4).label, "One");
                }
             },
             {
                "sql": "DROP TABLE returnTest;",
                "data": [],
                "success": function(transaction, results){
                    ok(true, "Droped Sequence Table after all records were inserted.");
                }
             }
            ],
            function(){
                ok(true, "Final Callback Executed" );
                start();
            },
            function(){
                throw new Error("Error Processing SQL");
            }
        );  
    });
    
    test("PROCESS: a set of sql statments in an array.", 1, function() {
        stop();
        html5sql.process(
            ["CREATE TABLE sequenceTest2 (sequence  INTEGER PRIMARY KEY, label TEXT);",
             "INSERT INTO sequenceTest2 (label) VALUES ('First');",
             "INSERT INTO sequenceTest2 (label) VALUES ('Second');",
             "INSERT INTO sequenceTest2 (label) VALUES ('Third');",
             "INSERT INTO sequenceTest2 (label) VALUES ('Fourth');",
             "INSERT INTO sequenceTest2 (label) VALUES ('Fifth');",
             "DROP TABLE sequenceTest2;"],
            function(){
                ok(true, "Final Callback Executed" );
                start();
            },
            function(){
                throw new Error("Error Processing SQL");
            }
        );
    });
    
    test("PROCESS: a set of sql statments combined within a single string.", 1, function() {
        stop();
        html5sql.process(
            "CREATE TABLE sequenceTest3 (sequence  INTEGER PRIMARY KEY, label TEXT);"+
            "INSERT INTO sequenceTest3 (label) VALUES ('First');"+
            "INSERT INTO sequenceTest3 (label) VALUES ('Second');"+
            "INSERT INTO sequenceTest3 (label) VALUES ('Third');"+
            "INSERT INTO sequenceTest3 (label) VALUES ('Fourth');"+
            "INSERT INTO sequenceTest3 (label) VALUES ('Fifth');"+
            "DROP TABLE sequenceTest3;",
            function(){
                ok(true, "Final Callback Executed" );
                start();
            },
            function(){
                throw new Error("Error Processing SQL");
            }
        );
    });
    
    test("PROCESS: a set of sql statments stored in a separate file",1,function(){
        stop();
        
        $.get('test-statements.sql',function(sql){
            html5sql.process(
                sql,
                function(){
                    ok(true, "Final Callback Executed");
                    start();
                },
                function(){
                    throw new Error("Error Processing SQL");
                }
            );
        });
    })
    
    test("PROCESS: a set of 10000 sql statments stored in a separate file",1,function(){
        stop();
        var startTime = new Date(), endTime, seconds;
        $.get('speed-test.sql',function(sql){
            html5sql.process(
                sql,
                function(){
                    endTime = new Date();
                    seconds = (endTime.getTime() - startTime.getTime()) / 1000;
                    startTime.getTime();
                    ok(true, "10000 SQL Statements Processed Sequentially in " + seconds + " seconds");
                    start();
                },
                function(){
                    throw new Error("Error Processing SQL");
                }
            );
        })
    })
    
    test("CHANGE VERSION: when passed a set of sql statments in an array.", 1, function() {
        stop();
        html5sql.changeVersion(html5sql.database.version,"1.0",
            ["CREATE TABLE sequenceTest2 (sequence  INTEGER PRIMARY KEY, label TEXT);",
             "INSERT INTO sequenceTest2 (label) VALUES ('First');",
             "INSERT INTO sequenceTest2 (label) VALUES ('Second');",
             "INSERT INTO sequenceTest2 (label) VALUES ('Third');",
             "INSERT INTO sequenceTest2 (label) VALUES ('Fourth');",
             "INSERT INTO sequenceTest2 (label) VALUES ('Fifth');",
             "DROP TABLE sequenceTest2;"],
            function(){
                ok(true, "Final Callback Executed" );
                start();
            },
            function(){
                throw new Error("Error Processing SQL");
            }
        );
    });

    test("CHANGE VERSION: when passed a set of sql statments combined within a single string.", 1, function() {
        stop();
        html5sql.changeVersion("1.0","",
            "CREATE TABLE sequenceTest3 (sequence  INTEGER PRIMARY KEY, label TEXT);"+
            "INSERT INTO sequenceTest3 (label) VALUES ('First');"+
            "INSERT INTO sequenceTest3 (label) VALUES ('Second');"+
            "INSERT INTO sequenceTest3 (label) VALUES ('Third');"+
            "INSERT INTO sequenceTest3 (label) VALUES ('Fourth');"+
            "INSERT INTO sequenceTest3 (label) VALUES ('Fifth');"+
            "DROP TABLE sequenceTest3;",
            function(){
                ok(true, "Final Callback Executed" );
                start();
            },
            function(){
                throw new Error("Error Processing SQL");
            }
        );
    });
});