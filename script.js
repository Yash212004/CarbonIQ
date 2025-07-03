// Constants for calculations and thresholds
const EMISSION_FACTORS = {
    coal: {
        surface: 0.8,    // tCO2e/ton of coal
        underground: 1.2  // tCO2e/ton of coal
    },
    transport: {
        rail: 0.02,      // tCO2e/ton-km
        road: 0.05,      // tCO2e/ton-km
        sea: 0.01        // tCO2e/ton-km
    },
    electricity: 0.5,    // tCO2e/MWh
    fuel: 2.68           // tCO2e/kL diesel
};

const THRESHOLDS = {
    sulfurContent: 1.0,  // %
    moistureContent: 15,  // %
    ashContent: 10,      // %
    renewableEnergy: 30,  // %
    transportDistance: 500 // km
};

// Chart instances
let emissionsChart = null;
let sourcesChart = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeCharts();
    document.getElementById('calculateBtn').addEventListener('click', calculateCarbonFootprint);
});

// Initialize Charts
function initializeCharts() {
    const emissionsCtx = document.getElementById('emissionsChart').getContext('2d');
    emissionsChart = new Chart(emissionsCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Monthly Emissions (tCO2e)',
                data: [0, 0, 0, 0, 0, 0],
                borderColor: '#2ecc71',
                tension: 0.4,
                fill: false
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Monthly Emissions Trend'
                }
            }
        }
    });

    const sourcesCtx = document.getElementById('sourcesChart').getContext('2d');
    sourcesChart = new Chart(sourcesCtx, {
        type: 'pie',
        data: {
            labels: ['Mining', 'Transportation', 'Energy Use'],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: ['#2ecc71', '#3498db', '#e74c3c']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Emissions by Source'
                }
            }
        }
    });
}

// Main calculation function
function calculateCarbonFootprint() {
    // Get all input values
    const inputs = {
        // Coal Quality
        calorificValue: Number(document.getElementById('calorificValue').value) || 0,
        sulfurContent: Number(document.getElementById('sulfurContent').value) || 0,
        moistureContent: Number(document.getElementById('moistureContent').value) || 0,
        ashContent: Number(document.getElementById('ashContent').value) || 0,

        // Mining Data
        coalProduction: Number(document.getElementById('coalProduction').value) || 0,
        miningMethod: document.getElementById('miningMethod').value || 'surface',

        // Energy
        electricityUsage: Number(document.getElementById('electricityUsage').value) || 0,
        fuelUsage: Number(document.getElementById('fuelUsage').value) || 0,
        renewablePercentage: Number(document.getElementById('renewablePercentage').value) || 0,

        // Transport
        transportMode: document.getElementById('transportMode').value || 'road',
        distance: Number(document.getElementById('distance').value) || 0
    };

    // Calculate emissions
    const emissions = {
        mining: calculateMiningEmissions(inputs),
        transport: calculateTransportEmissions(inputs),
        energy: calculateEnergyEmissions(inputs)
    };

    // Update displays
    updateResults(emissions);
    updateCharts(emissions);
    generateRecommendations(inputs, emissions);
    generateEnhancedRecommendations(inputs, emissions, calculateMetrics(inputs)); // New call
}

// Calculate Mining Emissions
function calculateMiningEmissions(inputs) {
    const emissionFactor = EMISSION_FACTORS.coal[inputs.miningMethod] || EMISSION_FACTORS.coal.surface;
    return inputs.coalProduction * emissionFactor;
}

// Calculate Transport Emissions
function calculateTransportEmissions(inputs) {
    const emissionFactor = EMISSION_FACTORS.transport[inputs.transportMode] || EMISSION_FACTORS.transport.road;
    return inputs.coalProduction * inputs.distance * emissionFactor;
}

// Calculate Energy Emissions
function calculateEnergyEmissions(inputs) {
    const electricityEmissions = (inputs.electricityUsage / 1000) * EMISSION_FACTORS.electricity;
    const fuelEmissions = (inputs.fuelUsage / 1000) * EMISSION_FACTORS.fuel;
    return electricityEmissions + fuelEmissions;
}

// Update Charts
function updateCharts(emissions) {
    // Update Sources Chart
    sourcesChart.data.datasets[0].data = [
        emissions.mining,
        emissions.transport,
        emissions.energy
    ];
    sourcesChart.update();

    // Update Emissions Chart (adding new data point)
    const totalEmissions = Object.values(emissions).reduce((a, b) => a + b, 0);
    emissionsChart.data.datasets[0].data.push(totalEmissions);
    emissionsChart.data.datasets[0].data.shift(); // Remove oldest data point
    emissionsChart.update();
}

// Update Results Display
function updateResults(emissions) {
    const totalEmissions = Object.values(emissions).reduce((a, b) => a + b, 0);
    const carbonIntensity = totalEmissions / (Number(document.getElementById('coalProduction').value) || 1);

    // Mock previous month's data
    const previousMonthEmissions = totalEmissions * 1.1;
    const emissionReduction = ((previousMonthEmissions - totalEmissions) / previousMonthEmissions * 100);

    // Update display elements
    document.getElementById('totalEmissions').textContent = totalEmissions.toFixed(2);
    document.getElementById('carbonIntensity').textContent = carbonIntensity.toFixed(2);
    document.getElementById('emissionReduction').textContent = `${emissionReduction.toFixed(1)}`;
}



