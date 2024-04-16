function updateDashboardData() {
    fetch(`/api/results/Demographics-Hub?token_id=${encodeURIComponent(token_id)}`)
        .then(response => response.json())
        .then(data => {
            if (data['error']) {
                document.querySelector('.dashboard-section').innerHTML = "<h1 class='result-error'>ERROR: "+data["error"]+"</h1>";
            } else {
                const customerData = data['Filtered Data'];

                document.querySelector('.top-panels .panel:nth-child(1) p').innerText = customerData.length;

                const tenureValues = customerData.map(customer => customer["Tenure"]);
                const sumOfTenure = tenureValues.reduce((total, tenure) => total + tenure, 0);
                document.querySelector('.top-panels .panel:nth-child(2) p').innerText = Math.floor(sumOfTenure / customerData.length) + " Months";

                const moaValues = customerData.map(customer => customer["MarketingOffersAcceptance"]);
                const sumOfMOA = moaValues.reduce((total, moa) => total + moa, 0);
                document.querySelector('.top-panels .panel:nth-child(3) p').innerText = Math.round((sumOfMOA / customerData.length) * 100) + " %";

                const acpValues = customerData.map(customer => customer["average_Churned_proba"]);
                const sumOfACP = acpValues.reduce((total, acp) => total + acp, 0);
                document.querySelector('.top-panels .panel:nth-child(4) p').innerText = Math.round((sumOfACP / customerData.length) * 100) + " %";

                const adpValues = customerData.map(customer => customer["average_Dormant_proba"]);
                const sumOfADP = adpValues.reduce((total, adp) => total + adp, 0);
                document.querySelector('.top-panels .panel:nth-child(5) p').innerText = Math.round((sumOfADP / customerData.length) * 100) + " %";

                const cssValues = customerData.map(customer => customer["BrandSatisfaction"]);
                const sumOfCSS = cssValues.reduce((total, css) => total + css, 0);
                document.querySelector('.top-panels .panel:nth-child(6) p').innerText = Math.floor(sumOfCSS / customerData.length) + " out of 5";

                plotAgeGenderChart(customerData);
                plotProductCountChart(customerData);
                plotEducationEmploymentChart(customerData);
                plotMaritalHousingChart(customerData);
                plotIncomeSourceChart(customerData);
                plotBalanceChart(customerData);
                plotPaymentMethodChart(customerData);
                plotTransactionFrequencyAmountChart(customerData);
                plotLoanAmountAndSalaryChart(customerData);
                plotServiceSupportChart(customerData);
                plotRetentionByMonthsInactiveChart(customerData);
                plotChangeInBehaviourChart(customerData);
                plotFeatureSupportChart(customerData);
                plotDependentsCountChart(customerData);
                plotChurnLikelihoodChart(customerData);
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




const GXS_colors = {
    eggplant500: '#0c0120',
    neon100: '#af89f4',
    pearl500: '#fafafa',
    eggplant100: '#453b59',
    black100: '#878787',
    neon500: '#771fff',
    black300: '#2b2b2b',
    thunder500: '#ffd500',
    gum500: '#f8326d',
    mint500: '#75f9aa',
    bolt500: '#4cc9f0',
    candy500: '#ff96d2',
    mint300: '#a7f8c7',
    candy300: '#ffabdb',
    thunder100: '#fff7b1',
    gum100: '#ffbcc8',
    neon300: '#8653e3',
    egg300: '#272036',
    bolt300: '#98e6ff',
    thunder300: '#ffe666',
    candy100: '#ffd5ed',
    black500: 'black',
    mint100: '#d4fce4',
    pearl300: '#eee',
    bolt100: '#c1f0ff',
    gum300: '#f66f87',
    pearl100: '#e9e9e9'
};




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
        marker: { 
            color: GXS_colors.bolt500,
            line: { 
                color: 'rgba(0,0,0,0.5)', 
                width: 1
            }
        }
    };
    
    const traceFemale = {
        x: chartData.map(d => d.female),
        y: chartData.map(d => d.age),
        name: 'Female',
        type: 'bar',
        orientation: 'h',
        marker: { 
            color: GXS_colors.candy500,
            line: { 
                color: 'rgba(0,0,0,0.5)', 
                width: 1
            }
        }
    };
    
    const data = [traceMale, traceFemale];
    
    const layout = {
        title: 'Population by Age Group and Gender',
        xaxis: { title: 'Count', tickformat: ',.0f' },
        yaxis: { title: 'Age Group', automargin: true }, 
        barmode: 'group',
        plot_bgcolor: GXS_colors.pearl100, 
        paper_bgcolor: GXS_colors.pearl100,
    };    
    
    Plotly.newPlot('age-gender-chart', data, layout);
}




function plotBalanceChart(customerData) {
    const balances = customerData.map(customer => customer['Balance']);

    const data = [{
        x: balances,
        type: 'histogram',
        marker: {
            color: GXS_colors.black500,
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
        plot_bgcolor: GXS_colors.pearl100, 
        paper_bgcolor: GXS_colors.pearl100,
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
            color: Object.keys(productCounts).map(count => count == mostCommonCount ? GXS_colors.eggplant500 : GXS_colors.neon300), 
            line: { 
                color: 'rgba(0,0,0,0.5)', 
                width: 2
            }
        }
    }];

    const layout = {
        title: 'Number of Products per Customer',
        xaxis: { title: 'Number of Products' },
        yaxis: { title: 'Count' },
        plot_bgcolor: GXS_colors.pearl100, 
        paper_bgcolor: GXS_colors.pearl100,
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
            color: GXS_colors.gum300
        }
    };

    const layout = {
        title: 'Service Support Frequency vs. Support Satisfaction',
        xaxis: {title: 'Support Satisfaction'}, 
        yaxis: {title: 'Service Support Frequency'}, 
        plot_bgcolor: GXS_colors.pearl100, 
        paper_bgcolor: GXS_colors.pearl100,
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

    const colors = [GXS_colors.egg300, GXS_colors.neon300, GXS_colors.gum300, GXS_colors.bolt300]; 

    const traces = maritalStatus.map((status, i) => ({
        y: housingStatus,
        x: maritalData[status],
        name: status,
        type: 'bar',
        orientation: 'h', 
        marker: {
            color: colors[i],
            line: { 
                color: 'rgba(0,0,0,0.5)', 
                width: 2
            }
        }
    }));

    const layout = {
        title: 'Population by Marital Status & Housing Status',
        xaxis: { title: 'Count' },
        barmode: 'group',
        plot_bgcolor: GXS_colors.pearl100, 
        paper_bgcolor: GXS_colors.pearl100,
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

    const colors = [
        GXS_colors.eggplant500,
        GXS_colors.neon100,
        GXS_colors.bolt300,
        GXS_colors.gum100,
        GXS_colors.black100,
        GXS_colors.neon500,
        GXS_colors.mint500,
        GXS_colors.thunder500
    ];

    const traces = educationLevels.map((level, i) => ({
        x: employmentStatuses,
        y: educationData[level],
        name: level,
        type: 'bar',
        marker: {
            color: colors[i],
            line: { 
                color: 'rgba(0,0,0,0.5)', 
                width: 1
            }
        }
    }));

    const layout = {
        title: 'Population by Education Level & Employment Status',
        barmode: 'group',
        yaxis: { title: 'Count' },
        plot_bgcolor: GXS_colors.pearl100, 
        paper_bgcolor: GXS_colors.pearl100,
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
            color: GXS_colors.gum500
        }
    }];

    const layout = {
        title: 'Income Source Distribution Overview',
        polar: {
            radialaxis: {
                visible: true,
                range: [0, Math.max(...counts) + 5]
            }
        },
        showlegend: false,
        plot_bgcolor: GXS_colors.pearl100, 
        paper_bgcolor: GXS_colors.pearl100,
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
            color: GXS_colors.bolt500, 
            size: 8 
        }
    };

    const layout = {
        title: 'Transaction Amount vs. Transaction Frequency',
        xaxis: { title: 'Transaction Frequency' },
        yaxis: { title: 'Transaction Amount' },
        plot_bgcolor: GXS_colors.pearl100, 
        paper_bgcolor: GXS_colors.pearl100,
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

    const colors = [GXS_colors.black100];

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
            range: [0, 13]
        },
        yaxis: {
            title: 'Retention Rate'
        },
        showlegend: false,
        plot_bgcolor: GXS_colors.pearl100, 
        paper_bgcolor: GXS_colors.pearl100,
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
        if (index === 0) return GXS_colors.gum300; 
        if (index === sortedCustomerCounts.length - 1) return GXS_colors.mint500; 
        return GXS_colors.thunder300; 
    });

    const trace = {
        x: sortedCustomerCounts,
        y: sortedPaymentMethods,
        type: 'bar',
        orientation: 'h',
        marker: {
            color: colors,
            line: { 
                color: 'rgba(0,0,0,0.5)', 
                width: 2
            }
        }
    };

    const layout = {
        title: 'Payment Method',
        xaxis: { title: 'Count' },
        plot_bgcolor: GXS_colors.pearl100, 
        paper_bgcolor: GXS_colors.pearl100,
        margin: { l: 150 }
    };

    Plotly.newPlot('payment-method-chart', [trace], layout);
}




