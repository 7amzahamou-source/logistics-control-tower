// ======================================================
// Charts
// ======================================================

let analyticsFactoryChart;
let analyticsShippingChart;
let analyticsETAChart;
let analyticsWarehouseChart;

// ======================================================
// Initialize Charts
// ======================================================

function initializeCharts() {

    renderFactoryChart();

    renderShippingChart();

    renderETAChart();

    renderWarehouseChart();

}

// ======================================================
// HQ by Factory
// ======================================================

function renderFactoryChart() {

    const canvas =
        document.getElementById("analyticsFactoryChart");

    if (!canvas) return;

    if (analyticsFactoryChart)
        analyticsFactoryChart.destroy();

    const summary = {};

    shippingData.forEach(row => {

        const factory = row["FACTORY"] || "Unknown";

        summary[factory] = (summary[factory] || 0) + 1;

    });

    analyticsFactoryChart = new Chart(canvas, {

        type: "bar",

        data: {

            labels: Object.keys(summary),

            datasets: [{

                label: "HQ",

                data: Object.values(summary),

                borderWidth: 1

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {

                    display: false

                }

            }

        }

    });

}

// ======================================================
// HQ by Shipping Line
// ======================================================

function renderShippingChart() {

    const canvas =
        document.getElementById("analyticsShippingChart");

    if (!canvas) return;

    if (analyticsShippingChart)
        analyticsShippingChart.destroy();

    const summary = {};

    shippingData.forEach(row => {

        const line =
            row["Shipping Line"] || "Unknown";

        summary[line] =
            (summary[line] || 0) + 1;

    });

    analyticsShippingChart = new Chart(canvas, {

        type: "doughnut",

        data: {

            labels: Object.keys(summary),

            datasets: [{

                data: Object.values(summary)

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false

        }

    });

}

// ======================================================
// ETA by Month
// ======================================================

function renderETAChart() {

    const canvas =
        document.getElementById("analyticsETAChart");

    if (!canvas) return;

    if (analyticsETAChart)
        analyticsETAChart.destroy();

    const months = [

        "Jan", "Feb", "Mar", "Apr",
        "May", "Jun", "Jul", "Aug",
        "Sep", "Oct", "Nov", "Dec"

    ];

    const summary = new Array(12).fill(0);

    shippingData.forEach(row => {

        const eta = new Date(row["ETA"]);

        if (!isNaN(eta)) {

            summary[eta.getMonth()]++;

        }

    });

    analyticsETAChart = new Chart(canvas, {

        type: "line",

        data: {

            labels: months,

            datasets: [{

                label: "Shipments",

                data: summary,

                tension: 0.3,

                fill: false

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false

        }

    });

}

// ======================================================
// Warehouse Distribution
// ======================================================

function renderWarehouseChart() {

    const canvas =
        document.getElementById("analyticsWarehouseChart");

    if (!canvas) return;

    if (analyticsWarehouseChart)
        analyticsWarehouseChart.destroy();

    const summary = {};

    containersData.forEach(row => {

        const warehouse =
            row["الى مستودع"] || "Unknown";

        summary[warehouse] =
            (summary[warehouse] || 0) + 1;

    });

    analyticsWarehouseChart = new Chart(canvas, {

        type: "pie",

        data: {

            labels: Object.keys(summary),

            datasets: [{

                data: Object.values(summary)

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false

        }

    });

}
