function updateDashboardData() {
    fetch(`/api/results/Demographics-Hub?token_id=${encodeURIComponent(token_id)}`)
        .then(response => response.json())
        .then(data => {
            if (data['error']) {
                document.querySelector('.dashboard-section').innerHTML = "<h1 class='result-error'>ERROR: "+data["error"]+"</h1>";
            } else {
                const customerData = data['Filtered Data'];
                document.querySelector('.top-panels .panel:nth-child(1) p').innerText = customerData.length;
                document.querySelector('.top-panels .panel:nth-child(2) p').innerText = customerData.length;
                document.querySelector('.top-panels .panel:nth-child(3) p').innerText = customerData.length;
                plotAgeGenderChart(customerData);
                plotBalanceChart(customerData);
                plotProductCountChart(customerData);
                plotServiceSupportChart(customerData);
                plotMaritalHousingChart(customerData);
                plotEducationEmploymentChart(customerData);
                plotIncomeSourceChart(customerData);
                plotTransactionFrequencyAmountChart(customerData);
                plotRetentionByMonthsInactiveChart(customerData);
                plotPaymentMethodChart(customerData);
                plotLoanAmountAndSalaryChart(customerData);
            }
            // Hide spinner after data is loaded
            document.getElementById("spinner-bg").style.opacity = "0";
            setTimeout(() => {
                // Code to be executed after 0.5 seconds
                document.getElementById("spinner-bg").remove();
            }, 500);
        })
        .catch(error => console.error('Error fetching dashboard data:', error));
}




function plotAgeGenderChart(customerData) {
    const ageRanges = [
        { min: 18, max: 20 },
        { min: 21, max: 25 },
        { min: 26, max: 30 },
        { min: 31, max: 35 },
        { min: 36, max: 40 },
        { min: 41, max: 45 },
        { min: 46, max: 50 },
        { min: 51, max: 55 },
        { min: 56, max: 60 },
        { min: 61, max: 65 },
        { min: 66, max: 70 },
        { min: 71, max: 75 },
        { min: 76, max: 80 },
        { min: 81, max: 85 },
        { min: 86, max: 90 },
        { min: 91, max: 95 }
    ];

    const populationData = ageRanges.reduce((acc, range) => {
        const ageGroup = `${range.min}-${range.max} years old`;
        acc[ageGroup] = { male: 0, female: 0 };
        return acc;
    }, {});

    customerData.forEach(customer => {
        const age = customer.Age;
        const gender = customer.Gender.toLowerCase();
        const ageGroup = ageRanges.find(range => age >= range.min && age <= range.max);
        if (ageGroup) {
            const ageGroupName = `${ageGroup.min}-${ageGroup.max} years old`;
            populationData[ageGroupName][gender]++;
        }
    });

    const chartData = Object.entries(populationData).map(([ageGroup, counts]) => ({
        age: ageGroup,
        male: counts.male,
        female: counts.female
    }));

    chartData.sort((a, b) => {
        const ageA = parseInt(a.age.split('-')[0], 10); 
        const ageB = parseInt(b.age.split('-')[0], 10);
        return ageA - ageB; 
    });

    const traceMale = {
        x: chartData.map(d => d.male),
        y: chartData.map(d => d.age),
        name: 'Male',
        type: 'bar',
        orientation: 'h',
        marker: { color: 'rgb(31, 119, 180)' } 
    };
    
    const traceFemale = {
        x: chartData.map(d => d.female),
        y: chartData.map(d => d.age),
        name: 'Female',
        type: 'bar',
        orientation: 'h',
        marker: { color: 'rgb(255, 105, 180)' } 
    };
    
    const data = [traceMale, traceFemale];
    
    const layout = {
        title: 'Population by Age Group and Gender',
        xaxis: { title: 'Population', tickformat: ',.0f' },
        yaxis: { title: 'Age Group', automargin: true }, 
        barmode: 'group',
        plot_bgcolor: 'rgba(240, 240, 240, 0.8)', 
        paper_bgcolor: 'rgba(240, 240, 240, 0.8)',
    };    
    
    Plotly.newPlot('age-gender-chart', data, layout);
}




