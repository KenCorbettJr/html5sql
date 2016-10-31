![HTML5](http://www.w3.org/html/logo/badge/html5-badge-h-solo.png)

html5sql
===============
v0.9.7

*Makes using SQL on the client side is easy!*

Website: [html5sql.com](http://html5sql.com)

### Overview

html5sql is a light JavaScript module (3k compressed) that
makes working with the HTML5 Web Database much easier.  html5sql
is powerful enough to process thousands of sql statements in
sequence but also simple enough to process single statements
with ease.

### Examples

If you have tried using an HTML5 web database you know how
complex even getting a single statement to execute. However,
with html5sql it really can be as simple as opening the database
and the executing the following JavaScript:

    html5sql.process("INSERT INTO table (row) VALUES (value);");

Now if you want to know if the statement was successfully
processed you can specify some additional callbacks but at its
core it can be this simple.

In the real world database needs are rarely this simple and
using the HTML5 Web Database becomes especially troublesome
when you are setting up your tables as there are several
statements which need to be executed in a particular order.

This is where html5sql becomes especially useful.  With html5sql
you can just create a separate text file with just your SQL
statements. An easy way to do this may be to create your database
elsewhere and then do a SQL Dump of the sql statements necessary to
recreate it. This file would probably look something like this:

    CREATE TABLE example (id INTEGER PRIMARY KEY, data TEXT);
    INSERT INTO example (data) VALUES ('First');
    INSERT INTO example (data) VALUES ('Second');
    INSERT INTO example (data) VALUES ('Third');

    CREATE TABLE example2 (id INTEGER PRIMARY KEY, data TEXT);
    INSERT INTO example2 (data) VALUES ('First');
    INSERT INTO example2 (data) VALUES ('Second');
    INSERT INTO example2 (data) VALUES ('Third');

With *html5sql*, to sequentially process each of these SQL
statements in order and create your table(s) all you would need to
do is open your database and then add a snippet of code like this:

    $.get('Setup-Tables.SQL',function(sqlStatements){
        html5sql.process(
            sqlStatements, //text of the SQL file you retrieved
            function(){
                // Success Function
                // executed after all statements are processed
            },
            function(error){
                // Handle any errors here
            }
        );
    });

With the the jQuery get function your list of SQL statements
is retrieved from your separate file, split into individual
statements and then processed sequentially in the order they
appear and wala, your database is setup and populated.

As you can see html5sql makes this process a lot easier but
there are several other features built into html5sql which will
make it a useful tool for any database interaction.

### Performance

While all this sounds great, but how fast is html5sql?
Really fast.

For example, html5sql was able to create a table and sequentially
insert **10,000 records** into that table varying amounts of time
but averaging somewhere **between 2 and 6 seconds** using the
Google Chrome browser on my desktop.  Performance varied based on
available computing capacity but by and large statements are
executed at a breakneck pace.

The secret behind this speed is that html5sql executes all of the
statements within the same transaction.  This allows the statements
to be executed quickly but will also cause all the statements to
be rolled back if there is an error with one of them.

### Rational

At its very core, SQL is designed to be a sequentially
processed language.  Certain statements must be processed before
other statements.  For example, a table must be created before
data is inserted into it.  Conversely, JavaScript is a very
asynchronous, event driven language.  This asynchronous nature
is very present in the HTML5 client side database spec and
introduces a high degree of complexity for the programmer.
It is for this reason that this module was written.

This library was written with the understanding that the W3C
has ceased to maintain the spec for the Web SQL Database.  Even
though they have withdrawn from the spec, because webkit has
incorporated it the number if internet users with a compatible
browser is still significant, especially on mobile devices.

While this module decreases the complexity of using an HTML5
SQL database, it does not attempt to simplify the SQL itself.
This is intentional.  SQL is a powerful language and attempts
to simplify it seem to only decrease it power and utility. In
my experience, a better option is to just learn SQL better
so it becomes more natural. An excellent resource for learning
SQL is the [SQLite website](http://sqlite.org/lang.html "SQLite Syntax Guide").

### General Guide for Using

There are 3 general functions built into the html5sql module.

1. `html5sql.openDatabase(databaseName, displayName, estimatedSize)`

    The `html5sql.openDatabase()` is a light wrapper for the native
    `openDatabase` function.  It opens a connection to your
    database and saves a reference to that connection for you.
    It needs to be called before you can process any SQL statements.

    This function has 3 arguments.

    * **databaseName** - This is a name for your database.
        Usually it would be something like = com.yourcompany.yourapp.db
        but it really can be anything you like.
    * **displayName** - This is the display name for your
        database.  A typical example would be "This App Database"
    * **estimatedSize** - This is the estimated size of your
        database.  You want to allow for plenty of space for your
        needs.  A common technique is to use some simple multiplication.
        So for 5 Megabits you could just put 5*1024*1024.

    If you are familiar with the native openDatabase function
    you may notice that version is missing.  Database versions
    are powerful things when you need to change the structure
    of your database tables, but using this functionality is
    implemented within the changeVersion function of *html5sql*.
    For right now we just open a generic connection to the
    database.

    So an example could be something like this:

        html5sql.openDatabase(
            "com.mycompany.appdb",
            "The App Database"
            3*1024*1024);


2. `html5sql.process(SQL, finalSuccessCallback, errorCallback)`

    This function has 3 arguments:

    *   **SQL** - In whichever way you choose to provide it.
    *   **finalSuccessCallback** - A final success callback
        after your all of your statements have been processed.
    *   **errorCallback** - A general error callback function
        to be called if there are any errors in any part of
        this process.  Encountering an error rolls back the
        entire transaction, so the version of the database is
        not changed.

    The `html5sql.process()` function is the workhorse of the
    functions.  Once you have opened your database you can
    pass this function SQL and it will make sure that SQL is
    executed in a sequential manner.

    The first argument which is passed to `html5sql.process()`
    is the SQL.  It can accept SQL statements in many forms:

    1.   **String** - You can pass the process function a single
        SQL statement in a string like this:

            "SELECT * FROM table;"

        or a bunch of SQL statements in a single string, as long
        as each of them ends in a semicolon like this:

            "CREATE TABLE example (id INTEGER PRIMARY KEY, data TEXT);" +
            "INSERT INTO example (data) VALUES ('One');" +
            "INSERT INTO example (data) VALUES ('Two');" +
            "INSERT INTO example (data) VALUES ('Three');" +
            "INSERT INTO example (data) VALUES ('Four');" +
            "INSERT INTO example (data) VALUES ('Five');"

    2. **Array of SQL Statement Strings** - You can pass the
        process function an array of SQL statement strings like
        this:

            [
                "CREATE TABLE example (id INTEGER PRIMARY KEY, data TEXT);",
                "INSERT INTO example (data) VALUES ('One');",
                "INSERT INTO example (data) VALUES ('Two');",
                "INSERT INTO example (data) VALUES ('Three');",
                "INSERT INTO example (data) VALUES ('Four');",
                "INSERT INTO example (data) VALUES ('Five');"
            ]

    3. **A Single SQL Statement Object** - The most functional
        method of providing SQL is by using the SQL Statement
        Object. The structure of the SQL Statement object is
        essentially the same as the arguments you pass to the
        native `executeSQL` function and has three parts:

        * SQL `"String"` - A string containing a single SQL
        statement.  This string can optionally include `?` in
        place of data.
        * data `[Array]` - An array of data which will be
        sequentially inserted into the SQL statement to replace
        the `?` characters.  The number of `?` characters and
        elements in this data array must match.
        * success `(function)` - A function which will be
        called upon successful execution of the SQL statement.
        It has access to the results of the SQL statement.
        Additionally, if this function returns an array, it will
        be used as the data parameter for the next SQL statement
        to be processed.  This allows you to use the results
        of one SQL statement as data for the following SQL
        statements as is commonly needed for foreign keys.

        Probably the easiest way to define and use this object
        is by defining an object literal.  So a general template
        for this SQL Statement Object would be something like
        this:

        {
            "SQL": "",
            "data": [],
            "success": function(transaction, results){

            }
        }
    4. **An Array of SQL Statement Objects** -
        You can also put many SQL Statement Objects in an array
        to be processed sequentially.  Using the array and object
        literal syntax this could look something like this:

            [
              {
                "SQL": "INSERT INTO contacts (name, phone) VALUES (?, ?),
                "data": ["Joe Bob", "555-555-5555"],
                "success": function(transaction, results){
                    //Just Added Bob to contacts table
                },
              },
              {
                "SQL": "INSERT INTO contacts (name, phone) VALUES (?, ?),
                "data": ["Mary Bob", "555-555-5555"],
                "success": function(){
                    //Just Added Mary to contacts table
                },
              }
            ]


    Putting this all together.  An example usage of `html5sql.process()`
    could be:

        html5sql.process(
            [
                "DROP TABLE table1",
                "DROP TABLE table2",
                "DROP TABLE table3",
                "DROP TABLE table4"
            ],
            function(){
                console.log("Success Dropping Tables");
            },
            function(error, statement){
                console.error("Error: " + error.message + " when processing " + statement);
            }
        );

3. `html5sql.changeVersion("oldVersion","newVersion",SQL,successCallback,errorCallback)`

    The `html5sql.changeVersion()` function is what you should
    use to set up your database and handle version and
    migrations.  This function works by testing if the
    database's version matches the oldVersion parameter you
    provide.  If it does this function will process the SQL
    and change the database's version to the newVersion
    value you specify.

    *   **oldVersion** - The version of the database you are
        looking to change.  If you haven't changed the version
        of your database yet it will be the value `""`.
    *   **newVersion** - The version of the database you would
        like to change to.
    *   **SQL** - All the SQL statements necessary to update your database
        schema and migrate your data.  You have many options
        on how you could provide the SQL statements.  See the
        above `html5sql.process()` function description for more
        detail.
    *   **finalSuccessCallback** - A final success callback
        after your database's version has been updated.
    *   **errorCallback** - A general error callback function
        to be called if there are any errors in any part of
        this process.  Encountering an error rolls back the
        entire transaction, so the version of the database is
        not changed.

### Goals for the future

I would like to continue to expand this library and incorporate
more ideas to help programmers use HTML5 web databases.
Eventually I would love to see this library used by everyone
who wishes to utilize the HTML5 Web Database.
