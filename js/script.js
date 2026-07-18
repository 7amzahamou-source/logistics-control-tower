// ======================================================
// Logistics Control Tower
// AL-ASASYAH BASIC ELECTRONICS CO. LTD
// Powered by Hamza Hamou
// ======================================================

// ==============================
// API
// ==============================

const API_URL =
"https://script.google.com/macros/s/AKfycbwxeXHMi3yhgJXHBWyDYFUCkoVPEX_e_L__tNSXrFnB1uNrq10VWmOmDJ776pyz_PXS/exec";

// ==============================
// Global Variables
// ==============================

let shippingData = [];
let purchaseData = [];
let containersData = [];

let filteredShipments = [];
let filteredPurchases = [];
let filteredContainers = [];

// ==============================
// Page Load
// ==============================

document.addEventListener("DOMContentLoaded", () => {

    initializeSystem();

});

// ==============================
// Initialize System
// ==============================

async function initializeSystem() {

    try {

        showLoading();

        await loadData();

        initializeDashboard();

        initializeShipments();

        initializePurchaseOrders();

        initializeContainers();

        initializeCharts();

        hideLoading();

        console.log("System Ready");

    }

    catch (error) {

        console.error(error);

        hideLoading();

        alert("Failed to load data.");

    }

}

// ==============================
// Load Data
// ==============================

async function loadData() {

    const response = await fetch(API_URL);

    if (!response.ok) {

        throw new Error("API Error");

    }

    const data = await response.json();

    shippingData = data.SHIPPING1 || [];

    purchaseData = data.FOLLOW_UP || [];

    containersData = data.CONTAINERS || [];

    filteredShipments = [...shippingData];

    filteredPurchases = [...purchaseData];

    filteredContainers = [...containersData];

    console.log("Shipping:", shippingData.length);

    console.log("Purchase:", purchaseData.length);

    console.log("Containers:", containersData.length);

}

// ==============================
// Loading Screen
// ==============================

function showLoading() {

    document
        .getElementById("loading")
        .classList
        .add("show");

}

function hideLoading() {

    document
        .getElementById("loading")
        .classList
        .remove("show");

}// ======================================================
// Navigation
// ======================================================

function showPage(pageId, button) {

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active-page");
    });

    document.getElementById(pageId).classList.add("active-page");

    document.querySelectorAll(".menu-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    button.classList.add("active");

}

// ======================================================
// Dashboard
// ======================================================

function initializeDashboard() {

    loadDashboardCards();

    loadLatestShipments();

}

// ======================================================
// Dashboard Cards
// ======================================================

function loadDashboardCards() {

    // Total Shipments

    document.getElementById("shipmentCount").textContent =
        shippingData.length;

    // Total HQ

    const totalHQ = shippingData.reduce((sum, row) => {

        return sum + Number(row["HQ"] || 0);

    }, 0);

    document.getElementById("hqCount").textContent =
        totalHQ.toLocaleString();

    // Total Qty

    const totalQty = shippingData.reduce((sum, row) => {

        return sum + Number(row["QTY"] || 0);

    }, 0);

    document.getElementById("qtyCount").textContent =
        totalQty.toLocaleString();

    // Factories

    const factories = new Set(
        shippingData.map(r => r["FACTORY"])
    );

    document.getElementById("factoryCount").textContent =
        factories.size;

    // Shipping Lines

    const shippingLines = new Set(
        shippingData.map(r => r["Shipping Line"])
    );

    document.getElementById("shippingLineCount").textContent =
        shippingLines.size;

    // Forwarders

    const forwarders = new Set(
        shippingData.map(r => r["Forwarder"])
    );

    document.getElementById("forwarderCount").textContent =
        forwarders.size;

    // ETA This Month

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    let etaHQ = 0;

    shippingData.forEach(row => {

        const eta = new Date(row["ETA"]);

        if (

            !isNaN(eta) &&
            eta.getMonth() === currentMonth &&
            eta.getFullYear() === currentYear

        ) {

            etaHQ += Number(row["HQ"] || 0);

        }

    });

    document.getElementById("etaHQ").textContent =
        etaHQ.toLocaleString();

    // Total Containers

    document.getElementById("dashboardContainerCount").textContent =
        containersData.length;

}

