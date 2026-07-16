// ======================================================
// CONFIG
// ======================================================

const API_URL = "https://script.google.com/macros/s/AKfycbwxeXHMi3yhgJXHBWyDYFUCkoVPEX_e_L__tNSXrFnB1uNrq10VWmOmDJ776pyz_PXS/exec";

// ======================================================
// GLOBAL VARIABLES
// ======================================================

let shipments = [];
let purchaseOrders = [];
let containers = [];

// ======================================================
// LOAD DATA
// ======================================================

document.addEventListener("DOMContentLoaded", loadData);

async function loadData() {

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("API Error");
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

        console.log("Shipments:", shipments.length);
        console.log("Purchase Orders:", purchaseOrders.length);
        console.log("Containers:", containers.length);

        loadContainers(containers);

    } catch (err) {

        console.error(err);
        alert("Unable to connect Google Apps Script.");

    }

}

// ======================================================
// PAGE NAVIGATION
// ======================================================

function showPage(pageId) {

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active-page");
    });

    document.getElementById(pageId).classList.add("active-page");

    document.querySelectorAll(".menu-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    event.target.classList.add("active");

}

// ======================================================
// DATE FORMAT
// ======================================================

function formatDate(value) {

    if (!value) return "-";

    const date = new Date(value);

    if (isNaN(date)) return value;

    return date.toLocaleDateString("en-GB");

}
