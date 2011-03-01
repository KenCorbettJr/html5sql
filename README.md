![HTML5](http://www.w3.org/html/logo/badge/html5-badge-h-solo.png)

html5sql {beta}
===============
v0.9

*Finally using SQL on the client side is easy!*

### Overview

html5sql is a light JavaScript module that exists to make 
working with the HTML5 Web Database easy.  Its primary 
function is to provides a structure for the **SEQUENTIAL** 
processing of SQL statements within a single transaction.
This alone greatly simplifies the interaction with the database
however it doesn't stop there.  Many other smaller features
have been included to make things easier, more natural and more
convenient for the programmer.

### Core Features

1. Provide the capability to sequentially process SQL in many
different forms:

    * As a single SQL statement string.
    * As an array of SQL statement strings.
    * As an array of SQL statement objects (if you want to inject
        data into the SQL or get a callback after each SQL statement is
        processed)
    * As a string containing multiple SQL statements, each of
        which ends in a semicolon.
    * From a completely **separate file** containing SQL statements.

2. Provide a framework for controlling the version of a database.

### Example

If you have tried using an HTML5 web database you know how
complex it can be.  Especially when you are setting it up your
tables in the beginning.  Well you will be happy to know this
is no more.

To show you what I mean and illustrate the power of this
module, take a look at this example:

Say you want to set up a table and insert a bunch of rows
into this table. If you are using html5sql you would just
put all the statements necessary to create your table into
a separate file, which for this example we will name
`Setup-Tables.SQL`.  This file would probably look something
like this:

    CREATE TABLE example (id INTEGER PRIMARY KEY, data TEXT);
    INSERT INTO example (data) VALUES ('First');
    INSERT INTO example (data) VALUES ('Second');
    INSERT INTO example (data) VALUES ('Third');
    
    CREATE TABLE example2 (id INTEGER PRIMARY KEY, data TEXT);
    INSERT INTO example2 (data) VALUES ('First');
    INSERT INTO example2 (data) VALUES ('Second');
    INSERT INTO example2 (data) VALUES ('Third');
    
With *html5sql*, to sequentially call these SQL statements and
create your table(s) all you would need to do is open your
database and then add a snippet of code like this:

    $.get('Setup-Tables.SQL',function(sqlStatements){
        html5sql.process(
            //This is the text data from the SQL file you retrieved
            sqlStatements,
            function(){
                // After all statements are processed this function
                //   will be called.
            },
            function(error){
                // Handle any errors here
            }
        );
    });
    
With the the jQuery get function your list of SQL statements
is retrieved from your separate file, split into individual
statements and processed sequentially in the order they appear.

While this is just a simple example it illustrates how much
easier this module can make using an html5sql database.

### Performance

While all this sounds great, you may be wondering if
performance suffers when SQL statements are processed
sequentially.  The answer, as far as I can tell, is not that
much.

For example, html5sql was able to create a table and sequentially
insert **10,000 records** into that table varying amounts of time
but averaging somewhere **between 2 and 6 seconds** using the
Google Chrome browser on my desktop.  This test leads me to
believe large data sets should be handled by *html5sql*
quite well.

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
browser is still significant, expecially on mobile devices.

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
    `openDatabase` function.  It open's a connection to your
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
    
    The `html5sql.process()` function is the workhorse of the
    functions.  Once you have opened your database you can
    pass this function SQL and it will make sure that SQL is
    executed in a sequential manner.
    
    The first argument which is passed to `html5sql.process()`
    is SQL.  It can accept SQL statements in many forms:
    
    1.   **String** - You can pass the process function a single
        SQL statement in a string like this:
        
            "SELECT * FROM table;"
        
        or a bunch of SQL statements in a single string, as long
        as each of them ends in a semicolon like this:
        
            "CREATE table (id INTEGER PRIMARY KEY, data TEXT);" +
            "INSERT INTO table (data) VALUES ('One');" + 
            "INSERT INTO table (data) VALUES ('Two');" + 
            "INSERT INTO table (data) VALUES ('Three');" + 
            "INSERT INTO table (data) VALUES ('Four');" + 
            "INSERT INTO table (data) VALUES ('Five');" 
    
    2.  **Text from Separate File** - In much the same way
        `html5sql.process()` can handle strings with multiple
        SQL statements, it can handle and process text data
        retrieved from an separate file.  An example of this
        is shown above.
        
    3. **Array of SQL Statement Strings** - You can pass the
        process function an array of SQL statement strings like
        this:
        
            [
                "CREATE table (id INTEGER PRIMARY KEY, data TEXT);",
                "INSERT INTO table (data) VALUES ('One');", 
                "INSERT INTO table (data) VALUES ('Two');", 
                "INSERT INTO table (data) VALUES ('Three');", 
                "INSERT INTO table (data) VALUES ('Four');", 
                "INSERT INTO table (data) VALUES ('Five');"
            ]
        
    4. **Array of SQL Statement Objects** - The most functional
        method of providing SQL is by using the SQL Statement
        Objects in an array. The structure of the SQL Statement
        object is basically the same as the arguments you
        pass to the native `executeSQL` function and has three
        parts:
        
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
        
        So a simple example of the SQL parameter when using
        using SQL Statement Objects could be:
        
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
        
        The only argument of the native `executeSQL` function
        that isn't part of the SQL Statement Object is the error
        callback function.  This is because there is a general
        error callback that is defined for the entire transaction
        rather than for the individual statements.  This
        general error callback is the third argument passed to
        the `html5sql.process()` function.
        
    
    So in total `html5sql.process()` has 3 arguments:

    *   **SQL** - In whichever way you choose to provide it.
    *   **finalSuccessCallback** - A final success callback
        after your all of your statements have been processed.
    *   **errorCallback** - A general error callback function
        to be called if there are any errors in any part of
        this process.  Encountering an error rolls back the
        entire transaction, so the version of the database is
        not changed.
        
    Putting this all together.  An example usage of `html5.process()`
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
    