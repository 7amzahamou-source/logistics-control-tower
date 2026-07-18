// ======================================================
// Containers
// ======================================================

function initializeContainers() {

    filteredContainers = [...containersData];

    loadContainerCards();

    loadContainerFilters();

    renderContainers(filteredContainers);

}

// ======================================================
// KPI Cards
// ======================================================

function loadContainerCards() {

    // Total Containers
    document.getElementById("containerCount").textContent =
        containersData.length;

    // On Sea
    document.getElementById("containerSea").textContent =
        containersData.filter(row =>
            !row["تاريخ استلام فعلي"]
        ).length;

    // In Warehouse
    document.getElementById("containerWarehouse").textContent =
        containersData.filter(row =>
            row["تاريخ استلام فعلي"]
        ).length;

    // Distributed
    document.getElementById("containerDistributed").textContent =
        containersData.filter(row =>
            row["التوزيع الى مستودع"]
        ).length;

    // Waiting
    document.getElementById("containerWaiting").textContent =
        containersData.filter(row =>
            !row["التوزيع الى مستودع"]
        ).length;

    // ETA This Month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    let etaCount = 0;

    containersData.forEach(row => {

        const eta = new Date(row["ETA"]);

        if (
            !isNaN(eta) &&
            eta.getMonth() === currentMonth &&
            eta.getFullYear() === currentYear
        ) {

            etaCount++;

        }

    });

    document.getElementById("containerETA").textContent =
        etaCount;

}

// ======================================================
// Container Filters
// ======================================================

function loadContainerFilters() {

    const factory =
        document.getElementById("containerFactory");

    const warehouse =
        document.getElementById("containerWarehouse");

    const status =
        document.getElementById("containerStatus");

        factory.innerHTML =
    '<option value="">All Factories</option>';

warehouse.innerHTML =
    '<option value="">All Warehouses</option>';

status.innerHTML =
    '<option value="">All Status</option>';

    // Factory
    [...new Set(containersData.map(row => row["Factory"]))]

        .filter(Boolean)

        .sort()

        .forEach(item => {

            factory.innerHTML +=
                `<option value="${item}">${item}</option>`;

        });

    // Warehouse
    [...new Set(containersData.map(row => row["الى مستودع"]))]

        .filter(Boolean)

        .sort()

        .forEach(item => {

            warehouse.innerHTML +=
                `<option value="${item}">${item}</option>`;

        });

    // Status
    [...new Set(containersData.map(row => row["حالة الحاوية"]))]

        .filter(Boolean)

        .sort()

        .forEach(item => {

            status.innerHTML +=
                `<option value="${item}">${item}</option>`;

        });

}

// ======================================================
// Render Containers Table
// ======================================================

function renderContainers(data) {

    const tbody =
        document.getElementById("containerTable");

    tbody.innerHTML = "";

    data.forEach(row => {

        tbody.innerHTML += `

<tr onclick="showContainerDetails('${row["CONTAINER No"] || ""}')">

    <td>${row["ENTRY"] || ""}</td>

    <td>${row["Factory"] || ""}</td>

    <td>${row["ETA"] || ""}</td>

    <td>${row["POD"] || ""}</td>

    <td>${row["S/N"] || ""}</td>

    <td>${row["CONTAINER No"] || ""}</td>

    <td>${row["MODEL"] || ""}</td>

    <td>${row["QTY"] || ""}</td>

    <td>${row["الى مستودع"] || ""}</td>

    <td>${row["حالة الحاوية"] || ""}</td>

</tr>

`;

    });

}// ======================================================
// Filter Containers
// ======================================================

function filterContainers() {

    const keyword =
        document
        .getElementById("containerSearch")
        .value
        .toLowerCase();

    const factory =
        document
        .getElementById("containerFactory")
        .value;

    const warehouse =
        document
        .getElementById("containerWarehouse")
        .value;

    const status =
        document
        .getElementById("containerStatus")
        .value;

    filteredContainers = containersData.filter(row => {

        const text =
            JSON.stringify(row).toLowerCase();

        return (

            text.includes(keyword)

            &&

            (!factory ||
                row["Factory"] === factory)

            &&

            (!warehouse ||
                row["الى مستودع"] === warehouse)

            &&

            (!status ||
                row["حالة الحاوية"] === status)

        );

    });

    renderContainers(filteredContainers);

}

// ======================================================
// Reset Containers
// ======================================================

function resetContainers() {

    document.getElementById("containerSearch").value = "";

    document.getElementById("containerFactory").value = "";

    document.getElementById("containerWarehouse").value = "";

    document.getElementById("containerStatus").value = "";

    filteredContainers = [...containersData];

    renderContainers(filteredContainers);

}

// ======================================================
// Container Details
// ======================================================

function showContainerDetails(containerNo) {

    const container = containersData.find(row =>
        row["CONTAINER No"] == containerNo
    );

    if (!container) return;

    document.getElementById("detailsTitle").textContent =
        container["CONTAINER No"];

    let html = "";

    Object.keys(container).forEach(key => {

        html += `

<div class="detail-item">

<label>${key}</label>

<span>${container[key] ?? ""}</span>

</div>

`;

    });

    document.getElementById("detailsBody").innerHTML =
        html;

    document
        .getElementById("detailsPanel")
        .classList
        .add("open");

}