function plotBalanceChart(customerData) {
    const balances = customerData.map(customer => customer['Balance']);

    const data = [{
        x: balances,
        type: 'histogram',
        marker: {
            color: 'rgba(153, 102, 255, 0.7)',
        },
        xbins: {
            start: 0,
            size: 5000
        }
    }];

    const layout = {
        title: 'Account Balance Distribution',
        xaxis: { title: 'Account Balance' },
        yaxis: { title: 'Frequency' },
        plot_bgcolor: 'rgba(240, 240, 240, 0.8)',
        paper_bgcolor: 'rgba(240, 240, 240, 0.8)',
    };

    Plotly.newPlot('account-balance-chart', data, layout);
}




function plotProductCountChart(customerData) {
    const productCounts = {};
    customerData.forEach(customer => {
        const count = customer["NumOfProducts"] || 0; 
        productCounts[count] = (productCounts[count] || 0) + 1;
    });

    let mostCommonCount = 0;
    let mostCommonCountFrequency = 0;
    for (const count in productCounts) {
        if (productCounts[count] > mostCommonCountFrequency) {
            mostCommonCount = count;
            mostCommonCountFrequency = productCounts[count];
        }
    }

    const data = [{
        x: Object.keys(productCounts),
        y: Object.values(productCounts),
        type: 'bar',
        marker: {
            color: Object.keys(productCounts).map(count => count == mostCommonCount ? 'rgb(128, 0, 128)' : 'rgb(186, 85, 211)'), 
        }
    }];

    const layout = {
        title: 'Number of Products per Customer',
        xaxis: { title: 'Number of Products' },
        yaxis: { title: 'Number of Customers' },
        plot_bgcolor: 'rgba(240, 240, 240, 0.8)',
        paper_bgcolor: 'rgba(240, 240, 240, 0.8)',
    };

    Plotly.newPlot('number-of-products-chart', data, layout);
}




function plotServiceSupportChart(customerData) {
    const serviceSupportFrequency = customerData.map(customer => customer["ServiceSupportFrequency"]);
    const supportSatisfaction = customerData.map(customer => customer["SupportSatisfaction"]);

    const trace = {
        x: supportSatisfaction, 
        y: serviceSupportFrequency,
        type: 'box',
        marker: {
            color: 'rgba(31, 119, 180, 0.7)'
        }
    };

    const layout = {
        title: 'Support Satisfaction vs. Service Support Frequency',
        xaxis: {title: 'Support Satisfaction'}, 
        yaxis: {title: 'Service Support Frequency'}, 
        plot_bgcolor: 'rgba(240, 240, 240, 0.8)', 
        paper_bgcolor: 'rgba(240, 240, 240, 0.8)', 
    };

    Plotly.newPlot('service-support-frequency-support-satisfaction-chart', [trace], layout);
}




function plotMaritalHousingChart(customerData) {
    const maritalStatus = Array.from(new Set(customerData.map(customer => customer["MaritalStatus"])));
    const housingStatus = Array.from(new Set(customerData.map(customer => customer["HousingStatus"])));

    const maritalData = {};
    maritalStatus.forEach(status => {
        maritalData[status] = Array(housingStatus.length).fill(0);
    });

    customerData.forEach(customer => {
        const marital = customer["MaritalStatus"];
        const housing = customer["HousingStatus"];
        const index = housingStatus.indexOf(housing);
        maritalData[marital][index]++;
    });

    const colors = ['#1f77b4', '#9467bd', '#800000']; 

    const traces = maritalStatus.map((status, i) => ({
        y: housingStatus,
        x: maritalData[status],
        name: status,
        type: 'bar',
        orientation: 'h', 
        marker: {
            color: colors[i] 
        }
    }));

    const layout = {
        title: 'Marital Status vs. Housing Status',
        barmode: 'group',
        plot_bgcolor: 'rgba(240, 240, 240, 0.8)',
        paper_bgcolor: 'rgba(240, 240, 240, 0.8)', 
        margin: {
            l: 100 
        }
    };

    Plotly.newPlot('marital-housing-chart', traces, layout);
}




