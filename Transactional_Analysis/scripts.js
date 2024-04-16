function showTab(tabName) {
  var tabs = document.getElementsByClassName('tab');
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].classList.remove('active');
  }
  document.querySelector('.tab[onclick="showTab(\'' + tabName + '\')"]').classList.add('active');
  // Here you would also handle showing and hiding actual tab content
}

function toggleDropdown() {
    var optionsContainer = document.querySelector('.options-container');
    optionsContainer.style.display = optionsContainer.style.display === 'block' ? 'none' : 'block';
}

function updateSelectedOptions() {
    var selectedItems = document.querySelectorAll('.options-container .option input:checked');
    var selectedPersonas = Array.from(selectedItems).map(function(item) {
        return item.value;  // Use value attribute for the filter
    });
    var selectedItemsText = selectedPersonas.join(', ');
    document.querySelector('.selected-items').textContent = selectedItemsText || 'Select options';
    plotData(selectedPersonas);  // Pass selectedPersonas array to plotData
}

// Optional: Close dropdown when clicked outside
window.onclick = function(event) {
    if (!event.target.matches('.select-box') && !event.target.matches('.option input')) {
        var dropdowns = document.getElementsByClassName("options-container");
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.style.display === 'block') {
                openDropdown.style.display = 'none';
            }
        }
    }
};