// ======================================================
// Latest Shipments
// ======================================================

function loadLatestShipments() {

    const tbody =
        document.getElementById("latestShipmentTable");

    tbody.innerHTML = "";

    shippingData
        .slice(0, 10)
        .forEach(row => {

            tbody.innerHTML += `

<tr>

<td>${row["ENTRY"] || ""}</td>

<td>${row["FACTORY"] || ""}</td>

<td>${row["C/I No"] || ""}</td>

<td>${row["POL"] || ""}</td>

<td>${row["POD"] || ""}</td>

<td>${row["ETA"] || ""}</td>

<td>${row["HQ"] || ""}</td>

</tr>

`;

        });

}// ======================================================
// Shipments
// ======================================================

function initializeShipments() {

    loadShipmentFilters();

    renderShipments(filteredShipments);

}

// ======================================================
// Shipment Filters
// ======================================================

function loadShipmentFilters() {

    const factoryFilter =
        document.getElementById("factoryFilter");

    const shippingLineFilter =
        document.getElementById("shippingLineFilter");

    const forwarderFilter =
        document.getElementById("forwarderFilter");
        factoryFilter.innerHTML =
        
'<option value="">All Factories</option>';

shippingLineFilter.innerHTML =
'<option value="">All Shipping Lines</option>';

forwarderFilter.innerHTML =
'<option value="">All Forwarders</option>';

    
    
    [...new Set(shippingData.map(r => r["FACTORY"]))]

        .filter(Boolean)

        .sort()

        .forEach(factory => {

            factoryFilter.innerHTML +=
                `<option value="${factory}">${factory}</option>`;

        });

    [...new Set(shippingData.map(r => r["Shipping Line"]))]

        .filter(Boolean)

        .sort()

        .forEach(line => {

            shippingLineFilter.innerHTML +=
                `<option value="${line}">${line}</option>`;

        });

    [...new Set(shippingData.map(r => r["Forwarder"]))]

        .filter(Boolean)

        .sort()

        .forEach(forwarder => {

            forwarderFilter.innerHTML +=
                `<option value="${forwarder}">${forwarder}</option>`;

        });

}

// ======================================================
// Render Shipment Table
// ======================================================

function renderShipments(data) {

    const tbody =
        document.getElementById("shipmentTable");

    tbody.innerHTML = "";

    data.forEach(row => {

        tbody.innerHTML += `

<tr onclick="showShipmentDetails('${row["ENTRY"]}')">

<td>${row["ENTRY"] || ""}</td>

<td>${row["FACTORY"] || ""}</td>

<td>${row["C/I No"] || ""}</td>

<td>${row["POL"] || ""}</td>

<td>${row["POD"] || ""}</td>

<td>${row["ETA"] || ""}</td>

<td>${row["HQ"] || ""}</td>

<td>${row["Shipping Line"] || ""}</td>

<td>${row["Forwarder"] || ""}</td>

<td>${row["Bank Documents"] || ""}</td>

</tr>

`;

    });

}

// ======================================================
// Search + Filter
// ======================================================

function filterShipment() {

    const keyword =
        document
        .getElementById("shipmentSearchPage")
        .value
        .toLowerCase();

    const factory =
        document
        .getElementById("factoryFilter")
        .value;

    const shippingLine =
        document
        .getElementById("shippingLineFilter")
        .value;

    const forwarder =
        document
        .getElementById("forwarderFilter")
        .value;

    filteredShipments =
        shippingData.filter(row => {

            const text =
                JSON.stringify(row).toLowerCase();

            return (

                text.includes(keyword)

                &&

                (!factory ||
                    row["FACTORY"] === factory)

                &&

                (!shippingLine ||
                    row["Shipping Line"] === shippingLine)

                &&

                (!forwarder ||
                    row["Forwarder"] === forwarder)

            );

        });

    renderShipments(filteredShipments);

}

