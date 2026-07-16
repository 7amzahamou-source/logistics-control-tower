// ======================================================
// Logistics Control Tower
// Version 3.0
// Developed by Hamza Hamou
// ======================================================

// ======================================================
// API
// ======================================================

const API_URL =
"https://script.google.com/macros/s/AKfycbwxeXHMi3yhgJXHBWyDYFUCkoVPEX_e_L__tNSXrFnB1uNrq10VWmOmDJ776pyz_PXS/exec";

// ======================================================
// GLOBAL DATA
// ======================================================

let shipments = [];
let purchaseOrders = [];
let containers = [];

// ======================================================
// FILTERED DATA
// ======================================================

let filteredShipments = [];
let filteredPurchaseOrders = [];
let filteredContainers = [];

// ======================================================
// CHARTS
// ======================================================

let factoryChart = null;
let etaChart = null;

// ======================================================
// SYSTEM
// ======================================================

let sortDirection = {};

// ======================================================
// START
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("=================================");
    console.log("Logistics Control Tower Started");
    console.log("=================================");

    loadData();

});

// ======================================================
// LOAD DATA FROM GOOGLE APPS SCRIPT
// ======================================================

async function loadData(){

    try{

        console.log("Connecting API...");

        const response = await fetch(API_URL);

        if(!response.ok){

            throw new Error("API ERROR");

        }

        const data = await response.json();

        shipments = Array.isArray(data.SHIPPING1)
            ? data.SHIPPING1
            : [];

        purchaseOrders = Array.isArray(data.FOLLOW_UP)
            ? data.FOLLOW_UP
            : [];

        containers = Array.isArray(data.CONTAINERS)
            ? data.CONTAINERS
            : [];

        filteredShipments = [...shipments];
        filteredPurchaseOrders = [...purchaseOrders];
        filteredContainers = [...containers];

        console.log("Shipments :", shipments.length);
        console.log("Purchase Orders :", purchaseOrders.length);
        console.log("Containers :", containers.length);

        initializeSystem();

    }

    catch(error){

        console.error(error);

        alert("Unable to load Google Apps Script.");

    }

}

// ======================================================
// INITIALIZE
// ======================================================

function initializeSystem(){

    console.log("Initializing System...");

    renderDashboard();

    buildShipmentTable();

    buildPurchaseOrders();

    loadContainers(filteredContainers);

}

// ======================================================
// DATE FORMAT
// ======================================================

function formatDate(value){

    if(!value) return "-";

    const date = new Date(value);

    if(isNaN(date)) return value;

    return date.toLocaleDateString("en-GB");

}// ======================================================
// PAGE NAVIGATION
// ======================================================

function showPage(pageId){

    document.querySelectorAll(".page").forEach(page=>{

        page.classList.remove("active-page");

    });

    document.getElementById(pageId).classList.add("active-page");

    document.querySelectorAll(".menu-btn").forEach(btn=>{

        btn.classList.remove("active");

    });

    if(event){

        event.target.classList.add("active");

    }

}

// ======================================================
// DASHBOARD
// ======================================================

function renderDashboard(){

    updateDashboardKPIs();

    if(typeof drawFactoryChart === "function"){

        drawFactoryChart(filteredShipments);

    }

    if(typeof drawETAChart === "function"){

        drawETAChart(filteredShipments);

    }

}

// ======================================================
// KPI
// ======================================================

