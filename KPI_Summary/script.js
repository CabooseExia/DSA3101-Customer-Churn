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
  });