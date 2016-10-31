$(document).ready(function(){
    if(!html5sql.database){
        html5sql.openDatabase("test", "Testing Database", 5*1024*1024);
    }

    html5sql.logInfo = true;

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

    test("PROCESS: a single sql statement object.", 2, function() {
        stop();
        html5sql.process(
            {
                "sql": "CREATE TABLE IF NOT EXISTS singleObjectTest (sequence INTEGER PRIMARY KEY, label TEXT);",
                "data": [],
                "success": function(transaction, results){
                    ok(true, "Created sequence Testing Table")
                }
            },
            function(){
                ok(true, "Final Callback Executed" );
                start();
            },
            function(error, problemSQLStatement){
                throw new Error("Error:"+error.message+" Processing SQL Statement "+problemSQLStatement);
            }
        );
    });

    test("PROCESS: a collection of sql statement objects.", 8, function() {
        stop();
        html5sql.process(
            [
             {
                "sql": "CREATE TABLE Test (sequence  INTEGER PRIMARY KEY, label TEXT);",
                "data": [],
                "success": function(transaction, results){
                    ok(true, "Created sequence Testing Table")
                }
             },
             {
                "sql": "INSERT INTO Test (label) VALUES ('First');",
                "data": [],
                "success": function(transaction, results){
                    equal(1, results.insertId, "Inserted first record in sequence.");
                }
             },
             {
                "sql": "INSERT INTO Test (label) VALUES ('Second');",
                "data": [],
                "success": function(transaction, results){
                    equal(2, results.insertId, "Inserted second record in sequence.");
                }
             },
             {
                "sql": "INSERT INTO Test (label) VALUES ('Third');",
                "data": [],
                "success": function(transaction, results){
                    equal(3, results.insertId, "Inserted third record in sequence.");
                }
             },
             {
                "sql": "INSERT INTO Test (label) VALUES ('Fourth');",
                "data": [],
                "success": function(transaction, results){
                    equal(4, results.insertId, "Inserted fourth record in sequence.");
                }
             },
             {
                "sql": "INSERT INTO Test (label) VALUES ('Fifth');",
                "data": [],
                "success": function(transaction, results){
                    equal(5, results.insertId, "Inserted fifth record in sequence.");
                }
             },
             {
                "sql": "DROP TABLE Test;",
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
            function(error, problemSQLStatement){
                throw new Error("Error:"+error.message+" Processing SQL Statement "+problemSQLStatement);
            }
        );
    });

    test("PROCESS: ensure that an array returned by the success function of individual sql statement objects is used as the data for the next statement.", function(){
        stop();
        html5sql.process(
            [
             {
                "sql": "CREATE TABLE returnTest (sequence  INTEGER PRIMARY KEY, label TEXT);",
                "success": function(transaction, results){
                    ok(true, "Created sequence Testing Table")
                    return ["Five"];
                }
             },
             {
                "sql": "INSERT INTO returnTest (label) VALUES (?);",
                "success": function(transaction, results){
                    equal(1, results.insertId, "Inserted first record in sequence.");
                    return ["Four"];
                }
             },
             {
                "sql": "INSERT INTO returnTest (label) VALUES (?);",
                "success": function(transaction, results){
                    equal(2, results.insertId, "Inserted second record in sequence.");
                    return ["Three"];
                }
             },
             {
                "sql": "INSERT INTO returnTest (label) VALUES (?);",
                "success": function(transaction, results){
                    equal(3, results.insertId, "Inserted third record in sequence.");
                    return ["Two"];
                }
             },
             {
                "sql": "INSERT INTO returnTest (label) VALUES (?);",
                "success": function(transaction, results){
                    equal(4, results.insertId, "Inserted fourth record in sequence.");
                    return ["One"];
                }
             },
             {
                "sql": "INSERT INTO returnTest (label) VALUES (?);",
                "success": function(transaction, results){
                    equal(5, results.insertId, "Inserted fifth record in sequence.");
                }
             },
             {
                "sql": "SELECT * FROM returnTest;",
                "success": function(transaction, results){
                    equal(results.rows.item(0).label, "Five");
                    equal(results.rows.item(1).label, "Four");
                    equal(results.rows.item(2).label, "Three");
                    equal(results.rows.item(3).label, "Two");
                    equal(results.rows.item(4).label, "One");
                }
             },
             {
                sql: "DROP TABLE returnTest;",
                success: function(transaction, results){
                    ok(true, "Droped Sequence Table after all records were inserted.");
                }
             }
            ],
            function(){
                ok(true, "Final Callback Executed" );
                start();
            },
            function(error, problemSQLStatement){
                throw new Error("Error:"+error.message+" Processing SQL Statement "+problemSQLStatement);
            }
        );
    });

    test("PROCESS: a set of sql statments in an array.", 1, function() {
        stop();
        html5sql.process(
            ["CREATE TABLE Test2 (sequence  INTEGER PRIMARY KEY, label TEXT);",
             "INSERT INTO Test2 (label) VALUES ('First');",
             "INSERT INTO Test2 (label) VALUES ('Second');",
             "INSERT INTO Test2 (label) VALUES ('Third');",
             "INSERT INTO Test2 (label) VALUES ('Fourth');",
             "INSERT INTO Test2 (label) VALUES ('Fifth');",
             "DROP TABLE Test2;"],
            function(){
                ok(true, "Final Callback Executed" );
                start();
            },
            function(error, problemSQLStatement){
                throw new Error("Error:"+error.message+" Processing SQL Statement "+problemSQLStatement);
            }
        );
    });

    test("PROCESS: a set of sql statments combined within a single string.", 1, function() {
        stop();
        html5sql.process(
            "DROP TABLE IF EXISTS Test3;"+
            "CREATE TABLE Test3 (sequence  INTEGER PRIMARY KEY, label TEXT);"+
            "INSERT INTO Test3 (label) VALUES ('First');"+
            "INSERT INTO Test3 (label) VALUES ('Second');"+
            "INSERT INTO Test3 (label) VALUES ('Third');"+
            "INSERT INTO Test3 (label) VALUES ('Fourth');"+
            "INSERT INTO Test3 (label) VALUES ('Fifth');"+
            "DROP TABLE Test3;",
            function(){
                ok(true, "Final Callback Executed" );
                start();
            },
            function(error, problemSQLStatement){
                throw new Error("Error:"+error.message+" Processing SQL Statement "+problemSQLStatement);
            }
        );


    });

    test("PROCESS: a single select statement with results forwarded to the final success callback function", 1, function(){
        stop();
        html5sql.process(
            "DROP TABLE IF EXISTS Test3;"+
            "CREATE TABLE Test4 (sequence  INTEGER PRIMARY KEY, label TEXT);"+
            "INSERT INTO Test4 (label) VALUES ('First');"+
            "INSERT INTO Test4 (label) VALUES ('Second');"+
            "INSERT INTO Test4 (label) VALUES ('Third');"+
            "INSERT INTO Test4 (label) VALUES ('Fourth');"+
            "INSERT INTO Test4 (label) VALUES ('Fifth');",
            function(){
                resultsInFinalSuccess();
            },
            function(error, problemSQLStatement){
                throw new Error("Error:"+error.message+" Processing SQL Statement "+problemSQLStatement);
            }
        );
        var resultsInFinalSuccess = function(){
            html5sql.process(
                "SELECT * FROM Test4;",
                function(transaction, results, rowArray){
                    ok((!!transaction && !!results && !!rowArray), "Final Callback Executed Contains Results of the Select Statement");
                    html5sql.process("DROP TABLE IF EXISTS Test4;");
                    start();
                },
                function(error, problemSQLStatement){
                    throw new Error("Error:"+error.message+" Processing SQL Statement "+problemSQLStatement);
                }
            );
        }
    });

    test("PROCESS: turning off putSelectResultsInArray causes the rowArray parameter to be passed as null", 1, function(){
        stop();
        html5sql.putSelectResultsInArray = false;
        html5sql.process(
            "DROP TABLE IF EXISTS Test5;"+
            "CREATE TABLE Test5 (sequence  INTEGER PRIMARY KEY, label TEXT);"+
            "INSERT INTO Test5 (label) VALUES ('First');"+
            "INSERT INTO Test5 (label) VALUES ('Second');"+
            "INSERT INTO Test5 (label) VALUES ('Third');"+
            "INSERT INTO Test5 (label) VALUES ('Fourth');"+
            "INSERT INTO Test5 (label) VALUES ('Fifth');",
            function(){
                resultsInFinalSuccess();
            },
            function(error, problemSQLStatement){
                throw new Error("Error:"+error.message+" Processing SQL Statement "+problemSQLStatement);
            }
        );
        var resultsInFinalSuccess = function(){
            html5sql.process(
                "SELECT * FROM Test5;",
                function(transaction, results, rowArray){
                    ok((rowArray === null), "Final callbackback executed contains a populated rowArray");
                    html5sql.putSelectResultsInArray = false;
                    html5sql.process("DROP TABLE IF EXISTS Test5;");
                    start();
                },
                function(error, problemSQLStatement){
                    throw new Error("Error:"+error.message+" Processing SQL Statement "+problemSQLStatement);
                }
            );
        }
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
                function(error, problemSQLStatement){
                    throw new Error("Error:"+error.message+" Processing SQL Statement "+problemSQLStatement);
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
                function(error, problemSQLStatement){
                    throw new Error("Error:"+error.message+" Processing SQL Statement "+problemSQLStatement);
                }
            );
        })
    });

    test("CHANGE VERSION: when passed a set of sql statments in an array.", 1, function() {
        stop();
        html5sql.changeVersion(html5sql.database.version,"1.0",
            ["CREATE TABLE Test7 (sequence  INTEGER PRIMARY KEY, label TEXT);",
             "INSERT INTO Test7 (label) VALUES ('First');",
             "INSERT INTO Test7 (label) VALUES ('Second');",
             "INSERT INTO Test7 (label) VALUES ('Third');",
             "INSERT INTO Test7 (label) VALUES ('Fourth');",
             "INSERT INTO Test7 (label) VALUES ('Fifth');",
             "DROP TABLE Test7;"],
            function(){
                ok(true, "Final Callback Executed" );
                start();
            },
            function(error, problemSQLStatement){
                throw new Error("Error:"+error.message+" Processing SQL Statement "+problemSQLStatement);
            }
        );
    });

    test("CHANGE VERSION: when passed a set of sql statments combined within a single string.", 1, function() {
        stop();
        html5sql.changeVersion("1.0","",
            "CREATE TABLE Test8 (sequence  INTEGER PRIMARY KEY, label TEXT);" +
            "INSERT INTO Test8 (label) VALUES ('First');" +
            "INSERT INTO Test8 (label) VALUES ('Second');" +
            "INSERT INTO Test8 (label) VALUES ('Third');" +
            "INSERT INTO Test8 (label) VALUES ('Fourth');" +
            "INSERT INTO Test8 (label) VALUES ('Fifth');" +
            "DROP TABLE Test8;",
            function(){
                ok(true, "Final Callback Executed" );
                start();
            },
            function(error, problemSQLStatement){
                throw new Error("Error:"+error.message+" Processing SQL Statement "+problemSQLStatement);
            }
        );
    });

});