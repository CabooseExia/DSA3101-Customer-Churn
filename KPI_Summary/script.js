$(document).ready(function() {
    var startDate = null;
    var endDate = null;
    var pastSixMonths =false;
    var pastOneYear = false;
    var customDate = false;
    var minStartDate = new Date('2024-01-01')
    var maxEndDate = new Date('2024-12-31')
    var DataFrame = dfjs.DataFrame;
    var rawDf = null;

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

    function filtered(rawDf){
        var currDate = new Date(Date.now());
        if (!pastOneYear && !pastSixMonths && !customDate){
            return rawDf;
        }
        else if (pastOneYear){
            var lastYear = new Date(currDate);
            lastYear = new Date(lastYear.setFullYear(lastYear.getFullYear()-1));
            var newDf = rawDf.filter(row => {var RowDate= new Date(row.get('date')); return RowDate.getTime() <= currDate.getTime() && RowDate.getTime() >= lastYear.getTime()});
            console.log(newDf.show());
            return newDf;
        }
        else if (pastSixMonths){
            var lastSixMonths = new Date(currDate);
            lastSixMonths.setMonth(lastSixMonths.getMonth()-6);
            var newDf = rawDf.filter(row =>{var RowDate= new Date(row.get('date')); return RowDate.getTime() <= currDate.getTime() && RowDate.getTime() >= lastSixMonths.getTime()});
            console.log(newDf.show());
            return newDf;
        }
        else if(customDate){
            var start = new Date(startDate);
            console.log(start);
            var end = new Date(endDate);
            console.log(end);
            var newDf = rawDf.filter(row => {var RowDate= row.get('date'); console.log(RowDate); return new Date(RowDate).getTime() <= end.getTime() && new Date(RowDate).getTime() >= start.getTime()});
            console.log(newDf.show());
            return newDf;
        }
    }
    function persona_segment(persona){
        let lengthOfArr = persona.length;
        let frequencyTable = {};

        // Count frequencies of each element
        persona.forEach(element => {
            frequencyTable[element] = (frequencyTable[element] || 0) + 1;
        });
    
        // Convert object to array of [key, value] pairs
        let frequencyArray = Object.entries(frequencyTable);
    
        // Sort the array based on the frequency in descending order
        frequencyArray.sort((a, b) => b[1] - a[1]);
        
        let order = ['first','second','third']
        var k = 0;
        var complete = false;
        var price = false;
        var feature = false;
        var support = false;
        frequencyArray.forEach(array => {
            let id = order[k]
            let persona_name = array[0];
            if (!complete){
                if (persona_name == 'Price-Sensitive'){
                    price = true;
                }
                else if (persona_name == 'Feature-Driven'){
                    feature=true;
                }
                else{
                    support=true;
                }
                if (price && feature && support){
                    complete = true;
                }
            }
            var persona_id = id.concat('-persona');
            document.getElementById(persona_id).innerHTML = persona_name;
            
            let persona_freq = array[1];
            let persona_pctg = ((persona_freq/lengthOfArr)*100).toFixed(1) + '%';
            document.getElementById(id.concat('-percent')).innerHTML = persona_pctg;
            k += 1
    })
        if (!complete){
            if(!price){
                let id = order[k];
                var persona_id = id.concat('-persona');
                document.getElementById(persona_id).innerHTML = "Price-Sensitive";
                let persona_pctg = (0/100).toFixed(1) + '%';
                document.getElementById(id.concat('-percent')).innerHTML = persona_pctg;
                k +=1;
            }
            if(!feature){
                let id = order[k];
                var persona_id = id.concat('-persona');
                document.getElementById(persona_id).innerHTML = "Feature-Driven";
                let persona_pctg = (0/100).toFixed(1) + '%';
                document.getElementById(id.concat('-percent')).innerHTML = persona_pctg;
                k +=1;
            }
            if(!support){
                let id = order[k];
                var persona_id = id.concat('-persona');
                document.getElementById(persona_id).innerHTML = "Support-Dependent";
                let persona_pctg = (0/100).toFixed(1) + '%';
                document.getElementById(id.concat('-percent')).innerHTML = persona_pctg;
                k +=1;
            } 
        }
    }
    function updateData(rawDf){    
        var df = filtered(rawDf);

        // Process data for visualization
        const dates = df.select('date').toArray().flat();
        const account =df.select('account').toArray().flat();

        const projected = df.select('churn_predict').toArray().flat();
        let filtered_proj = projected.filter(num => num != null && num != NaN);
        const average = array => array.reduce((a, b) => a + b) / array.length;
        if (filtered_proj.length == 0){
            document.getElementById("proj-churn").innerHTML = (0/100).toFixed(1) +'%';

        }
        else{        
            let proj_churn_pctg = (average(filtered_proj)*100).toFixed(1) + '%'
            document.getElementById("proj-churn").innerHTML = proj_churn_pctg;
        }        
        const persona = df.select('persona').toArray().flat();
        persona_segment(persona);

        const churn = df.select('churn').toArray().flat();
        let churn_pctg = (average(churn)*100).toFixed(1) + '%'
        document.getElementById("hist-churn").innerHTML = churn_pctg;

        const neg_account = account.map(function(x) {return x*-1;});

        // Plot data using Plotly
        const trace = {
            x: dates,
            y: churn,
            type: 'scatter',
            mode:'lines+markers',
            line: {color: 'rgb(159,6,6)'}
        };

        const trace2 ={
            x: dates,
            y: neg_account,
            type: 'scatter',
            mode:'lines+markers',
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
      console.log('Past 6 Months selected');
      pastOneYear = false;
      customDate = false;
      pastSixMonths = true;
      updateData(rawDf);
      $('.dropdown-content').hide();
    });
  
    // Fixed option 2 click event
    $('#past-one-year').click(function() {
      console.log('Past 1 Year selected');
      customDate = false;
      pastSixMonths = false;
      pastOneYear = true;
      updateData(rawDf);
      $('.dropdown-content').hide();
    });
  
    // Apply button click event
    $('#filter-button').click(function() {
        pastSixMonths = false;
        pastOneYear = false;
        customDate = true;
        console.log('Selected date range:', startDate, 'to', endDate);
        updateData(rawDf);
      // Add your filtering logic here
    });

    $.getJSON('http://127.0.0.1:5000/api/data', function(data) {
        rawDf = new DataFrame(data);
        console.log(rawDf.show())
        updateData(rawDf);
    })
    $.getJSON('http://127.0.0.1:5000/api/model', function(data) {
        populateTable(data);
    })  
    .fail(function(error) {
        console.error('Error fetching data:', error);
    });
});

