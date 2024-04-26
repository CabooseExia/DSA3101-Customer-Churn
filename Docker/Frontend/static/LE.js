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
    
    if (selectedPersonas.length > 0) {
        document.getElementById('no-selection-message').style.display = 'none';
        document.querySelector('.main-content').style.display = 'block';
        plotData(selectedPersonas);  // Pass selectedPersonas array to plotData
    } else {
        document.getElementById('no-selection-message').style.display = 'block';
        document.querySelector('.main-content').style.display = 'none';
    }
}

// Optionally, call updateSelectedOptions() on page load to ensure correct state
document.addEventListener('DOMContentLoaded', function() {
    updateSelectedOptions();
});


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
    let baseUrl = 'http://127.0.0.1:5003/api/data/Lifecycle-Explorer';
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

async function plotData(personas) {
    let baseUrl = 'http://127.0.0.1:5003/api/data/Lifecycle-Explorer';
    if (personas.length) {
        const queryParams = personas.map(p => `persona=${encodeURIComponent(p)}`).join('&');
        baseUrl += `?${queryParams}`;
    }
    try {
        const response = await fetch(baseUrl);
        const result = await response.json();
        if (result.graph1) {
            Plotly.newPlot('lifecycleDistribution', JSON.parse(result.graph1).data, JSON.parse(result.graph1).layout);
        }
        if (result.graph2) {
            Plotly.newPlot('churnProbability', JSON.parse(result.graph2).data, JSON.parse(result.graph2).layout);
        }
        if (result.graph3) {
            Plotly.newPlot('transitionHeatmap', JSON.parse(result.graph3).data, JSON.parse(result.graph3).layout);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}