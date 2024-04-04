$(document).ready(function() {
    var startDate = null;
    var endDate = null;
    var minStartDate = new Date('2023-01-01')
    var maxEndDate = new Date('2023-12-31')

    // Function to populate the table with JSON data
    function populateTable(data) {
        // Assuming your JSON data is in the format of dictionary of dictionaries
        // Iterate over the outer dictionary
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                var innerData = data[key];
                for (var each in innerData){
                    if (innerData.hasOwnProperty(each)){
                        var cell = innerData[each];
                        let string =each;
                        for (var indiv in cell){
                            if (cell.hasOwnProperty(indiv)){
                                var final = cell[indiv];
                                let id =string.concat("-",indiv);
                                document.getElementById(id).innerHTML = final;
                            }
                        }
                    }
                }
            }
        }
    }
   
    // Initialize datepicker for start date
    $('#start-date').datepicker({
        dateFormat: 'dd/mm/yy', // Set the date format to dd/mm/yy
        minDate: minStartDate,
        maxDate: maxEndDate,
        onSelect: function(selectedDate) {
            startDate = selectedDate;
            $('#end-date').datepicker('option', 'minDate', selectedDate);
        }
    });

    // Initialize datepicker for end date
    $('#end-date').datepicker({
        dateFormat: 'dd/mm/yy', // Set the date format to dd/mm/yy
        minDate: minStartDate,
        maxDate: maxEndDate,
        onSelect: function(selectedDate) {
            endDate = selectedDate;
            $('#start-date').datepicker('option', 'maxDate', selectedDate)
        }
    });
  
    // Dropdown button click event
    $('.dropbtn').click(function() {
      $('.dropdown-content').toggle();
    });
  
    // Fixed option 1 click event
    $('#past-six-month').click(function() {
      console.log('Past 6 Months selected');
      $('.dropdown-content').hide();
    });
  
    // Fixed option 2 click event
    $('#past-one-year').click(function() {
      console.log('Past 1 Year selected');
      $('.dropdown-content').hide();
    });
  
    // Apply button click event
    $('#filter-button').click(function() {
        console.log('Selected date range:', startDate, 'to', endDate);
      // Add your filtering logic here
    });

    $.getJSON('http://127.0.0.1:5000/api/data', function(data) {
        // Process data for visualization
        const dates = data.map(entry => entry.date);
        const values = data.map(entry => entry.value);
        const account =data.map(entry => entry.account);

        const neg_account = account.map(function(x) {return x*-1;});

        // Plot data using Plotly
        const trace = {
            x: dates,
            y: values,
            type: 'scatter',
            mode:'lines',
            line: {color: 'rgb(159,6,6)'}
        };

        const trace2 ={
            x: dates,
            y: neg_account,
            type: 'scatter',
            mode:'lines',
            line: {color: 'rgb(159,6,6)'}
        }
        var config = {
            responsive: true,
        }
        const layout = {
            title: {
                automargin:false,
                yref:"container",
                yanchor:"center",
                text: "Historical Churn Occurrences",
                font:{
                    family: 'Inter',
                    size: 18,
                    color:"#808080"
                }
            },
            xaxis: {
                title: {
                    text: '<b> Date </b>',
                    font:{
                        family: 'Inter',
                        size: 10
                    }
                },
                font:{
                    family: 'Inter',
                    size: 10
                }
            },
            yaxis: {
                title: {
                    text: '<b> # of Churn Occurrences </b>',
                    font:{
                        family: 'Inter',
                        size: 10
                    }
                },
                font:{
                    family: 'Inter',
                    size: 10
                }
            },
            plot_bgcolor: "#ffffff00",
            paper_bgcolor:"#ffffff00"
        };
        
        const layout2 = {
            title: {
                automargin:false,
                yref:"container",
                yanchor:"center",
                text: "Raw Loss Impact",
                font:{
                    family: 'Inter',
                    size: 18,
                    color:"#808080"
                }
            },
            xaxis: {
                title: {
                    text: '<b> Date </b>',
                    font:{
                        family: 'Inter',
                        size: 10
                    }
                },
                font:{
                    family: 'Inter',
                    size: 10
                }
            },
            yaxis: {
                title: {
                    text: '<b> Net Loss </b>',
                    font:{
                        family: 'Inter',
                        size: 10
                    }
                },
                font:{
                    family: 'Inter',
                    size: 10
                }
            },
            plot_bgcolor: "#ffffff00",
            paper_bgcolor:"#ffffff00"
        };
        Plotly.newPlot('graph', [trace], layout,config);
        Plotly.newPlot('graph2',[trace2], layout2,config);
    })
    $.getJSON('http://127.0.0.1:5000/api/model', function(data) {
        populateTable(data);
    })  
    .fail(function(error) {
        console.error('Error fetching data:', error);
    });
});

