/*

            _/    _/_/    _/_/_/_/_/                              _/       
               _/    _/      _/      _/_/    _/    _/    _/_/_/  _/_/_/    
          _/  _/  _/_/      _/    _/    _/  _/    _/  _/        _/    _/   
         _/  _/    _/      _/    _/    _/  _/    _/  _/        _/    _/    
        _/    _/_/  _/    _/      _/_/      _/_/_/    _/_/_/  _/    _/     
       _/                                                                  
    _/

    Created by David Kaneda <http://www.davidkaneda.com>
    HTML5 database extension by Cedric Dugas <http://www.position-absolute.com>
    Documentation and issue tracking on Google Code <http://code.google.com/p/jqtouch/>
    
    Special thanks to Jonathan Stark <http://jonathanstark.com/>
    and pinch/zoom <http://www.pinchzoom.com/>
    
    (c) 2009 by jQTouch project members.
    See LICENSE.txt for license.

*/

(function($) {
    if ($.jQTouch)
    {
        $.jQTouch.addExtension(function Counter(jQTouch){
            var db,dbName;
            var debugging = false;	// Debugging Window
            
            function dbOpen(name,version,desc,size) {	// Open database
            	dbName = name
          	 	if (window.openDatabase) {
            	 	 db = openDatabase(name, version, desc, size);
				        if (!db){
				            debugTxt= ("Failed to open the database on disk.  This is probably because the version was bad or there is not enough space left in this domain's quota");
				            if(debugging){ debug(debugTxt)}
				        }    
				 } else{
				      debugTxt= ("Couldn't open the database.  Please try with a WebKit nightly with this feature enabled");
				      if(debugging){ debug(debugTxt)}
				}
            }
            function dbCreateTables(tbJson) {
            	
            	for(x=0;x<tbJson.createTables.length;x++){	// Loop in the json for every table
            		createQuery(tbJson.createTables[x]);
            	} 	
	            	function createQuery(tbNode){			// Create the SQL that will create the tables
	            		debugTxt = "create table "+ tbNode.table;
	            		var stringQuery = "CREATE TABLE " + tbNode.table + " (";
	            		nodeSize = tbNode.property.length -1;
	            		for(y=0;y<=nodeSize;y++){
	            			stringQuery += tbNode.property[y].name +" "+ tbNode.property[y].type;
	            			if(y != nodeSize) {stringQuery +=", "}
	            		}
	            		stringQuery +=")";
	            		dbExecuteQuery(stringQuery,debugTxt);
	            	}
            }
           	function dbDeleteRow(table,key,value) {		// Simple Delete row
         		stringQuery = "DELETE FROM " + table + " WHERE " + key +" = " + value;
           		debugTxt = "delete row" + key + " " + value;
           		dbExecuteQuery(stringQuery,debugTxt);
			}
			function dbSelectAll(table,fn) {
         		stringQuery = "SELECT * FROM " + table;
          		debugTxt = "selecting everything in table " + table;
               	dbExecuteQuery(stringQuery,debugTxt,fn);
			}
			function dbDropTable(table) {
         		stringQuery = "DROP TABLE " + table;
         		debugTxt = "delete table " + table;
           		dbExecuteQuery(stringQuery,debugTxt);
			}
            function dbInsertRows(tbJson) {		// Insert Row
            	for(x=0;x<tbJson.addRow.length;x++){ 		// loop in every row from JSON
            		createQueryRow(tbJson.addRow[x]);
            	}
            	function createQueryRow(tbNode){		// Create every row SQL
            		debugTxt = "create row " + tbNode.table;
            		
	         		stringQuery = "INSERT INTO " + tbNode.table + " ("
	     			nodeSize = tbNode.property.length -1;
	        		for(y=0;y<=nodeSize;y++){
	        			stringQuery += tbNode.property[y].name;
	        			if(y != nodeSize) {stringQuery +=", "}
	        		}
	        		stringQuery +=") VALUES (";
	        		for(y=0;y<=nodeSize;y++){
	        			stringQuery += '"'+ tbNode.property[y].value +'"';
	        			if(y != nodeSize) {stringQuery +=", "}
	        		}
	        		stringQuery +=")";
	           		dbExecuteQuery(stringQuery,debugTxt);
           		}
			}
			
            function dbExecuteQuery(stringQuery,debugTxtRaw,fn ) {		// Execute all query, can be called in website script
             	debugTxtRaw += "<br> SQL: " + stringQuery;
            	callback = fn;											// Callback
            	 
        		db.transaction(function(tx) {			
			        tx.executeSql(stringQuery, [], function(tx,result) { 	// Execute SQL
			        	if (callback) {callback(result);}					// Execute callback
		               	if(debugging){
				         	debugTxtRaw += "<br><span style='color:green'>success</span> ";
				         	debug(debugTxtRaw);	
		         		}
			        }, function(tx, error) {
			        	debugTxtRaw += "<br><span style='color:red'>"+error.message+"</span> "; 
			        	if(debugging){
				        	debug(debugTxtRaw);	
		         		}
		            });
		        });
        	}
        	function debug(error) {											// Create debug mode window
				if(!$("#debugMode")[0]){
					$("body").append("<div style='position:abolute;top:0 !important;left:0 !important;width:100% !important;min-height:100px !important; height:300px; overflow:scroll;z-index:1000; display:block; opacity:0.8; background:#000;-webkit-backface-visibility:visible ' id='debugMode'></div>");
				}
				$("#debugMode").append("<div class='debugerror'>"+error+"</div>");
			}			
            return {
                dbOpen: dbOpen,
                dbDeleteRow: dbDeleteRow,
                dbDropTable: dbDropTable,
                dbInsertRows: dbInsertRows,
                dbSelectAll: dbSelectAll,
                dbExecuteQuery: dbExecuteQuery,
                dbCreateTables: dbCreateTables
            }
        });
    }
})(jQuery);