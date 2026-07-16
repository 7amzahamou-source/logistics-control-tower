// ======================================================
// CONTAINERS
// ======================================================

let containerData = [];
let filteredContainers = [];

// ======================================================
// LOAD
// ======================================================

function loadContainers(data){

    containerData = Array.isArray(data)
        ? [...data]
        : [];

    filteredContainers = [...containerData];

    updateContainerKPIs();

    loadContainerFilters();

    renderContainerTable();

}

// ======================================================
// KPIs
// ======================================================

function updateContainerKPIs(){

    document.getElementById("containerCount").textContent =
        containerData.length.toLocaleString();

    const sea = containerData.filter(r=>

        String(r["حالة الحاوية"] || "").trim()===""

    ).length;

    document.getElementById("containerSea").textContent =
        sea.toLocaleString();

    const warehouse = containerData.filter(r=>

        String(r["الى مستودع"] || "").trim()!== ""

    ).length;

    document.getElementById("containerWarehouse").textContent =
        warehouse.toLocaleString();

    const distributed = containerData.filter(r=>

        String(r["التوزيع الى مستودع"] || "")
        .includes("تم")

    ).length;

    document.getElementById("containerDistributed").textContent =
        distributed.toLocaleString();

    const waiting = containerData.filter(r=>

        String(r["التوزيع الى مستودع"] || "")
        .includes("لم")

    ).length;

    document.getElementById("containerWaiting").textContent =
        waiting.toLocaleString();

    const today = new Date();

    const month = today.getMonth();

    const year = today.getFullYear();

    const eta = containerData.filter(r=>{

        if(!r["ETA"]) return false;

        const d = new Date(r["ETA"]);

        return d.getMonth()==month &&
               d.getFullYear()==year;

    }).length;

    document.getElementById("containerETA").textContent =
        eta.toLocaleString();

}

// ======================================================
// FILTERS
// ======================================================

function loadContainerFilters(){

    const factory =
    document.getElementById("containerFactory");

    const warehouse =
    document.getElementById("containerWarehouse");

    const status =
    document.getElementById("containerStatus");

    if(factory){

        factory.innerHTML =
        '<option value="">All Factories</option>';

        [...new Set(containerData.map(r=>r["FACTORY"]))]

        .filter(Boolean)

        .sort()

        .forEach(v=>{

            factory.innerHTML +=
            `<option>${v}</option>`;

        });

    }

    if(warehouse){

        warehouse.innerHTML =
        '<option value="">All Warehouses</option>';

        [...new Set(containerData.map(r=>r["الى مستودع"]))]

        .filter(Boolean)

        .sort()

        .forEach(v=>{

            warehouse.innerHTML +=
            `<option>${v}</option>`;

        });

    }

    if(status){

        status.innerHTML =
        '<option value="">All Status</option>';

        [...new Set(containerData.map(r=>r["حالة الحاوية"]))]

        .filter(Boolean)

        .sort()

        .forEach(v=>{

            status.innerHTML +=
            `<option>${v}</option>`;

        });

    }

}
