// ======================================================
// CONTAINERS.JS
// ======================================================

let containerData = [];
let filteredContainers = [];

// ======================================================
// LOAD CONTAINERS
// ======================================================

function loadContainers(data){

    console.log("Loading Containers:", data);

    containerData = Array.isArray(data) ? [...data] : [];

    filteredContainers = [...containerData];

    updateContainerKPIs();

    renderContainerTable();

}

// ======================================================
// CONTAINER KPIs
// ======================================================

function updateContainerKPIs(){

    const totalContainers = containerData.length;

    const onSea = containerData.filter(row=>{

        return String(row["حالة الحاوية"] || "").trim() === "";

    }).length;

    const warehouse = containerData.filter(row=>{

        return String(row["الى مستودع"] || "").trim() !== "";

    }).length;

    const distributed = containerData.filter(row=>{

        return String(row["التوزيع الى مستودع"] || "")
            .includes("تم");

    }).length;

    const waiting = containerData.filter(row=>{

        return String(row["التوزيع الى مستودع"] || "")
            .includes("لم");

    }).length;

    const today = new Date();

    const currentMonth = today.getMonth();

    const currentYear = today.getFullYear();

    const etaThisMonth = containerData.filter(row=>{

        if(!row["ETA"]) return false;

        const eta = new Date(row["ETA"]);

        return eta.getMonth() === currentMonth &&
               eta.getFullYear() === currentYear;

    }).length;

    document.getElementById("containerCount").textContent = totalContainers.toLocaleString();

    document.getElementById("containerSea").textContent = onSea.toLocaleString();

    document.getElementById("containerWarehouse").textContent = warehouse.toLocaleString();

    document.getElementById("containerDistributed").textContent = distributed.toLocaleString();

    document.getElementById("containerWaiting").textContent = waiting.toLocaleString();

    document.getElementById("containerETA").textContent = etaThisMonth.toLocaleString();

}

// ======================================================
// TABLE
// ======================================================

function renderContainerTable(){

    const tbody = document.getElementById("containerTable");

    if(!tbody) return;

    tbody.innerHTML = "";

    filteredContainers.forEach((row,index)=>{

        tbody.innerHTML += `

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

                <button class="details-btn"
                    onclick="openContainer('${row["CONTAINER No"]}')">

                    👁 View

                </button>

            </td>

        </tr>

        `;

    });

}

// ======================================================
// DETAILS
// ======================================================

function openContainer(containerNo){

    alert("Container : " + containerNo);

}
