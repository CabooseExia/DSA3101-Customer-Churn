$(document).ready(function() {
    var startDate = null;
    var endDate = null;
    var minStartDate = new Date('2023-01-01')
    var maxEndDate = new Date('2023-12-31')

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

        // Plot data using Plotly
        const trace = {
            x: dates,
            y: values,
            type: 'scatter'
        };
        const layout = {
            title: 'Data Visualization',
            xaxis: {
                title: 'Date'
            },
            yaxis: {
                title: 'Value'
            }
        };
        Plotly.newPlot('graph', [trace], layout);
    })
    .fail(function(error) {
        console.error('Error fetching data:', error);
    });
});