function plotLoanAmountAndSalaryChart(customerData) {
    const loanAmounts = customerData.map(customer => customer["LoanAmt"]);
    const estimatedSalaries = customerData.map(customer => customer["EstimatedSalary"]);

    const trace = {
        x: loanAmounts,
        y: estimatedSalaries,
        mode: 'markers',
        marker: {
            color: GXS_colors.neon100, 
            size: 10, 
            opacity: 0.5 
        },
        name: 'Loan Amount', 
        type: 'scatter' 
    };

    const layout = {
        title: 'Estimated Salary vs. Loan Amount',
        xaxis: { title: 'Loan Amount' }, 
        yaxis: { title: 'Estimated Salary' },
        plot_bgcolor: GXS_colors.pearl100, 
        paper_bgcolor: GXS_colors.pearl100,
    };

    Plotly.newPlot('loan-amount-salary-chart', [trace], layout);
}




function plotChangeInBehaviourChart(customerData) {
    const feature1 = customerData.map(customer => customer["ChangeInBehaviourMkt"]);
    const feature2 = customerData.map(customer => customer["ChangeInBehaviourCust"]);

    const colorScale = [
        [0.0, '#ffffff'],
        [0.1, '#fcffa4'],
        [0.2, '#f7d32e'],
        [0.3, '#fb9c06'],
        [0.4, '#ed6925'],
        [0.5, '#cf4446'],
        [0.6, '#a52c60'],
        [0.7, '#781c6d'],
        [0.8, '#4a0c6b'],
        [0.9, '#1b0c41'],
        [1.0, '#000004']
    ];

    const trace = {
        x: feature1,
        y: feature2,
        type: 'histogram2dcontour',
        colorscale: colorScale,
    };

    const data = [trace];

    const layout = {
        title: 'Customer Reaction',
        xaxis: { title: "Change In Behaviour after GXS' Marketing" },
        yaxis: { title: 'Change In Behaviour after Customer Support' },
        plot_bgcolor: GXS_colors.pearl100, 
        paper_bgcolor: GXS_colors.pearl100,
    };

    Plotly.newPlot('change-in-behaviour-chart', data, layout);
}




