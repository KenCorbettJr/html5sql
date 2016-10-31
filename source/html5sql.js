/* ***** html5sql.js ******
 * Description: A helper javascript module for creating and working with
 *     HTML5 Web Databases.
 *
 * License: MIT license
 *
 * Website: http://kencorbettjr.github.io/html5sql/
 *
 * Authors: Ken Corbett Jr
 *
 * Version 0.9.6
 */

var html5sql = (function () {
    var readTransactionAvailable = false;
    var doNothing = function () {};
    var emptyArray = [];

    /**
     * This is the core object that gets returned by this script.  It contains
     * certain config values which can be modified by users.
     *
     * @type {Object}
     */
    var html5sql = {
        database: null,
        logInfo: false,
        logErrors: true,
        putSelectResultsInArray: true,
        defaultFailureCallback: doNothing
    };

    // Utility Functions from Underscore.js
    function trim(string) {
        return string.replace(/^\s+/, "").replace(/\s+$/, "");
    }
    function isArray(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }
    function isUndefined(obj) {
        return obj === void 0;
    }

    var isSelectStatementRegex = new RegExp('^select\\s', 'i');
    function isSelectStmt(sqlstring) {
        return isSelectStatementRegex.test(sqlstring);
    };

    // Returns true if all SQL statement objects are SELECT statements.
    function allStatementsAreSelectOnly(SQLObjects) {
        var i = 0;

        //Loop over SQL objects ensuring they are select statements
        do {
            //If the sql string is not a select statement return false
            if (!isSelectStmt(SQLObjects[i].sql)) {
                return false;
            }
            i++;
        } while (i < SQLObjects.length);

        //If all the statements happen to be select statements return true
        return true;
    };

    /**
     * sqlProcessor is the core of html5sql and is responsible for executing all
     * sql statements.  It is a private function and does all the heavy lifting.
     *
     * @param  {SQLTransaction} transaction  A sql transaction that the sql statements should be executed
     *                                       within.
     * @param  {[SQLObjects]}   sqlObjects   An array of one or more SqlObjects.
     * @param  {[Function]}     finalSuccess A final success callback to execute when all statements have
     *                                       been executed.
     * @param  {[Function]}     failure      A failure callback.  Executed whenever any of the passed
     *                                       statements encounter an error.
     */
    function sqlProcessor(transaction, sqlObjects, finalSuccess, failure) {
        var sequenceNumber = 0,
            dataForNextTransaction = null,
            runTransaction = function () {
                transaction.executeSql(sqlObjects[sequenceNumber].sql,
                                       sqlObjects[sequenceNumber].data,
                                       successCallback,
                                       failureCallback);
            },
            successCallback = function (transaction, results) {
                var i, max, rowsArray = [];

                if(html5sql.logInfo){
                    console.log("Success processing: " + sqlObjects[sequenceNumber].sql);
                }

                //Process the results of a select putting them in a much more manageable array form.
                if(html5sql.putSelectResultsInArray && isSelectStmt(sqlObjects[sequenceNumber].sql)){
                    for(i = 0, max = results.rows.length; i < max; i++){
                        rowsArray[i] = results.rows.item(i);
                    }
                } else {
                    rowsArray = null;
                }

                //Call the success callback provided with sql object
                //If an array of data is returned use that data as the
                //data attribute of the next transaction
                dataForNextTransaction = sqlObjects[sequenceNumber].success(transaction, results, rowsArray);
                sequenceNumber++;
                if (dataForNextTransaction && $.isArray(dataForNextTransaction)) {
                    sqlObjects[sequenceNumber].data = dataForNextTransaction;
                    dataForNextTransaction = null;
                } else {
                    dataForNextTransaction = null;
                }

                if (sqlObjects.length > sequenceNumber) {
                    runTransaction();
                } else {
                    finalSuccess(transaction, results, rowsArray);
                }
            },
            failureCallback = function (transaction, error) {
                if(html5sql.logErrors){
                    console.error("Error: " + error.message +
                            " while processing statment " + (sequenceNumber + 1)+": " + sqlObjects[sequenceNumber].sql);
                }
                failure(error, sqlObjects[sequenceNumber].sql);
            };

        runTransaction();
    };

    var SQLObject = function(options){
        if (typeof options === "string") {
            options = {
                sql: options
            }
        }
        this.sql = options.sql;
        this.data = options.data || emptyArray;
        this.success = options.success || doNothing;

         // Check to see that the sql object is formated correctly.
        if (typeof this.sql     !== "string"   ||
            typeof this.success !== "function" ||
            !$.isArray(this.data)) {
            throw new Error("Malformed sql object: " + this);
        }
    };

    function sqlObjectCreator(sqlInput) {
        var i;
        if (typeof sqlInput === "string") {
            sqlInput = trim(sqlInput);

            //Separate sql statements by their ending semicolon
            sqlInput = sqlInput.split(';');

            for(i = 1; i < sqlInput.length; i++){
                //Ensure semicolons within quotes are put back in
                while(sqlInput[i].split(/["]/gm).length % 2 === 0 ||
                      sqlInput[i].split(/[']/gm).length % 2 === 0 ||
                      sqlInput[i].split(/[`]/gm).length % 2 === 0){
                    sqlInput.splice(i,2,sqlInput[i] + ";" + sqlInput[i+1]);
                }
                //Add back the semicolon at the end of the line
                sqlInput[i] = trim(sqlInput[i]) + ';';
                //Get rid of any empty statements
                if(sqlInput[i] === ';'){
                    sqlInput.splice(i, 1);
                }
            }
        }
        if(isArray(sqlInput) === false){
            // At this point the user has most likely passed in a sql object
            // We put it into an array so it will fit the normal format
            sqlInput = [new SQLObject(sqlInput)];
        }
        for (i = 0; i < sqlInput.length; i++) {
            sqlInput[i] = new SQLObject(sqlInput[i]);
        }
        return sqlInput;
    };

    html5sql.openDatabase =  function (name, displayname, size, whenOpen) {
        html5sql.database = openDatabase(name, "", displayname, size);
        readTransactionAvailable = typeof html5sql.database.readTransaction === 'function';
        if (whenOpen) {
            whenOpen();
        }
    }

    /*
     *  Arguments:
     *  1. sql =                             ~ there are four ways to pass sql
     *                                         statements to html5sql.js
     *     a. {object SQLStatementObject}    ~ a single sql statement object
     *           or
     *     b. [array SQLStatementObject(s)]  ~ a collection of SQL statement objects
     *           or
     *     c. "string SQL Statement(s)"      ~ a SQL string to be split into individual
     *                                         statements at the ';' character
     *           or
     *     d. [array SQl Statement(s)]       ~ a collection of SQL strings
     *
     *  2. finalSuccessCallback = (function) ~ called after all sql statements have
     *                                         been processed.  Optional.
     *
     *  3. failureCallback =      (function) ~ called if any of the sql statements
     *                                         fails.  A default one is used if none
     *                                         is provided.  Optional.
     *
     *  SQLStatementObject:
     *  {
     *   sql: "string",       !Required!  ~ Your sql as a string
     *   data: [array],        Optional   ~ The array of data to be sequentially
     *                                      inserted into your sql at the ?
     *   success: (function),  Optional   ~ A function to be called if this
     *                                      individual sql statement succeeds
     *   failure: (function),  Optional   ~ A function to be called if this
     *                                      individual sql statement fails
     *  }
     *
     *  Usage:
     *  html5sql.process(
     *      {
     *         sql: "UPDATE users SET ...",
     *         data: [],
     *         success: function(){},
     *         failure: function(){}
     *      },
     *      function(){}, // finalSuccessCallback
     *      function(){}  // failureCallback
     *  );
     *
     */
    html5sql.process = function (sqlInput, finalSuccessCallback, failureCallback) {
            if (html5sql.database) {

                var sqlObjects = sqlObjectCreator(sqlInput);

                if(isUndefined(finalSuccessCallback)){
                    finalSuccessCallback = doNothing;
                }

                if(isUndefined(failureCallback)){
                    failureCallback = html5sql.defaultFailureCallback;
                }

                if (allStatementsAreSelectOnly(sqlObjects) && readTransactionAvailable) {
                    html5sql.database.readTransaction(function (transaction) {
                        sqlProcessor(transaction, sqlObjects, finalSuccessCallback, failureCallback);
                    });
                } else {
                    html5sql.database.transaction(function (transaction) {
                        sqlProcessor(transaction, sqlObjects, finalSuccessCallback, failureCallback);
                    });
                }
            } else {
                // Database hasn't been opened.
                if(html5sql.logErrors){
                    console.error("Error: Database needs to be opened before sql can be processed.");
                }
                return false;
            }
        },

    /* This is the same as html5sql.process but used when you want to change the
     * version of your database.  If the database version matches the oldVersion
     * passed to the function the statements passed to the function are
     * processed and the version of the database is changed to the new version.
     *
     *  Arguments:
     *  1. oldVersion = "String"             ~ the old version to upgrade
     *  2. newVersion = "String"             ~ the new version after the upgrade
     *  3. sql =                             ~ there are four ways to pass sql
     *                                         statements to html5sql.js
     *     a. {object SQLStatementObject}    ~ a single sql statement object
     *           or
     *     b. [array SQLStatementObject(s)]  ~ a collection of SQL statement objects
     *           or
     *     c. "string SQL Statement(s)"      ~ a SQL string to be split into individual
     *                                         statements at the ';' character
     *           or
     *     d. [array SQl Statement(s)]       ~ a collection of SQL strings
     *
     *  4. finalSuccessCallback = (function) ~ called after all sql statements have
     *                                         been processed.  Optional.
     *
     *  5. failureCallback =      (function) ~ called if any of the sql statements
     *                                         fails.  A default one is used if none
     *                                         is provided.  Optional.
     *
     *  SQLStatementObject:
     *  {
     *   sql: "string",       !Required!  ~ Your sql as a string
     *   data: [array],        Optional   ~ The array of data to be sequentially
     *                                      inserted into your sql at the ?
     *   success: (function),  Optional   ~ A function to be called if this
     *                                      individual sql statement succeeds
     *   failure: (function),  Optional   ~ A function to be called if this
     *                                      individual sql statement fails
     *  }
     *
     *  Usage:
     *  html5sql.changeVersion(
     *      "1.0",                             // oldVersion
     *      "2.0",                             // newVersion
     *      [{                                 // sql
     *         sql: "ALTER TABLE users ...",
     *         data: [],
     *         success: function(){},
     *         failure: function(){}
     *       },
     *       {
     *         sql: "UPDATE users ...",
     *         data: [],
     *         success: function(){},
     *         failure: function(){}
     *       }],
     *      function(){},                      // finalSuccessCallback
     *      function(){}                       // failureCallback
     *  );
     *
     */
    html5sql.changeVersion = function (oldVersion, newVersion, sqlInput, finalSuccessCallback, failureCallback) {
        if (html5sql.database) {
            if(html5sql.database.version === oldVersion){
                var sqlObjects = sqlObjectCreator(sqlInput);

                if(isUndefined(finalSuccessCallback)){
                finalSuccessCallback = doNothing;
                }

                if(isUndefined(failureCallback)){
                    failureCallback = html5sql.defaultFailureCallback;
                }

                html5sql.database.changeVersion(oldVersion, newVersion, function (transaction) {
                    sqlProcessor(transaction, sqlObjects, finalSuccessCallback, failureCallback);
                });
            }
        } else {
            // Database hasn't been opened.
            if(html5sql.logErrors){
                console.log("Error: Database needs to be opened before sql can be processed.");
            }
            return false;
        }

    }

    return html5sql;
})();
