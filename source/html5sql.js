/* ***** html5sql.js ******
 *
 * Description: A helper javascript module for creating and working with
 *     HTML5 Web Databases.
 *
 * License: MIT license <http://www.opensource.org/licenses/mit-license.php>
 *
 * Authors: Ken Corbett Jr
 *
 * Version 0.9
 *
 * General Module Design based on article by Ben Cherry
 * http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth
 * 
 */

var html5sql = (function () {
	
	var readTransactionAvailible = false,
		doNothing = function () {},
		emptyArray = [],
		trim = function (string) {
			return string.replace(/^\s+/, "").replace(/\s+$/, "");
		},
		isArray = function (o) {
			return Object.prototype.toString.call(o) === '[object Array]'; 
		},
		// transaction is an sql transaction, sqlObjects are properly formated
		// and cleaned SQL objects
		sqlProcessor = function (transaction, sqlObjects, finalSuccess, error) {
			
			var sequenceNumber = 0,
				dataForNextTransaction = null,
				runTransaction = function () {
					transaction.executeSql(sqlObjects[sequenceNumber].sql,
										   sqlObjects[sequenceNumber].data,
										   successCallback,
										   failureCallback);
				},
				successCallback = function (transaction, results) {
					if(html5sql.logInfo){
						console.log("Success processing: " + sqlObjects[sequenceNumber].sql);
					}
					
					//Call the success callback provided with sql object
					//If an array of data is returned use that data as the
					//data attribute of the next transaction
					dataForNextTransaction = sqlObjects[sequenceNumber].success(transaction, results);
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
						finalSuccess();
					}
				},
				failureCallback = function (transaction, error) {
					if(html5sql.logErrors){
						console.error("Error: " + error.message + " while processing: " + sqlObjects[sequenceNumber].sql);
					}
					error(error, sqlObjects[sequenceNumber].sql);
				};
			
			runTransaction();
		},
		sqlObjectCreator = function (sqlInput) {
			var i;
			if (typeof sqlInput === "string") {
				trim(sqlInput);
				sqlInput = sqlInput.split(';');
				for(i = 1; i < sqlInput.length; i++){
					sqlInput[i] = trim(sqlInput[i]) + ';';
					if(sqlInput[i] === ';'){
						sqlInput.splice(i, 1);
					}
				}
			}
			for (i = 0; i < sqlInput.length; i++) {
				//If the array item is only a string format it into an sql object
				if (typeof sqlInput[i] === "string") {
					sqlInput[i] = {
						"sql": sqlInput[i],
						"data": [],
						"success": doNothing
					};
				} else {
					// Check to see that the sql object is formated correctly.
					if (typeof sqlInput[i]         !== "object"   ||
					    typeof sqlInput[i].sql     !== "string"   ||
					    typeof sqlInput[i].success !== "function" ||
						!$.isArray(sqlInput[i].data)) {
						throw new Error("Malformed sql object");
					}
				}
			}
			return sqlInput;
		},
		statementsAreSelectOnly = function (SQLObjects) {
		// Returns true if all SQL statement objects are SELECT statements.
			var i = 0,
			    SelectStmtMatch = new RegExp('^select\\s', 'i'),
			    isSelectStmt = function (sqlstring) {
					return SelectStmtMatch.test(sqlstring);
				};
				
			//Loop over SQL objects ensuring they are select statments
			do {
				//If the sql string is not a select statement return false
				if (!isSelectStmt(SQLObjects[i].sql)) {
					return false;
				}
				i++;
			} while (i < SQLObjects.length);
		
			//If all the statments happen to be select statments return true
			return true;
		};
	return {
		database: null,
		logInfo: false,
		logErrors: false,
		openDatabase: function (name, displayname, size, whenOpen) {
			html5sql.database = openDatabase(name, "", displayname, size);
			readTransactionAvailible = typeof html5sql.database.readTransaction === 'function';
			if (whenOpen) {
				whenOpen();
			}
		},
		
		process: function (sqlInput, finalCallback, errorCallback) {
		/*
		 *
		 *	Arguments:
		 *	
		 *  sql = [array SQLObjects] ~ collection of SQL statement objects
		 *           or
		 *        [array SQLStrings] ~ collection of SQL statement strings
		 *           or
		 *        "SQLstring"        ~ SQL string to be split at the ';'
		 *                             character and processed sequentially
         *
		 *  errorCallback = (function) ~ called if any of the sql statements
		 *                               fails.  A default one is used if none
		 *                               is provided.
		 *
		 *  finalCallback = (function) ~ called after all sql statments have
		 *                               been processed.  Optional.
		 *                             
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
		 *  }
		 *
		 *	Usage:
		 *	html5sql.process(
		 *		[{
		 *		   sql: "SELECT * FROM table;",
		 *		   data: [],
		 *		   success: function(){}
		 *		 },
		 *		 {
		 *		   sql: "SELECT * FROM table;",
		 *		   data: [],
		 *		   success: function(){}
		 *		 }],
		 *		function(){},
		 *		function(){}
		 *	);
		 *	
		 */
			if (html5sql.database) {
				
				var sqlObjects = sqlObjectCreator(sqlInput);
				
				if (statementsAreSelectOnly(sqlObjects) && readTransactionAvailible) {
					html5sql.database.readTransaction(function (transaction) {
						sqlProcessor(transaction, sqlObjects, finalCallback, errorCallback);
					});
				} else {
					html5sql.database.transaction(function (transaction) {
						sqlProcessor(transaction, sqlObjects, finalCallback, errorCallback);
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
	
		changeVersion: function (oldVersion, newVersion, sqlInput, finalCallback, errorCallback) {
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
		 *  errorCallback = (function) 		  ~ called if any of the sql statements
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
			if (html5sql.database) {
				if(html5sql.database.version === oldVersion){
					var sqlObjects = sqlObjectCreator(sqlInput);
				
					html5sql.database.changeVersion(oldVersion, newVersion, function (transaction) {
						sqlProcessor(transaction, sqlObjects, finalCallback, errorCallback);
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
	};
	
})();