function plotEducationEmploymentChart(customerData) {
    const educationLevels = Array.from(new Set(customerData.map(customer => customer["Education"])));
    const employmentStatuses = Array.from(new Set(customerData.map(customer => customer["EmploymentStatus"])));

    const educationData = {};
    educationLevels.forEach(level => {
        educationData[level] = Array(employmentStatuses.length).fill(0);
    });

    customerData.forEach(customer => {
        const education = customer["Education"];
        const employment = customer["EmploymentStatus"];
        const index = employmentStatuses.indexOf(employment);
        educationData[education][index]++;
    });

    const traces = educationLevels.map((level, i) => ({
        x: employmentStatuses,
        y: educationData[level],
        name: level,
        type: 'bar',
    }));

    const layout = {
        title: 'Education Level vs. Employment Status',
        barmode: 'group',
        xaxis: { title: 'Employment Status' },
        yaxis: { title: 'Count' },
        plot_bgcolor: 'rgba(240, 240, 240, 0.8)',
        paper_bgcolor: 'rgba(240, 240, 240, 0.8)',
        margin: {
            l: 100, 
            r: 50,
            t: 50,
            b: 100
        }
    };

    Plotly.newPlot('education-employment-chart', traces, layout);
}




function plotIncomeSourceChart(customerData) {
    const incomeCounts = {};

    customerData.forEach(customer => {
        const incomeSource = customer["IncomeSource"];
        incomeCounts[incomeSource] = (incomeCounts[incomeSource] || 0) + 1;
    });

    const incomeSources = Object.keys(incomeCounts);
    const counts = Object.values(incomeCounts);

    const incomeSourceData = [{
        type: 'scatterpolar',
        r: counts,
        theta: incomeSources,
        fill: 'toself',
        marker: {
            color: 'rgba(138,43,226,0.7)' 
        }
    }];

    const layout = {
        title: 'Income Source Distribution',
        polar: {
            radialaxis: {
                visible: true,
                range: [0, Math.max(...counts) + 5]
            }
        },
        showlegend: false,
        plot_bgcolor: 'rgba(240, 240, 240, 0.8)',
        paper_bgcolor: 'rgba(240, 240, 240, 0.8)',
    };

    Plotly.newPlot('income-source-chart', incomeSourceData, layout);
}




function plotTransactionFrequencyAmountChart(customerData) {
    const transactionFrequency = customerData.map(customer => customer["TransactionFreq"]);
    const transactionAmount = customerData.map(customer => customer["TransactionAmt"]);

    const trace = {
        x: transactionFrequency,
        y: transactionAmount,
        mode: 'markers', 
        type: 'scatter',
        marker: {
            color: 'rgba(0, 0, 139, 0.7)', 
            size: 8 
        }
    };

    const layout = {
        title: 'Transaction Frequency vs. Transaction Amount',
        xaxis: { title: 'Transaction Frequency' },
        yaxis: { title: 'Transaction Amount' },
        plot_bgcolor: 'rgba(240, 240, 240, 0.8)', 
        paper_bgcolor: 'rgba(240, 240, 240, 0.8)', 
    };

    Plotly.newPlot('transaction-frequency-transaction-amount-chart', [trace], layout);
}




