$(function(){    
    test("Create a global html5sql variable is created using the modular pattern containing all functions.", function() {
        expect(4);
        ok(html5sql, "Global html5sql exists" );
        ok(html5sql.openDatabase, "html5sql.openDatabse function exists");
        ok(html5sql.process, "html5sql.process function exists");
        ok(html5sql.changeVersion, "html5sql.changeVersion function exists");
    });
    
    module("Module: Open Database");
    
    test("Successfully open the database and store it as html5sql.database", function() {
        html5sql.openDatabase("test", "Testing Database", 5*1024*1024);
        ok(html5sql.database, "Database was successfully created by calling html5sql.openDatabase with thie correct parameters");
    });
    
    test("When unexpected parameters are passed to the openDatabase function an error is returned", function(){
        raises(html5sql.openDatabase(123, 123, "string"), "An error is returned.")
    })

    module("Module: Seqentially Process SQL Statements");
    
    test("some other test", function() {
        expect(2);
        equals( true, true, "passing test" );
    });
});