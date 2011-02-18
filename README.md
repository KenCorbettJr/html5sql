html5sql
========

![HTML5](http://www.w3.org/html/logo/badge/html5-badge-h-solo.png)

### Overview

html5sql is a light javascript module that exists to make working with the HTML5 Web Database much easier.  Its primary 
feature is to provide a structure for the *sequential* processing of SQL statements.  This functionality also combines all sql 
statements processed in the same group into a single transaction.  This way if any of the statements have an error the entire 
group will roll back and you can correct the error and try again without having to worry about keeping track of how far along 
you were.

### Rational

SQL is designed to be a sequentially processed language.  Certain statments must be processed before other statments.  For 
example, a table must be created before data is inserted into it.  Conversly, JavaScript is a very asynchronous event driven 
language.  This asynchronous nature is very present in the HTML5 client side database spec and introduces some complexity.  It 
is for this reason that this module was written.

While this wrapper decreases the complexity of using an HTML5 sql database, it does not attempt to simplify the SQL itself.  
This is intentional.  SQL is a powerful language and any attempts to simplify it seem to only decrease it power and utility.  
A better option than finding a way to simplify it is to just learn it better so it becomes more natural. An excellent resource 
for learning sql is the [SQLite website](http://sqlite.org/lang.html "SQLite Syntax Guide").

### General Guide for Using

Coming soon...