function plotFeatureSupportChart(customerData) {
    const featureSupportFrequency = customerData.map(customer => customer["FeatureSupportFrequency"]);
    const featureSatisfaction = customerData.map(customer => customer["FeatureSatisfaction"]);

    const trace = {
        x: featureSatisfaction, 
        y: featureSupportFrequency,
        type: 'box',
        marker: {
            color: GXS_colors.bolt500
        }
    };

    const layout = {
        title: 'Feature Support Frequency vs. Feature Satisfaction',
        xaxis: {title: 'Feature Satisfaction'}, 
        yaxis: {title: 'Feature Support Frequency'}, 
        plot_bgcolor: GXS_colors.pearl100, 
        paper_bgcolor: GXS_colors.pearl100,
    };

    Plotly.newPlot('feature-support-frequency-satisfaction-chart', [trace], layout);
}




function plotDependentsCountChart(customerData) {
    const dependentsCount = {};

    customerData.forEach(customer => {
        const dependents = customer["Dependents"];

        dependentsCount[dependents] = (dependentsCount[dependents] || 0) + 1;
    });

    const xValues = Object.keys(dependentsCount);
    const yValues = Object.values(dependentsCount);

    const maxIndex = yValues.indexOf(Math.max(...yValues));

    const colors = yValues.map((value, index) => {
        return index === maxIndex ? GXS_colors.gum500 : GXS_colors.gum100;
    });

    const trace = {
        x: yValues,
        y: xValues,
        type: 'bar',
        orientation: 'h',
        marker: {
            color: colors,
            line: {
                color: 'rgba(0,0,0,0.5)',
                width: 2
            }
        }
    };

    const layout = {
        title: "Customers' Dependents Distribution",
        xaxis: { title: 'Frequency' },
        yaxis: { title: 'Number of Dependents' },
        plot_bgcolor: GXS_colors.pearl100, 
        paper_bgcolor: GXS_colors.pearl100,
    };

    Plotly.newPlot('dependents-count-chart', [trace], layout);
}




function plotChurnLikelihoodChart(customerData) {
    const churnLikelihoodData = customerData.map(customer => customer["average_Churned_proba"]);

    const data = [{
        x: churnLikelihoodData,
        type: 'histogram',
        marker: {
            color: GXS_colors.neon300,
        },
        xbins: {
            start: 0,
            size: 0.01
        }
    }];

    const layout = {
        title: 'Churn Likelihood Distribution',
        xaxis: {title: 'Churn Likelihood'},
        yaxis: {title: 'Frequency'},
        plot_bgcolor: GXS_colors.pearl100, 
        paper_bgcolor: GXS_colors.pearl100,
    };

    Plotly.newPlot('churn-likelihood-chart', data, layout);
}

window.onload = function() {
    updateDashboardData(); // Call the function to update the dashboard data when the page loads
};