function updateDashboardKPIs(){

    document.getElementById("shipmentCount").textContent =
        filteredShipments.length.toLocaleString();

    const totalHQ = filteredShipments.reduce((sum,row)=>{

        return sum + Number(row["HQ"] || 0);

    },0);

    document.getElementById("hqCount").textContent =
        totalHQ.toLocaleString();

    const totalQty = filteredShipments.reduce((sum,row)=>{

        return sum + Number(row["QTY"] || 0);

    },0);

    document.getElementById("qtyCount").textContent =
        totalQty.toLocaleString();

    const factories = [...new Set(

        filteredShipments.map(row=>row["FACTORY"])

    )];

    document.getElementById("factoryCount").textContent =
        factories.length;

    let factoryCounter = {};

    filteredShipments.forEach(row=>{

        const f = row["FACTORY"] || "-";

        factoryCounter[f] = (factoryCounter[f] || 0) + 1;

    });

    let topFactory = "-";

    let max = 0;

    Object.keys(factoryCounter).forEach(factory=>{

        if(factoryCounter[factory] > max){

            max = factoryCounter[factory];

            topFactory = factory;

        }

    });

    document.getElementById("topFactory").textContent =
        topFactory;

    const today = new Date();

    const month = today.getMonth();

    const year = today.getFullYear();

    const etaHQ = filteredShipments.filter(row=>{

        if(!row["ETA"]) return false;

        const eta = new Date(row["ETA"]);

        return eta.getMonth() === month &&
               eta.getFullYear() === year;

    }).length;

    document.getElementById("etaHQ").textContent =
        etaHQ.toLocaleString();

}// ======================================================
// SHIPMENTS TABLE
// ======================================================

function buildShipmentTable(){

    const tbody = document.getElementById("shipmentTable");

    if(!tbody) return;

    let html = "";

    filteredShipments.forEach(row=>{

        html += `

        <tr>

            <td>${row["ENTRY"] || "-"}</td>

            <td>${row["FACTORY"] || "-"}</td>

            <td>${row["FORWARDER"] || "-"}</td>

            <td>${row["POL"] || "-"}</td>

            <td>${row["POD"] || "-"}</td>

            <td>${formatDate(row["ETA"])}</td>

            <td>${Number(row["HQ"] || 0).toLocaleString()}</td>

        </tr>

        `;

    });

    tbody.innerHTML = html;

}

// ======================================================
// REFRESH SHIPMENTS
// ======================================================

function refreshShipments(){

    buildShipmentTable();

    updateDashboardKPIs();

    if(typeof drawFactoryChart === "function"){

        drawFactoryChart(filteredShipments);

    }

    if(typeof drawETAChart === "function"){

        drawETAChart(filteredShipments);

    }

}

// ======================================================
// SHIPMENT SEARCH
// ======================================================

function searchShipments(keyword){

    keyword = String(keyword).toLowerCase();

    filteredShipments = shipments.filter(row=>{

        return Object.values(row).join(" ")

            .toLowerCase()

            .includes(keyword);

    });

    refreshShipments();

}

// ======================================================
// RESET SHIPMENTS
// ======================================================

function resetShipments(){

    filteredShipments = [...shipments];

    refreshShipments();

}// ======================================================
// PURCHASE ORDERS
// ======================================================

function buildPurchaseOrders(){

    const tbody = document.getElementById("purchaseTable");

    if(!tbody) return;

    let html = "";

    filteredPurchaseOrders.forEach(row=>{

        html += `

        <tr>

            <td>${row["OrderID / PI NO"] || "-"}</td>

            <td>${row["Supplier"] || "-"}</td>

            <td>${row["MODELS"] || "-"}</td>

            <td>${Number(row["TOTAL QTY"] || 0).toLocaleString()}</td>

            <td>${Number(row["SHIPPED"] || 0).toLocaleString()}</td>

            <td>${Number(row["REMAINING"] || 0).toLocaleString()}</td>

            <td>${row["STATUS"] || "-"}</td>

        </tr>

        `;

    });

    tbody.innerHTML = html;

}

// ======================================================
// PURCHASE SEARCH
// ======================================================

function searchPurchase(keyword){

    keyword = keyword.toLowerCase();

    filteredPurchaseOrders = purchaseOrders.filter(row=>{

        return Object.values(row)

            .join(" ")

            .toLowerCase()

            .includes(keyword);

    });

    buildPurchaseOrders();

}

// ======================================================
// RESET PURCHASE
// ======================================================

function resetPurchase(){

    filteredPurchaseOrders = [...purchaseOrders];

    buildPurchaseOrders();

}
