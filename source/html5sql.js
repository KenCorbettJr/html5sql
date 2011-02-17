/* ***** html5sql ******
 * html5sql is a light wrapper of the client side database included in the new
 *   HTML5 spec.  The purpose of this wrapper is to make it easier to process
 *   sql statements in a sequential matter.
 *
 * SQL is designed to be a sequentially processed language.  Certain statments
 *   must be processed before other statments.  For example, a table must be
 *   created before data is inserted into it.  Conversly, JavaScript is a very
 *   asynchronous event driven language.  This asynchronous nature is very
 *   present  in the HTML5 client side database spec and introduces some
 *   complexity.  It is for this reason that this wrapper was written.
 *
 * While this wrapper decreases the complexity of using an html5 sql
 *   database, it does not attempt to simplify the SQL itself.  This is
 *   intentional.  SQL is a powerful language and any attempts to simplify it
 *   seem to only decrease it power and utility.  A better option than finding
 *   a way to simplify it is to just learn it better so it becomes more natural.
 *   An excellent resource for learning sql is the SQLite website:
 *     http://sqlite.org/lang.html
 *   
 * Key Features:
 *  - Provides an easy method of processing sql statement sequentially.
 *  - Combines all sql statements processed in the same group into a single
 *      transaction which makes it so the whole group will roll back if
 *      one of the statements has an error.
 *  - Has an easy method for controlling the version of your sql database.
 *
 * General guide for using a 
 *
 */

var html5sql = (function(){
	
	var readTransactionAvailible = false,
		isSelectStmt = new RegExp('^select\\s', 'i'),
		isSelectStatement = function (sqlstring){
			return isSelectStmt.test(sqlstring);
		};
	
	return {
		database: null,
		
		openDatabase: function(name, displayname, size){
			html5sql.database = openDatabase(name,"",displayname, size);
			readOnlyAvailible = typeof html5sql.database.readTransaction == 'function';
		},
		
		process: function(sql, finalCallback, generalErrorCallback){
		/*
		 *
		 *	Arguments:
		 *  sqlObjects = [array SQLObjects] ~ collection of SQL statement objects
		 *                 or
		 *               [array SQLStrings] ~ collection of SQL statement strings
		 *                 or
		 *               "SQLstring"        ~ SQL string to be split at the ';'
		 *                                    character and processed sequentially
		 *
		 *  finalCallback = (function)        ~ called after all sql statments have
		 *                                      been processed
		 *                                      
		 *  generalErrorCallback = (function) ~ called if any of the sql statements
		 *                                      failsSQL statements, set false if
		 *                                      not applicable
		 *
		 *	SQL statement object:
		 *	{
		 *	 sql: "string",      !Required! ~ Your sql as a string
		 *	 data: [array],       Optional  ~ The array of data to be sequentially
		 *	                                  inserted into your sql at the ?
		 *   success: (function), Optional  ~ A function to be called if this
		 *                                    individual sql statment succeeds.
		 *                                    If an array is returned it is used as
		 *                                    the data for the next sql statement
		 *                                    processed.
		 *   failure: (function), Optional  ~ A function to be called if this
		 *                                    individual sql statement fails
		 *  }
		 *
		 *	Usage:
		 *	html5sql.process(
		 *		[{
		 *		   sql: "SELECT * FROM table;",
		 *		   data: [],
		 *		   success: function(){},
		 *		   failure: function(){}
		 *		 },
		 *		 {
		 *		   sql: "SELECT * FROM table;",
		 *		   data: [],
		 *		   success: function(){},
		 *		   failure: function(){}
		 *		 }],
		 *		function(){},
		 *		function(){}
		 *	);
		 *	
		 */
			if(html5sql.database){
			// From syncronize	
				var sequence = 0,
					SQLObjects
					SQLProcessor = function(t, index){
						t.executeSql(parameters.SQLStatements[index],
									 [],
									 successCallback,
									 failureCallback);
					},
					successCallback = function(transaction, results){
						Mojo.Log.info("Success Processing: " + parameters.SQLStatements[counter]);
						counter++;
						if(parameters.SQLStatements.length > counter){
							SQLProcessor(parameters.singleTransaction, counter);
						} else {
							parameters.successFunction.call(parameters.scope, transaction);
						}
					},
					failureCallback = function(transaction, error){
						Mojo.Log.error(error.message + " when processing: " + parameters.SQLStatements[counter]);
					};
				
				SQLProcessor(parameters.singleTransaction, counter);
				
				// From process	
				var errorFunction = function(transaction, error) {
					Mojo.Log.error('##SQL ERROR IN: ' + passedData.sqlString + ', ' + error.message);
					Mojo.Controller.getAppController().showBanner(error.message, {source: 'notification'});
				};
				
				if(passedData.transaction){
					passedData.transaction.executeSql(passedData.sqlString,
									  passedData.data,
									  passedData.successFunc.bind(passedData.context),
									  errorFunction);
				} else if (passedData.readOnly){
					SQL.database.readTransaction(function (transaction) {
						transaction.executeSql(passedData.sqlString,
									   passedData.data,
									   passedData.successFunc.bind(passedData.context),
									   errorFunction);
					});
				} else {
					SQL.database.transaction(function (transaction) {
						transaction.executeSql(passedData.sqlString,
									   passedData.data,
									   passedData.successFunc.bind(passedData.context),
									   errorFunction);
					});
				}
			} else {
				// Database hasn't been opened.
				console.log("Error: Database needs to be opened before sql can be processed.");
				throw
				return false;
			}
		},
	
		changeVersion: function(oldVersion, newVersion, sqlObjects, finalCallback, generalErrorCallback){
		/* This is the same as html5sql.process but used when you want to change the
		 * version of your database.  If the database version matches the oldVersion
		 * passed to the function the statements passed to the funciton are
		 * processed and the version of the database is changed to the new version.
		 *
		 *	Arguments:
		 *	oldVersion = "String"             ~ the old version to upgrade
		 *	newVersion = "String"             ~ the new version after the upgrade
		 *  sqlObjects = [array]              ~ collection of SQL statement objects
		 *  finalCallback = (function)        ~ called after all sql statments have
		 *                                      been processed
		 *  generalErrorCallback = (function) ~ called if any of the sql statements
		 *                                      failsSQL statements, set false if
		 *                                      not applicable
		 *
		 *	SQL statement object:
		 *	{
		 *	 sql: "string",      !Required! ~ Your sql as a string
		 *	 data: [array],       Optional  ~ The array of data to be sequentially
		 *	                                  inserted into your sql at the ?
		 *   success: (function), Optional  ~ A function to be called if this
		 *                                    individual sql statment succeeds
		 *   failure: (function), Optional  ~ A function to be called if this
		 *                                    individual sql statement fails
		 *  }
		 *
		 *	Usage:
		 *	html5sql.changeVersion(
		 *	    "1.0",
		 *	    "2.0",
		 *		[{
		 *		   sql: "SELECT * FROM table;",
		 *		   data: [],
		 *		   success: function(){},
		 *		   failure: function(){}
		 *		 },
		 *		 {
		 *		   sql: "SELECT * FROM table;",
		 *		   data: [],
		 *		   success: function(){},
		 *		   failure: function(){}
		 *		 }],
		 *		function(){},
		 *		function(){}
		 *	);
		 *	
		 */
		}
	};
	
})({});
