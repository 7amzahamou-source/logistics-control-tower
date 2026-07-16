// ======================================================
// Logistics Control Tower V2
// Designed & Developed by Hamza Hamou
// ======================================================


// ======================================================
// API
// ======================================================

const API_URL =
"https://script.google.com/macros/s/XXXXXXXXXXXXXXXXXXXXXXXXXXXX/exec";


// ======================================================
// GLOBAL VARIABLES
// ======================================================

let shipments = [];
let purchaseOrders = [];
let containers = [];

let filteredData = [];
let filteredPurchaseOrders = [];
let filteredContainers = [];



let sortDirection = {};


// ======================================================
// LOAD DATA
// ======================================================

async function loadData(){

    try{

        const response = await fetch(API_URL);

        if(!response.ok){

            throw new Error("Unable to connect API");

        }

        const data = await response.json();

        // ==========================
        // SHIPPING
        // ==========================

        shipments = Array.isArray(data.SHIPPING1)
            ? data.SHIPPING1
            : [];

        filteredData = [...shipments];

        // ==========================
        // PURCHASE ORDERS
        // ==========================

        purchaseOrders = Array.isArray(data.FOLLOW_UP)
            ? data.FOLLOW_UP
            : [];

        filteredPurchaseOrders = [...purchaseOrders];

        // ==========================
        // CONTAINERS
        // ==========================

        containers = Array.isArray(data.CONTAINERS)
            ? data.CONTAINERS
            : [];

        filteredContainers = [...containers];

        console.log("Shipments :", shipments.length);
        console.log("Purchase Orders :", purchaseOrders.length);
        console.log("Containers :", containers.length);

        // Dashboard

        loadFilters();

        renderDashboard(filteredData);

        // Purchase Orders

        buildPurchaseOrders();

        // Containers

        loadContainers(containers);

    }

    catch(error){

        console.error(error);

        alert("Unable to connect Google Apps Script.");

    }

}


// ======================================================
// PAGE NAVIGATION
// ======================================================

function showPage(pageId){

    document
        .querySelectorAll(".page")
        .forEach(page=>{

            page.style.display="none";

        });

    document
        .getElementById(pageId)
        .style.display="block";

    document
        .querySelectorAll(".menu-btn")
        .forEach(btn=>{

            btn.classList.remove("active");

        });

    event.target.classList.add("active");

}


// ======================================================
// START
// ======================================================

document.addEventListener("DOMContentLoaded",()=>{

    loadData();

});// ======================================================
// DASHBOARD
// ======================================================

function renderDashboard(data){

    updateKPIs(data);

    if(window.innerWidth <= 768){

        fillMobileCards(data);

    }else{

        fillTable(data);

    }

    refreshCharts(data);
    
}

// ======================================================
// KPI
// ======================================================

function updateKPIs(data){

    // ==========================
    // Total HQ
    // ==========================

    const totalHQ = data.reduce((sum,row)=>{

        return sum + Number(row["HQ"] || 0);

    },0);

    // ==========================
    // Total Qty
    // ==========================

    const totalQty = data.reduce((sum,row)=>{

        return sum + Number(row["QTY"] || 0);

    },0);

    // ==========================
    // Shipments
    // ==========================

    const totalShipments = data.length;

    // ==========================
    // Factories
    // ==========================

    const totalFactories =

        new Set(

            data.map(r=>r["FACTORY"])

        ).size;

    // ==========================
    // Top Factory
    // ==========================

    const factoryHQ = {};

    data.forEach(row=>{

        const factory = row["FACTORY"] || "Unknown";

        factoryHQ[factory] =

            (factoryHQ[factory] || 0)

            +

            Number(row["HQ"] || 0);

    });

    const topFactory =

        Object.entries(factoryHQ)

        .sort((a,b)=>b[1]-a[1])[0];

    // ==========================
    // HQ ETA THIS MONTH
    // ==========================

    const today = new Date();

    const currentMonth = today.getMonth();

    const currentYear = today.getFullYear();

    const hqThisMonth = data.reduce((sum,row)=>{

        if(!row["ETA"]) return sum;

        const eta = new Date(row["ETA"]);

        if(

            eta.getMonth() === currentMonth &&

            eta.getFullYear() === currentYear

        ){

            return sum + Number(row["HQ"] || 0);

        }

        return sum;

    },0);

    // ==========================
    // OUTPUT
    // ==========================

    document.getElementById("shipmentCount").textContent =
        totalShipments.toLocaleString();

    document.getElementById("hqCount").textContent =
        totalHQ.toLocaleString();

    document.getElementById("qtyCount").textContent =
        totalQty.toLocaleString();

    document.getElementById("factoryCount").textContent =
        totalFactories.toLocaleString();

    document.getElementById("topFactory").textContent =

        topFactory

        ?

        `${topFactory[0]} (${topFactory[1]})`

        :

        "-";

    document.getElementById("etaHQ").textContent =
        hqThisMonth.toLocaleString();

}

