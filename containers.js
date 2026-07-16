// ======================================================
// CONTAINERS
// ======================================================

let containerData = [];
let filteredContainers = [];

// ======================================================
// LOAD CONTAINERS
// ======================================================

function loadContainers(data){

    containerData = [...data];
    filteredContainers = [...data];

    updateContainerKPIs();
    loadContainerFilters();
    renderContainerTable();

}// ======================================================
// CONTAINER KPIs
// ======================================================

function updateContainerKPIs(){

    const totalContainers = containerData.length;

    const onSea = containerData.filter(row=>{

        const status = String(
            row["حالة الحاوية"] || ""
        ).trim();

        return status === "";

    }).length;

    const warehouse = containerData.filter(row=>{

        return (row["الى مستودع"] || "").trim() !== "";

    }).length;

    const distributed = containerData.filter(row=>{

        return String(
            row["التوزيع الى مستودع"] || ""
        ).includes("تم");

    }).length;

    const waiting = containerData.filter(row=>{

        return String(
            row["التوزيع الى مستودع"] || ""
        ).includes("لم");

    }).length;

    // ETA This Month

    const today = new Date();

    const currentMonth = today.getMonth();

    const currentYear = today.getFullYear();

    const etaThisMonth = containerData.filter(row=>{

        if(!row["ETA"]) return false;

        const eta = new Date(row["ETA"]);

        return (
            eta.getMonth() === currentMonth &&
            eta.getFullYear() === currentYear
        );

    }).length;

    document.getElementById("containerCount").textContent =
        totalContainers.toLocaleString();

    document.getElementById("containerSea").textContent =
        onSea.toLocaleString();

    document.getElementById("containerWarehouse").textContent =
        warehouse.toLocaleString();

    document.getElementById("containerDistributed").textContent =
        distributed.toLocaleString();

    document.getElementById("containerWaiting").textContent =
        waiting.toLocaleString();

    document.getElementById("containerETA").textContent =
        etaThisMonth.toLocaleString();

}// ======================================================
// RENDER CONTAINER TABLE
// ======================================================

function renderContainerTable(){

    const table =
    document.getElementById("containerTable");

    if(!table) return;

    table.innerHTML = "";

    filteredContainers.forEach((row,index)=>{

        table.innerHTML += `

        <tr>

            <td>${index+1}</td>

            <td>${row["ENTRY"] || "-"}</td>

            <td>${formatDate(row["ETA"])}</td>

            <td>${row["POD"] || "-"}</td>

            <td>${row["S/N"] || "-"}</td>

            <td>${row["CONTAINER No"] || "-"}</td>

            <td>${Number(row["QTY"] || 0).toLocaleString()}</td>

            <td>${row["الى مستودع"] || "-"}</td>

            <td>${row["حالة الحاوية"] || "-"}</td>

            <td>

                <button
                    class="details-btn"
                    onclick="openContainer('${row["CONTAINER No"]}')">

                    👁 View

                </button>

            </td>

        </tr>

        `;

    });

}// ======================================================
// OPEN CONTAINER
// ======================================================

function openContainer(containerNo){

    alert(containerNo);

}