function plotRetentionByMonthsInactiveChart(customerData) {
    const data = [];
    const monthsRetentionMap = new Map();

    customerData.forEach(entry => {
        const monthsInactive = entry["MonthsInactive"];
        const retentionRate = entry["Retention"];

        if (!monthsRetentionMap.has(monthsInactive)) {
            monthsRetentionMap.set(monthsInactive, []);
        }

        monthsRetentionMap.get(monthsInactive).push(retentionRate);
    });

    const colors = ['#FF69B4'];

    const traces = [];
    for (const [monthsInactive, retentionRates] of monthsRetentionMap.entries()) {
        traces.push({
            type: 'violin',
            x0: monthsInactive,
            y: retentionRates,
            box: { visible: true },
            meanline: { visible: true },
            line: { color: colors[monthsInactive % colors.length] }, 
            side: 'positive',
            spanmode: 'hard',
            name: `Months Inactive: ${monthsInactive}`
        });
    }

    const layout = {
        title: 'Retention Rates by Months Inactive',
        xaxis: {
            title: 'Months Inactive',
            range: [0, 8]
        },
        yaxis: {
            title: 'Retention Rate'
        },
        showlegend: false,
        plot_bgcolor: 'rgba(240, 240, 240, 0.8)', 
        paper_bgcolor: 'rgba(240, 240, 240, 0.8)', 
    };

    Plotly.newPlot('retention-months-inactive-chart', traces, layout);
}




function plotPaymentMethodChart(customerData) {
    const paymentMethodCounts = {};
    customerData.forEach(customer => {
        const paymentMethod = customer["PaymentMethod"];
        paymentMethodCounts[paymentMethod] = (paymentMethodCounts[paymentMethod] || 0) + 1;
    });

    const paymentMethods = Object.keys(paymentMethodCounts);
    const customerCounts = paymentMethods.map(method => paymentMethodCounts[method]);

    const sortedIndexes = customerCounts.map((count, index) => index).sort((a, b) => customerCounts[b] - customerCounts[a]);
    const sortedPaymentMethods = sortedIndexes.map(index => paymentMethods[index]);
    const sortedCustomerCounts = sortedIndexes.map(index => customerCounts[index]);

    sortedPaymentMethods.reverse();
    sortedCustomerCounts.reverse();

    const colors = sortedCustomerCounts.map((count, index) => {
        if (index === 0) return 'green'; 
        if (index === sortedCustomerCounts.length - 1) return 'red'; 
        return 'purple'; 
    });

    const trace = {
        x: sortedCustomerCounts,
        y: sortedPaymentMethods,
        type: 'bar',
        orientation: 'h',
        marker: {
            color: colors
        }
    };

    const layout = {
        title: 'Payment Method Distribution',
        xaxis: { title: 'Number of Customers' },
        yaxis: { title: 'Payment Method' },
        plot_bgcolor: 'rgba(240, 240, 240, 0.8)',
        paper_bgcolor: 'rgba(240, 240, 240, 0.8)',
        margin: { l: 150 }
    };

    Plotly.newPlot('payment-method-chart', [trace], layout);
}




function plotLoanAmountAndSalaryChart(customerData) {
    const loanAmounts = customerData.map(customer => customer["RelationshipCount"]);
    const estimatedSalaries = customerData.map(customer => customer["EstimatedSalary"]);

    const trace1 = {
        x: loanAmounts,
        name: 'Loan Amount',
        type: 'histogram',
        marker: {
            color: 'rgba(31, 119, 180, 0.7)'
        }
    };

    const trace2 = {
        x: estimatedSalaries,
        name: 'Estimated Salary',
        type: 'histogram',
        marker: {
            color: 'rgba(255, 127, 14, 0.7)' 
        }
    };

    const layout = {
        title: 'Loan Amount and Estimated Salary Distribution',
        xaxis: { title: 'Value' },
        yaxis: { title: 'Count' },
        barmode: 'overlay', 
        plot_bgcolor: 'rgba(240, 240, 240, 0.8)',
        paper_bgcolor: 'rgba(240, 240, 240, 0.8)',
    };

    Plotly.newPlot('loan-amount-salary-chart', [trace1, trace2], layout);
}

window.onload = function() {
    updateDashboardData(); // Call the function to update the dashboard data when the page loads
};