function searchShipment() {

    filterShipment();

}

// ======================================================
// Reset
// ======================================================

function resetShipment() {

    document.getElementById("shipmentSearchPage").value = "";

    document.getElementById("factoryFilter").value = "";

    document.getElementById("shippingLineFilter").value = "";

    document.getElementById("forwarderFilter").value = "";

    filteredShipments = [...shippingData];

    renderShipments(filteredShipments);

}// ======================================================
// Purchase Orders
// ======================================================

function initializePurchaseOrders() {

    loadPurchaseFilters();

    renderPurchaseOrders(filteredPurchases);

}
// ======================================================
// Purchase Filters
// ======================================================

function loadPurchaseFilters() {

    const status =
        document.getElementById("purchaseStatusFilter");

    status.innerHTML =
        '<option value="">All Status</option>';

    [...new Set(purchaseData.map(r => r["STATUS"]))]

        .filter(Boolean)

        .sort()

        .forEach(item => {

            status.innerHTML +=
                `<option value="${item}">${item}</option>`;

        });

}
// ======================================================
// Render Purchase Orders
// ======================================================

function renderPurchaseOrders(data) {

    const tbody =
        document.getElementById("purchaseTable");

    tbody.innerHTML = "";

    data.forEach(row => {

        tbody.innerHTML += `

<tr>

<td>${row["OrderID / PI NO"] || ""}</td>

<td>${row["Supplier"] || ""}</td>

<td>${row["MODELS"] || ""}</td>

<td>${row["TOTAL QTY"] || ""}</td>

<td>${row["SHIPPED"] || ""}</td>

<td>${row["REMAINING"] || ""}</td>

<td>

<span class="status ${getStatusClass(row["STATUS"])}">

${row["STATUS"] || ""}

</span>

</td>

</tr>

`;

    });

}

// ======================================================
// Purchase Search
// ======================================================

function searchPurchase() {

    const keyword =
        document
        .getElementById("purchaseSearch")
        .value
        .toLowerCase();

    filteredPurchases =
        purchaseData.filter(row => {

            return JSON.stringify(row)
                .toLowerCase()
                .includes(keyword);

        });

    renderPurchaseOrders(filteredPurchases);

}

// ======================================================
// Purchase Filter
// ======================================================

function filterPurchase() {

    const status =
        document
        .getElementById("purchaseStatusFilter")
        .value;

    filteredPurchases =
        purchaseData.filter(row => {

            return !status ||
                   row["STATUS"] === status;

        });

    renderPurchaseOrders(filteredPurchases);

}

// ======================================================
// Reset Purchase
// ======================================================

function resetPurchase() {

    document.getElementById("purchaseSearch").value = "";

    document.getElementById("purchaseStatusFilter").value = "";

    filteredPurchases = [...purchaseData];

    renderPurchaseOrders(filteredPurchases);

}

// ======================================================
// Status Color
// ======================================================

function getStatusClass(status) {

    if (!status) return "info";

    status = status.toLowerCase();

    if (status.includes("complete"))
        return "success";

    if (status.includes("finish"))
        return "success";

    if (status.includes("pending"))
        return "warning";

    if (status.includes("waiting"))
        return "warning";

    if (status.includes("delay"))
        return "danger";

    return "info";

}

// ======================================================
// Shipment Details
// ======================================================

function showShipmentDetails(entry) {

    const shipment =
        shippingData.find(row =>
            row["ENTRY"] == entry
        );

    if (!shipment) return;

    document
        .getElementById("detailsTitle")
        .textContent =
        shipment["ENTRY"];

    let html = "";

    Object.keys(shipment).forEach(key => {

        html += `

<div class="detail-item">

<label>${key}</label>

<span>${shipment[key] ?? ""}</span>

</div>

`;

    });

    document
        .getElementById("detailsBody")
        .innerHTML = html;

    document
        .getElementById("detailsPanel")
        .classList
        .add("open");

}

// ======================================================
// Close Details
// ======================================================

function closeDetails() {

    document
        .getElementById("detailsPanel")
        .classList
        .remove("open");

}
