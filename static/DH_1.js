$(document).ready(function() {
    // Initialize Select2 for all select elements
    $('.filter-select').select2({
        dropdownParent: $(".filter-section"),
        width: '100%'
    }).next();
    // Function to toggle dropdown visibility
    $('.filter-name').click(function() {
        $(this).next('.filter-select').next('.select2').toggle(); // Toggle the actual Select2 container
    });
    // Event handler for the Analyze button
    $('.analyze-button').click(function() {
        var selectedFilters = {};
        $('.filter-select').each(function() {
            var filterName = $(this).attr('name');
            var filterValues = $(this).val();
            selectedFilters[filterName] = filterValues;
        });
        console.log('Selected Filters:', selectedFilters);
    });
});

