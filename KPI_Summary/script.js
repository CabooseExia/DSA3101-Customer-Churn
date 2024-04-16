$(document).ready(function() {
    $('body').append('<div id="spinner-bg" class="spinner-bg"><img src="logo.png" alt="GxSmartChurn logo"><p>Running...</p><div id="spinner" class="spinner"></div></div>');
    document.getElementById('spinner-bg').classList.remove('hidden')
    var startDate = null;
    var endDate = null;
    var minStartDate = new Date("2022-11-29");
    var maxEndDate = new Date("2024-04-13");


    function process(data){
        document.getElementById("hist-churn").innerHTML = data["hist-churn"]
        document.getElementById("proj-churn").innerHTML = data["proj-churn"]
        const hist_churn = data["hist-churn-graph"]
        const loss_impact = data["loss-impact-graph"]
        var figure = JSON.parse(hist_churn);
        Plotly.newPlot('graph', figure.data, figure.layout);
        var figure2 = JSON.parse(loss_impact);
        Plotly.newPlot('graph2', figure2.data, figure2.layout);
        document.getElementById("first-persona-main").innerHTML = data["persona-segment-top-3"][0]["persona"]
        document.getElementById("first-percent-main").innerHTML = data["persona-segment-top-3"][0]["pctg"]
        document.getElementById("second-persona-main").innerHTML = data["persona-segment-top-3"][1]["persona"]
        document.getElementById("second-percent-main").innerHTML = data["persona-segment-top-3"][1]["pctg"]
        document.getElementById("third-persona-main").innerHTML = data["persona-segment-top-3"][2]["persona"]
        document.getElementById("third-percent-main").innerHTML = data["persona-segment-top-3"][2]["pctg"]

        document.getElementById("first-persona").innerHTML = data["persona-segment-top-3"][0]["persona"]
        document.getElementById("first-percent").innerHTML = data["persona-segment-top-3"][0]["pctg"]
        document.getElementById("second-persona").innerHTML = data["persona-segment-top-3"][1]["persona"]
        document.getElementById("second-percent").innerHTML = data["persona-segment-top-3"][1]["pctg"]
        document.getElementById("third-persona").innerHTML = data["persona-segment-top-3"][2]["persona"]
        document.getElementById("third-percent").innerHTML = data["persona-segment-top-3"][2]["pctg"]
        document.getElementById("fourth-persona").innerHTML = data["persona-segment-full"][3]["persona"]
        document.getElementById("fourth-percent").innerHTML = data["persona-segment-full"][3]["pctg"]
        document.getElementById("fifth-persona").innerHTML = data["persona-segment-full"][4]["persona"]
        document.getElementById("fifth-percent").innerHTML = data["persona-segment-full"][4]["pctg"]
        document.getElementById("sixth-persona").innerHTML = data["persona-segment-full"][5]["persona"]
        document.getElementById("sixth-percent").innerHTML = data["persona-segment-full"][5]["pctg"]
        document.getElementById("seventh-persona").innerHTML = data["persona-segment-full"][6]["persona"]
        document.getElementById("seventh-percent").innerHTML = data["persona-segment-full"][6]["pctg"]
        document.getElementById("timestamp").innerHTML = data["timestamp"]
    }
    // Function to populate the table with JSON data
    function populateTable(data) {
        // Assuming your JSON data is in the format of dictionary of dictionaries
        // Iterate over the outer dictionary
        for (var key in data) {
            if (key == 'weighted avg'){
                continue;
            }
            else if (key == 'accuracy'){
                document.getElementById(key.concat("-","average")).innerHTML = (data[key]*100).toFixed(1) +'%';
                continue;
            }
            let classify = "";
            if (key == 0){
                classify = 'positive';
            }
            else if (key == 1){
                classify = 'negative'; 
            }
            else{
                classify ='average';
            }
            var innerData = data[key];
            for (var each in innerData){
                var cell = innerData[each];
                if (each == 'support'){
                    continue;
                }
                if (each =='f1-score'){
                    document.getElementById('f1'.concat("-",classify)).innerHTML = (cell*100).toFixed(1) + '%';
                }
                else{
                    document.getElementById(each.concat("-",classify)).innerHTML = (cell*100).toFixed(1) + '%';
                }
                
            }
        }
    }  
    // Initialize datepicker for start date
    $('#start-date').datepicker({
        dateFormat: 'yy-mm-dd', // Set the date format to dd/mm/yy
        minDate: minStartDate,
        maxDate: maxEndDate,
        onSelect: function(selectedDate) {
            startDate = selectedDate;
            console.log(startDate);
            $('#end-date').datepicker('option', 'minDate', selectedDate);
        }
    });

    // Initialize datepicker for end date
    $('#end-date').datepicker({
        dateFormat: 'yy-mm-dd', 
        minDate: minStartDate,
        maxDate: maxEndDate,
        onSelect: function(selectedDate) {
            endDate = selectedDate;
            console.log(endDate);
            $('#start-date').datepicker('option', 'maxDate', selectedDate)
        }
    });
  
    // Dropdown button click event
    $('.dropbtn').click(function() {
      $('.dropdown-content').toggle();
    });
  
    // Fixed option 1 click event
    $('#past-six-month').click(function() {
        $('body').append('<div id="spinner-bg" class="spinner-bg"><img src="logo.png" alt="GxSmartChurn logo"><p>Running...</p><div id="spinner" class="spinner"></div></div>');
        document.getElementById('spinner-bg').classList.remove('hidden')
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://127.0.0.1:5000/api/time-filter/KPI-Summary');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function() {
            if (xhr.status === 200) {
                console.log(xhr.responseText)
                $.getJSON('http://127.0.0.1:5000/api/data/KPI-Summary', function(data) {
                    process(data);
                    document.getElementById("spinner-bg").style.opacity = "0";
                    setTimeout(() => {
                        // Code to be executed after 0.5 seconds
                        document.getElementById("spinner-bg").remove();
        }, 500);
                })
            } else {
                console.log('Request failed. Status: ' + xhr.status);
            }
        };
        xhr.send(JSON.stringify({ filter: 'past6months' }));
      $('.dropdown-content').hide();
    });
  
    // Fixed option 2 click event
    $('#past-one-year').click(function() {
        $('body').append('<div id="spinner-bg" class="spinner-bg"><img src="logo.png" alt="GxSmartChurn logo"><p>Running...</p><div id="spinner" class="spinner"></div></div>');
        document.getElementById('spinner-bg').classList.remove('hidden')
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://127.0.0.1:5000/api/time-filter/KPI-Summary');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function() {
            if (xhr.status === 200) {
                console.log(xhr.responseText)
                $.getJSON('http://127.0.0.1:5000/api/data/KPI-Summary', function(data) {
                    process(data);
                    document.getElementById("spinner-bg").style.opacity = "0";
                    setTimeout(() => {
                        // Code to be executed after 0.5 seconds
                        document.getElementById("spinner-bg").remove();
        }, 500);
                })
            } else {
                console.log('Request failed. Status: ' + xhr.status);
            }
        };
        xhr.send(JSON.stringify({ filter: 'past1year' }));
      $('.dropdown-content').hide();
    });
  
    // Apply button click event
    $('#filter-button').click(function() {
        $('body').append('<div id="spinner-bg" class="spinner-bg"><img src="logo.png" alt="GxSmartChurn logo"><p>Running...</p><div id="spinner" class="spinner"></div></div>');
        document.getElementById('spinner-bg').classList.remove('hidden')
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://127.0.0.1:5000/api/time-filter/KPI-Summary');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function() {
            if (xhr.status === 200) {
                console.log(xhr.responseText)
                $.getJSON('http://127.0.0.1:5000/api/data/KPI-Summary', function(data) {
                    process(data);
                    document.getElementById("spinner-bg").style.opacity = "0";
                    setTimeout(() => {
                        // Code to be executed after 0.5 seconds
                        document.getElementById("spinner-bg").remove();
        }, 500);
                })
            } else {
                console.log('Request failed. Status: ' + xhr.status);
            }
        };
        xhr.send(JSON.stringify({ filter: 'customrange', start:startDate , end:endDate}));
        console.log('Selected date range:', startDate, 'to', endDate);
    });

    $.getJSON('http://127.0.0.1:5000/api/data/KPI-Summary', function(data) {
        process(data);
        document.getElementById("spinner-bg").style.opacity = "0";
        setTimeout(() => {
            // Code to be executed after 0.5 seconds
            document.getElementById("spinner-bg").remove();
        }, 500);
    })
    $.getJSON('http://127.0.0.1:5000/api/model', function(data) {
        populateTable(data);
    })  
    .fail(function(error) {
        console.error('Error fetching data:', error);
    });
});

