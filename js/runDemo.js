$(function(){
    var demoRunning = false;
    
    $("#startTest").click(function(){
        if(!demoRunning){
            $(this).addClass("running");
            $("#demoRunning").show();
            $("#results").text("running...");
            demoRunning = true;
            try {
                html5sql.openDatabase("demo", "Demo Database", 5*1024*1024);
           
                $.get('demo-statements.sql',function(sql){
                    var startTime = new Date();
                    html5sql.process(
                        sql,
                        function(){ //Success
                            var endTime = new Date();
                            $("#results").text("Table with 11000 entries created in: " +
                                               ((endTime - startTime) / 1000) + "s");
                            $("#startTest").removeClass("running");
                            $("#demoRunning").hide();
                            demoRunning = false;
                        },
                        function(error, failingQuery){ //Failure
                            $("#results").text("Error: " + error.message);
                            $("#startTest").removeClass("running");
                            $("#demoRunning").hide();
                            demoRunning = false;
                        }
                    );
                });
            
            } catch (error) {
                $("#results").text("Error: " + error.message);
                $("#startTest").removeClass("running");
                $("#demoRunning").hide();
                demoRunning = false;
            }
        }
    })
});