async function fetchData(personas) {
    let baseUrl = 'http://127.0.0.1:5000/api/data';
    if (personas.length) {
        // Join multiple persona values with '&' to construct the query string properly
        const queryParams = personas.map(p => `persona=${encodeURIComponent(p)}`).join('&');
        baseUrl += `?${queryParams}`;
    }
    console.log("Fetching data from:", baseUrl);  // Log the URL to debug
    try {
        const response = await fetch(baseUrl);
        const data = await response.json();
        console.log("Data received:", data);  // Debugging log
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Modify plotData to accept an array of personas
async function plotData(personas) {
    const data = await fetchData(personas);  // Pass the array to fetchData
    plotLifecycleDistribution(data);
    plotChurnProbability(data);
}

function plotLifecycleDistribution(data) {
    const groupedByPersona = data.reduce((acc, item) => {
        const persona = item.CombinedPersonas;
        const lifecycle = item.CurrLifecycle;
        if (!acc[persona]) acc[persona] = {};
        if (!acc[persona][lifecycle]) acc[persona][lifecycle] = 0;
        acc[persona][lifecycle] += 1;  // Increment count for lifecycle under each persona
        return acc;
    }, {});

    const traces = [];
    Object.keys(groupedByPersona).forEach(persona => {
        const personaData = groupedByPersona[persona];
        const trace = {
            x: Object.keys(personaData),
            y: Object.values(personaData),
            type: 'bar',
            name: persona
        };
        traces.push(trace);
    });

    const layout = {
        title: 'Distribution of Lifecycles by Persona',
        barmode: 'group',  // Choose 'group' or 'stack' depending on your preference
        xaxis: { title: 'Lifecycle' },
        yaxis: { title: 'Count' },
        margin: { t: 30 }
    };

    Plotly.newPlot('lifecycleDistribution', traces, layout);
}


function plotChurnProbability(data) {
    const groupedByLifecycle = data.reduce((acc, item) => {
        const lifecycle = item.CurrLifecycle;
        if (!acc[lifecycle]) acc[lifecycle] = [];
        acc[lifecycle].push({ persona: item.CombinedPersonas, probability: item.Average_Churned_Proba });
        return acc;
    }, {});

    const traces = [];
    Object.keys(groupedByLifecycle).forEach(lifecycle => {
        groupedByLifecycle[lifecycle].forEach(entry => {
            traces.push({
                x: [entry.probability],
                y: [lifecycle],
                type: 'bar',
                orientation: 'h',
                name: entry.persona
            });
        });
    });

    const layout = {
        title: 'Churn Probability by Lifecycle and Persona',
        barmode: 'group',  // Use 'group' to group bars instead of stacking
        xaxis: { title: 'Churn Probability (%)' },
        yaxis: { autorange: 'reversed', title: 'Lifecycle' },
        margin: { t: 30 }
    };

    Plotly.newPlot('churnProbability', traces, layout);
}

function plotChurnProbability(data) {
    // Define a color palette for personas
    const personaColors = {
        'Savings Savant': 'rgba(255, 99, 132, 0.5)',  // Example color
        'Digital Dynamos': 'rgba(54, 162, 235, 0.5)',  // Example color
        'Trustee Tribe': 'rgba(255, 206, 86, 0.5)',    // Example color
        'Frugal Innovators': 'rgba(75, 192, 192, 0.5)',// Example color
        'Cost-Conscious Careseekers': 'rgba(153, 102, 255, 0.5)',  // Example color
        'Premium Patrons': 'rgba(255, 159, 64, 0.5)', // Example color
        'Triple Advantage Allies': 'rgba(199, 199, 199, 0.5)'  // Example color
    };

    // Track which personas have been added to the legend
    const personasInLegend = new Set();

    // Group data by Lifecycle and then by Persona
    const lifecycleOrder = ['Active', 'Dormant', 'Reactivated'];
    const groupedData = lifecycleOrder.reduce((acc, lifecycle) => {
        acc[lifecycle] = {};
        data.forEach(item => {
            if (item.CurrLifecycle === lifecycle) {
                acc[lifecycle][item.CombinedPersonas] = item.Average_Churned_Proba;
            }
        });
        return acc;
    }, {});

    const traces = [];
    lifecycleOrder.forEach(lifecycle => {
        Object.entries(groupedData[lifecycle]).forEach(([persona, churnProbability]) => {
            const showLegend = !personasInLegend.has(persona);
            personasInLegend.add(persona);  // Ensure each persona is added to the legend only once
            traces.push({
                x: [churnProbability],
                y: [lifecycle],
                type: 'bar',
                orientation: 'h',
                name: persona,
                showlegend: showLegend,
                marker: {
                    color: personaColors[persona] || 'rgba(128, 128, 128, 0.5)' // Default color if not specified
                }
            });
        });
    });

    const layout = {
        title: 'Churn Probability by Lifecycle and Persona',
        xaxis: {
            title: 'Churn Probability (%)',
            range: [0, 100] // You can adjust this range based on your actual data scale
        },
        yaxis: {
            title: 'Lifecycle',
            autorange: 'reversed' // This makes the y-axis start from Active down to Reactivated
        },
        barmode: 'group', // Or 'group' if you prefer individual bars for comparison
        legend: {
            orientation: 'h',
            x: 0.5, // Center the legend horizontally
            xanchor: 'center', // Anchor the legend at its center
            y: -0.15, // Move the legend below the x-axis
            yanchor: 'top' // Anchor the legend at the top, so 'y' shifts it upward
        },
        margin: {
            l: 100,
            r: 50,
            t: 50,
            b: 50
        }
    };

    Plotly.newPlot('churnProbability', traces, layout);
}



// function plotLifecycleDistribution(data) {
//     // Group data by Persona and then by Lifecycle
//     const groupedByPersona = data.reduce((acc, item) => {
//         if (!acc[item.Persona]) acc[item.Persona] = {};
//         if (!acc[item.Persona][item.Lifecycle]) acc[item.Persona][item.Lifecycle] = 0;
//         acc[item.Persona][item.Lifecycle] += 1; // Count occurrences
//         return acc;
//     }, {});

//     const traces = [];
//     const lifecycleCategories = ['Active', 'Dormant', 'Churn', 'Reactivated']; // Define lifecycle order if necessary

//     lifecycleCategories.forEach(lifecycle => {
//         Object.keys(groupedByPersona).forEach(persona => {
//             const count = groupedByPersona[persona][lifecycle] || 0;
//             const traceIndex = traces.findIndex(t => t.name === persona);
//             if (traceIndex === -1) {
//                 traces.push({
//                     x: [lifecycle],
//                     y: [count],
//                     type: 'bar',
//                     name: persona
//                 });
//             } else {
//                 traces[traceIndex].x.push(lifecycle);
//                 traces[traceIndex].y.push(count);
//             }
//         });
//     });

//     const layout = {
//         title: 'Distribution of Lifecycles by Persona',
//         autosize: true,
//         barmode: 'group',  // Use 'stack' for stacked bar chart
//         xaxis: {title: 'Lifecycle'},
//         yaxis: {title: 'Count'},
//         margin: {b: 150}, // Adjust bottom margin to avoid label cutoff
//         legend: {orientation: 'h', x: 0, xanchor: 'left', y: 1.1} // Adjust legend to be horizontal at top
//     };

//     Plotly.newPlot('lifecycleDistribution', traces, layout);
// }

// function plotChurnProbability(data) {
//     // Group data by Lifecycle, then by Persona
//     const groupedByLifecycle = data.reduce((acc, item) => {
//         if (!acc[item.Lifecycle]) acc[item.Lifecycle] = {};
//         acc[item.Lifecycle][item.Persona] = item['Churn Probability'];
//         return acc;
//     }, {});

//     const lifecycles = ['Active', 'Dormant', 'Reactivated']; // Defined lifecycle order

//     // Prepare traces, one for each Persona
//     const traces = [];
//     const personaColors = { 'Price-Sensitive': 'rgba(255, 99, 132, 0.5)', 'Feature-Driven': 'rgba(54, 162, 235, 0.5)' }; // Example colors for personas
//     Object.keys(groupedByLifecycle[lifecycles[0]]).forEach(persona => { // Assuming all personas exist in the first category
//         const yValues = lifecycles.map(lifecycle => lifecycle); // Y-axis categories
//         const xValues = lifecycles.map(lifecycle => {
//             const probability = groupedByLifecycle[lifecycle][persona] || 0;
//             return probability;
//         });
        
//         traces.push({
//             y: yValues,
//             x: xValues,
//             type: 'bar',
//             name: persona,
//             orientation: 'h',
//             marker: {
//                 color: personaColors[persona], // Assign colors based on the persona
//             }
//         });
//     });

//     const layout = {
//         title: 'Probability of Churn by Lifecycle and Persona',
//         xaxis: {title: 'Churn Probability (%)', range: [0, 100]},
//         yaxis: {title: 'Lifecycle', autorange: 'reversed'}, // Reverse the y-axis to match the order in the array
//         barmode: 'group',
//         autosize: true,
//         margin: {l: 100, r: 50, t: 50, b: 50}, // Adjust margins to fit labels
//         legend: {orientation: 'h', x: 0, xanchor: 'left', y: 1.1} // Horizontal legend at the top
//     };

//     Plotly.newPlot('churnProbability', traces, layout);
// }