// ======================================================
// LOAD FILTERS
// ======================================================

function loadFilters(){

    const factoryFilter =
        document.getElementById("factoryFilter");

    const podFilter =
        document.getElementById("podFilter");

    if(!factoryFilter || !podFilter) return;

    factoryFilter.innerHTML =
        `<option value="">All Factories</option>`;

    podFilter.innerHTML =
        `<option value="">All POD</option>`;

    const factories =

        [...new Set(

            shipments

            .map(r=>r["FACTORY"])

            .filter(Boolean)

        )].sort();

    const pods =

        [...new Set(

            shipments

            .map(r=>r["POD"])

            .filter(Boolean)

        )].sort();

    factories.forEach(factory=>{

        factoryFilter.innerHTML +=

        `<option value="${factory}">

            ${factory}

        </option>`;

    });

    pods.forEach(pod=>{

        podFilter.innerHTML +=

        `<option value="${pod}">

            ${pod}

        </option>`;

    });

}// ======================================================
// SHIPMENTS TABLE
// ======================================================

function fillTable(data){

    const tbody = document.getElementById("shipmentTable");

    if(!tbody) return;

    tbody.innerHTML = "";

    data.forEach((row,index)=>{

        tbody.innerHTML += `

        <tr>

            <td>${index+1}</td>

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

}

// ======================================================
// MOBILE CARDS
// ======================================================

function fillMobileCards(data){

    const container =
        document.getElementById("mobileCards");

    if(!container) return;

    container.innerHTML = "";

    data.forEach(row=>{

        container.innerHTML += `

        <div class="shipment-card">

            <h3>${row["ENTRY"] || "-"}</h3>

            <div class="shipment-row">
                <span class="shipment-label">Factory</span>
                <span class="shipment-value">${row["FACTORY"] || "-"}</span>
            </div>

            <div class="shipment-row">
                <span class="shipment-label">Forwarder</span>
                <span class="shipment-value">${row["FORWARDER"] || "-"}</span>
            </div>

            <div class="shipment-row">
                <span class="shipment-label">POD</span>
                <span class="shipment-value">${row["POD"] || "-"}</span>
            </div>

            <div class="shipment-row">
                <span class="shipment-label">ETA</span>
                <span class="shipment-value">${formatDate(row["ETA"])}</span>
            </div>

            <div class="shipment-row">
                <span class="shipment-label">HQ</span>
                <span class="shipment-value">
                    ${Number(row["HQ"] || 0).toLocaleString()}
                </span>
            </div>

        </div>

        `;

    });

}

// ======================================================
// SEARCH + FILTERS
// ======================================================

function applyFilters(){

    const search =

        (document.getElementById("search")?.value || "")

        .toLowerCase()

        .trim();

    const factory =

        document.getElementById("factoryFilter")?.value || "";

    const pod =

        document.getElementById("podFilter")?.value || "";

    filteredData = shipments.filter(row=>{

        const text = JSON.stringify(row).toLowerCase();

        const matchSearch =
            text.includes(search);

        const matchFactory =
            !factory ||
            row["FACTORY"] === factory;

        const matchPod =
            !pod ||
            row["POD"] === pod;

        return (

            matchSearch &&

            matchFactory &&

            matchPod

        );

    });

    renderDashboard(filteredData);

}

// ======================================================
// RESET FILTERS
// ======================================================

function resetFilters(){

    const search =
        document.getElementById("search");

    const factory =
        document.getElementById("factoryFilter");

    const pod =
        document.getElementById("podFilter");

    if(search) search.value = "";

    if(factory) factory.value = "";

    if(pod) pod.value = "";

    filteredData = [...shipments];

    renderDashboard(filteredData);

}

// ======================================================
// SORT TABLE
// ======================================================

function sortTable(column){

    sortDirection[column] =
        !sortDirection[column];

    filteredData.sort((a,b)=>{

        let x = a[column] ?? "";

        let y = b[column] ?? "";

        if(!isNaN(x) && !isNaN(y)){

            x = Number(x);

            y = Number(y);

        }

        if(x > y)
            return sortDirection[column] ? 1 : -1;

        if(x < y)
            return sortDirection[column] ? -1 : 1;

        return 0;

    });

    renderDashboard(filteredData);

}

// ======================================================
// HELPERS
// ======================================================

function formatDate(value){

    if(!value) return "-";

    const date = new Date(value);

    if(isNaN(date)) return value;

    return date.toLocaleDateString("en-GB");

}// ======================================================
// FACTORY CHART
// ======================================================

function drawFactoryChart(data){

    const result = {};

    data.forEach(row=>{

        const factory = row["FACTORY"] || "Unknown";

        result[factory] =

            (result[factory] || 0)

            +

            Number(row["HQ"] || 0);

    });

    const sorted =

        Object.entries(result)

        .sort((a,b)=>b[1]-a[1]);

    const labels =

        sorted.map(x=>x[0]);

    const values =

        sorted.map(x=>x[1]);

    if(factoryChart){

        factoryChart.destroy();

    }

    factoryChart = new Chart(

        document.getElementById("factoryChart"),

        {

            type:"bar",

            plugins:[ChartDataLabels],

            data:{

                labels,

                datasets:[{

                    label:"HQ",

                    data:values,

                    backgroundColor:"#123456",

                    hoverBackgroundColor:"#1f5f99",

                    borderRadius:8,

                    borderSkipped:false

                }]

            },

            options:{

                responsive:true,

                maintainAspectRatio:false,

                indexAxis:"y",

                plugins:{

                    legend:{

                        display:false

                    },

                    datalabels:{

                        color:"#fff",

                        anchor:"center",

                        align:"center",

                        font:{

                            size:11,

                            weight:"bold"

                        },

                        formatter:value=>

                            value.toLocaleString()

                    }

                },

                scales:{

                    x:{

                        beginAtZero:true,

                        ticks:{

                            precision:0,

                            color:"#555"

                        },

                        grid:{

                            color:"#edf2f7"

                        }

                    },

                    y:{

                        ticks:{

                            color:"#333",

                            font:{

                                weight:"600"

                            }

                        },

                        grid:{

                            display:false

                        }

                    }

                }

            }

        }

    );

}

// ======================================================
// ETA CHART
// ======================================================

function drawETAChart(data){

    const result = {};

    data.forEach(row=>{

        if(!row["ETA"]) return;

        const date = new Date(row["ETA"]);

        if(isNaN(date)) return;

        const month =

            date.toLocaleString(

                "en-US",

                {

                    month:"short",

                    year:"numeric"

                }

            );

        result[month] =

            (result[month] || 0)

            +

            Number(row["HQ"] || 0);

    });

    const labels = Object.keys(result);

    const values = Object.values(result);

    if(etaChart){

        etaChart.destroy();

    }

    etaChart = new Chart(

        document.getElementById("etaChart"),

        {

            type:"bar",

            plugins:[ChartDataLabels],

            data:{

                labels,

                datasets:[{

                    label:"HQ",

                    data:values,

                    backgroundColor:"#123456",

                    hoverBackgroundColor:"#1f5f99",

                    borderRadius:8,

                    borderSkipped:false

                }]

            },

            options:{

                responsive:true,

                maintainAspectRatio:false,

                plugins:{

                    legend:{

                        display:false

                    },

                    datalabels:{

                        color:"#fff",

                        anchor:"center",

                        align:"center",

                        font:{

                            size:11,

                            weight:"bold"

                        },

                        formatter:value=>

                            value.toLocaleString()

                    }

                },

                scales:{

                    x:{

                        ticks:{

                            color:"#555"

                        },

                        grid:{

                            display:false

                        }

                    },

                    y:{

                        beginAtZero:true,

                        ticks:{

                            precision:0,

                            color:"#555"

                        },

                        grid:{

                            color:"#edf2f7"

                        }

                    }

                }

            }

        }

    );

}// ======================================================
// PURCHASE ORDERS
// ======================================================

function buildPurchaseOrders(){

    const container =
        document.getElementById("purchaseCards");

    if(!container) return;

    container.innerHTML = "";

    updatePurchaseKPIs();

    filteredPurchaseOrders.forEach(po=>{

        const totalQty =
            Number(po["PO QTY"] || 0);

        const shippedQty =
            Number(po["SHIPPED QTY"] || 0);

        const remaining =
            totalQty - shippedQty;

        const progress =
            totalQty > 0
            ? Math.round((shippedQty / totalQty) * 100)
            : 0;

        const status =
            getPurchaseStatus(progress);

        container.innerHTML += `

        <div class="purchase-card">

            <div class="purchase-header">

                <div class="purchase-info">

                    <h2>${po["P I"] || "-"}</h2>

                    <p>

                        ${po["SUPPLIER"] || "-"}

                    </p>

                </div>

                <div class="purchase-percent">

                    ${progress}%

                </div>

            </div>

            <div class="progress">

                <div class="progress-fill"

                    style="width:${progress}%">

                </div>

            </div>

            <div class="progress-text">

                <span>

                    ${shippedQty.toLocaleString()}

                </span>

                <span>

                    ${totalQty.toLocaleString()}

                </span>

            </div>

            <div class="po-summary">

                <div>

                    <strong>

                        Total Qty

                    </strong>

                    <p>

                        ${totalQty.toLocaleString()}

                    </p>

                </div>

                <div>

                    <strong>

                        Remaining

                    </strong>

                    <p>

                        ${remaining.toLocaleString()}

                    </p>

                </div>

                <div>

                    <strong>

                        Status

                    </strong>

                    <p>

                        <span class="status ${status.class}">

                            ${status.text}

                        </span>

                    </p>

                </div>

            </div>

        </div>

        `;

    });

}

//
// PURCHASE KPIs
//

function updatePurchaseKPIs(){

    document.getElementById("poCount").textContent =
        purchaseOrders.length.toLocaleString();

    const qty = purchaseOrders.reduce(

        (sum,row)=>

        sum +

        Number(row["PO QTY"] || 0)

    ,0);

    document.getElementById("poQty").textContent =
        qty.toLocaleString();

    const suppliers =

        new Set(

            purchaseOrders

            .map(r=>r["SUPPLIER"])

            .filter(Boolean)

        ).size;

    document.getElementById("supplierCount").textContent =
        suppliers;

    const completed = purchaseOrders.filter(row=>{

        return Number(row["PO QTY"] || 0) > 0

        &&

        Number(row["SHIPPED QTY"] || 0)

        >=

        Number(row["PO QTY"] || 0);

    }).length;

    const percent =

        purchaseOrders.length

        ?

        Math.round(

            completed /

            purchaseOrders.length

            *100

        )

        :

        0;

    document.getElementById("completedPO").textContent =
        percent + "%";

}

//
// PURCHASE STATUS
//

function getPurchaseStatus(progress){

    if(progress >= 100){

        return{

            text:"Done",

            class:"done"

        };

    }

    if(progress > 0){

        return{

            text:"Partial",

            class:"partial"

        };

    }

    return{

        text:"Pending",

        class:"pending"

    };

}

//
// SEARCH PURCHASE
//

function filterPurchaseOrders(){

    const keyword =

        document.getElementById("poSearch")

        .value

        .toLowerCase();

    filteredPurchaseOrders =

        purchaseOrders.filter(row=>{

            return JSON.stringify(row)

            .toLowerCase()

            .includes(keyword);

        });

    buildPurchaseOrders();

}

//
// RESET
//

function resetPurchaseOrders(){

    document.getElementById("poSearch").value="";

    filteredPurchaseOrders =

        [...purchaseOrders];

    buildPurchaseOrders();

}// ======================================================
// HELPERS
// ======================================================

function formatDate(value){

    if(!value) return "-";

    const date = new Date(value);

    if(isNaN(date)){

        return value;

    }

    return date.toLocaleDateString(

        "en-GB",

        {

            day:"2-digit",

            month:"2-digit",

            year:"numeric"

        }

    );

}

// ======================================================

function number(value){

    return Number(value || 0).toLocaleString();

}

// ======================================================

function text(value){

    return value || "-";

}

// ======================================================

function byId(id){

    return document.getElementById(id);

}

// ======================================================

function showLoading(){

    document.body.style.cursor="wait";

}

// ======================================================

function hideLoading(){

    document.body.style.cursor="default";

}