// Generate and display recommendations based on inputs and emissions
function generateRecommendations(inputs, emissions) {
    const recommendationsList = document.getElementById('recommendationsList');
    recommendationsList.innerHTML = '';

    const recommendations = [
        {
            text: `Reduce mining emissions (${emissions.mining.toFixed(2)} tCO2e/month) through efficient operations. Priority: ${emissions.mining > 1000 ? 'High' : 'Medium'}.`,
            priority: emissions.mining > 1000 ? 'high' : 'medium'
        },
        {
            text: `Optimize transport emissions (${emissions.transport.toFixed(2)} tCO2e/month) by considering alternative modes. Priority: ${emissions.transport > 500 ? 'High' : 'Medium'}.`,
            priority: emissions.transport > 500 ? 'high' : 'medium'
        },
        {
            text: `Improve energy efficiency (${emissions.energy.toFixed(2)} tCO2e/month) through renewable energy adoption. Priority: ${emissions.energy > 800 ? 'High' : 'Medium'}.`,
            priority: emissions.energy > 800 ? 'high' : 'medium'
        },
        {
            text: `Implement carbon capture and storage (CCS) technologies to reduce overall emissions by capturing CO2 directly from mining operations. Priority: ${emissions.mining > 800 ? 'High' : 'Medium'}.`,
            priority: emissions.mining > 800 ? 'high' : 'medium'
        },
        {
            text: `Consider afforestation and reforestation initiatives to increase carbon sinks and offset emissions. Priority: ${totalEmissions > 1000 ? 'High' : 'Medium'}.`,
            priority: totalEmissions > 1000 ? 'high' : 'medium'
        },
        {
            text: `Upgrade mining equipment to the latest models that have better fuel efficiency and lower emissions. Priority: ${emissions.mining > 1200 ? 'High' : 'Medium'}.`,
            priority: emissions.mining > 1200 ? 'high' : 'medium'
        },
        {
            text: `Adopt electric or hybrid vehicles for transportation within mining operations to significantly cut down transport emissions. Priority: ${emissions.transport > 700 ? 'High' : 'Medium'}.`,
            priority: emissions.transport > 700 ? 'high' : 'medium'
        },
        {
            text: `Engage in regular training for employees on sustainable practices and emissions reduction strategies. Priority: ${totalEmissions > 500 ? 'Medium' : 'Low'}.`,
            priority: totalEmissions > 500 ? 'medium' : 'low'
        },
        {
            text: `Establish a carbon management plan that includes regular monitoring and reporting of emissions to track progress. Priority: Medium.`,
            priority: 'medium'
        }
    ];

    recommendations.forEach(rec => {
        const li = document.createElement('li');
        li.textContent = rec.text;
        li.style.color = rec.priority === 'high' ? 'red' : 'orange';
        recommendationsList.appendChild(li);
    });
}

// Enhanced Recommendations
function generateEnhancedRecommendations(inputs, emissions, metrics) {
    const enhancedRecommendationsList = document.getElementById('enhancedRecommendationsList');
    enhancedRecommendationsList.innerHTML = '';

    const enhancedRecommendations = [
        {
            text: `Consider switching to a hybrid mining method that combines surface and underground techniques to optimize emissions. This method can balance efficiency and environmental impact.`,
            condition: metrics.calorificValue > 5500 && emissions.mining > 1000
        },
        {
            text: `If the sulfur content exceeds ${THRESHOLDS.sulfurContent}%, consider pre-treatment of coal to lower emissions.`,
            condition: inputs.sulfurContent > THRESHOLDS.sulfurContent
        },
        {
            text: `With a moisture content over ${THRESHOLDS.moistureContent}%, explore drying techniques to improve calorific efficiency.`,
            condition: inputs.moistureContent > THRESHOLDS.moistureContent
        },
        {
            text: `For ash content above ${THRESHOLDS.ashContent}%, implement ash management systems to minimize environmental impact.`,
            condition: inputs.ashContent > THRESHOLDS.ashContent
        },
        {
            text: `If the renewable energy mix is below ${THRESHOLDS.renewableEnergy}%, prioritize investments in renewable projects to enhance sustainability.`,
            condition: inputs.renewablePercentage < THRESHOLDS.renewableEnergy
        },
        {
            text: `For transport distances over ${THRESHOLDS.transportDistance} km, consider establishing local processing facilities to reduce transportation emissions.`,
            condition: inputs.distance > THRESHOLDS.transportDistance
        }
    ];

    enhancedRecommendations.forEach(rec => {
        if (rec.condition) {
            const li = document.createElement('li');
            li.textContent = rec.text;
            li.style.color = 'blue'; // Distinguish enhanced recommendations
            enhancedRecommendationsList.appendChild(li);
        }
    });
}

// Calculate Metrics
function calculateMetrics(inputs) {
    return {
        calorificValue: inputs.calorificValue,
        sulfurContent: inputs.sulfurContent,
        moistureContent: inputs.moistureContent,
        ashContent: inputs.ashContent,
        renewablePercentage: inputs.renewablePercentage,
        distance: inputs.distance
    };
}
