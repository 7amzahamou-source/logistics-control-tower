// ======================================================
// Logistics Control Tower
// Designed & Developed by Hamza Hamou
// Version 4.0
// ======================================================


// ======================================================
// API
// ======================================================

const API_URL =
"https://script.google.com/macros/s/AKfycbzJ_gU9cuzmZLpksMjCpCJcuDON7jRZmBjfJ_GplLF9_FFRBTHD1KwT03znMDjqjqgU/exec";


// ======================================================
// GLOBAL VARIABLES
// ======================================================

let shipments = [];
let purchaseOrders = [];
let filteredPurchaseOrders = [];
let filteredData = [];

let factoryChart = null;
let etaChart = null;

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

shipments = Array.isArray(data.SHIPPING1)
    ? data.SHIPPING1
    : [];

purchaseOrders = Array.isArray(data.FOLLOW_UP)
    ? data.FOLLOW_UP
    : [];

filteredPurchaseOrders = [...purchaseOrders];

console.log("First Shipment:", shipments[0]);
console.log("Total Shipments:", shipments.length);

filteredData = [...shipments];

        console.log("Shipments :", shipments.length);
        console.log("Purchase Orders :", purchaseOrders.length);

        loadFilters();

        renderDashboard(filteredData);

        buildPurchaseOrders();

    }

    catch(error){

        console.error(error);

        alert("Unable to load Google Sheet.");

    }

}
// ======================================================
// ======================================================
// RENDER DASHBOARD
// ======================================================

function renderDashboard(data){

    updateKPIs(data);

    if(window.innerWidth <= 768){

        fillMobileCards(data);

    }else{

        fillTable(data);

    }

    drawFactoryChart(data);

    drawETAChart(data);

}



// ======================================================
// DESKTOP TABLE
// ======================================================

function fillTable(data){

    const table =
    document.getElementById("shipmentTable");

    if(!table) return;

    table.innerHTML = "";

    data.forEach((row,index)=>{

        table.innerHTML += `

        <tr>

            <td>${index+1}</td>

            <td>

                <a href="#"

                onclick="openShipment('${row["P I"]}');return false;">

                    ${row["P I"]||"-"}

                </a>

            </td>

            <td>${row["C/I No"]||"-"}</td>

            <td>${row["FACTORY"]||"-"}</td>

            <td>${row["ENTRY"]||"-"}</td>

            <td>${Number(row["HQ"]||0)}</td>

            <td>${row["POD"]||"-"}</td>

            <td title="${row["MODEL"]||""}">

                ${row["MODEL"]||"-"}

            </td>

            <td>

                ${Number(row["QTY"]||0).toLocaleString()}

            </td>

            <td>

                ${formatDate(row["ETA"])}

            </td>

        </tr>

        `;

    });

}



// ======================================================
// MOBILE CARDS
// ======================================================

function fillMobileCards(data){

    const container =
    document.getElementById("mobileCardsList");

    if(!container) return;

    container.innerHTML = "";

    data.forEach(row=>{

        container.innerHTML += `

        <div class="shipment-card">

            <h3>

                📦 ${row["P I"]||"-"}

            </h3>

            <div class="shipment-row">

                <span class="shipment-label">

                    🏭 Factory

                </span>

                <span class="shipment-value">

                    ${row["FACTORY"]||"-"}

                </span>

            </div>

            <div class="shipment-row">

                <span class="shipment-label">

                    📍 POD

                </span>

                <span class="shipment-value">

                    ${row["POD"]||"-"}

                </span>

            </div>

            <div class="shipment-row">

                <span class="shipment-label">

                    🚢 HQ

                </span>

                <span class="shipment-value">

                    ${Number(row["HQ"]||0)}

                </span>

            </div>

            <div class="shipment-row">

                <span class="shipment-label">

                    📦 Qty

                </span>

                <span class="shipment-value">

                    ${Number(row["QTY"]||0).toLocaleString()}

                </span>

            </div>

            <div class="shipment-row">

                <span class="shipment-label">

                    📅 ETA

                </span>

                <span class="shipment-value">

                    ${formatDate(row["ETA"])}

                </span>

            </div>

            <button

                class="details-btn"

                onclick="openShipment('${row["P I"]}')">

                View Details

            </button>

        </div>

        `;

    });

}



// ======================================================
// KPI
// ======================================================

function updateKPIs(data){

    const totalHQ = data.reduce(

        (sum,row)=>

        sum + Number(row["HQ"]||0)

    ,0);

    const totalQty = data.reduce(

        (sum,row)=>

        sum + Number(row["QTY"]||0)

    ,0);

    document.getElementById("totalHQ").textContent =
    totalHQ.toLocaleString();

    document.getElementById("totalQty").textContent =
    totalQty.toLocaleString();

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

    const factories = [...new Set(

        shipments
        .map(r=>r["FACTORY"])
        .filter(v=>v)

    )].sort();

    const pods = [...new Set(

        shipments
        .map(r=>r["POD"])
        .filter(v=>v)

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

}



// ======================================================
// APPLY FILTERS
// ======================================================

function applyFilters(){

    const desktopSearch =
    document.getElementById("search");

    const mobileSearch =
    document.getElementById("mobileSearch");

    const search = (
        desktopSearch?.value ||
        mobileSearch?.value ||
        ""
    ).toLowerCase();

    const factory =
    document.getElementById("factoryFilter")?.value || "";

    const pod =
    document.getElementById("podFilter")?.value || "";

    filteredData = shipments.filter(row=>{

        const pi =
        (row["P I"]||"")
        .toString()
        .toLowerCase();

        const model =
        (row["MODEL"]||"")
        .toString()
        .toLowerCase();

        const fac =
        (row["FACTORY"]||"")
        .toString()
        .toLowerCase();

        return(

            (
                pi.includes(search) ||
                model.includes(search) ||
                fac.includes(search)
            )

            &&

            (
                factory==="" ||
                row["FACTORY"]===factory
            )

            &&

            (
                pod==="" ||
                row["POD"]===pod
            )

        );

    });

    renderDashboard(filteredData);

}



// ======================================================
// RESET FILTERS
// ======================================================

function resetFilters(){

    if(document.getElementById("search"))
        document.getElementById("search").value="";

    if(document.getElementById("mobileSearch"))
        document.getElementById("mobileSearch").value="";

    if(document.getElementById("factoryFilter"))
        document.getElementById("factoryFilter").value="";

    if(document.getElementById("podFilter"))
        document.getElementById("podFilter").value="";

    filteredData = [...shipments];

    renderDashboard(filteredData);

}



// ======================================================
// SORT TABLE
// ======================================================

function sortTable(column){

    sortDirection[column] =
    !sortDirection[column];

    const asc = sortDirection[column];

    filteredData.sort((a,b)=>{

        let valueA = a[column];
        let valueB = b[column];

        if(column==="ETA"){

            valueA = new Date(valueA);
            valueB = new Date(valueB);

        }

        else if(
            column==="ENTRY" ||
            column==="HQ" ||
            column==="QTY"
        ){

            valueA = Number(valueA||0);
            valueB = Number(valueB||0);

        }

        else{

            valueA =
            (valueA||"")
            .toString()
            .toLowerCase();

            valueB =
            (valueB||"")
            .toString()
            .toLowerCase();

        }

        if(valueA<valueB)
            return asc ? -1 : 1;

        if(valueA>valueB)
            return asc ? 1 : -1;

        return 0;

    });

    renderDashboard(filteredData);

}
// ======================================================
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

            plugins:[ChartDataLabels],

            type:"bar",

            data:{

                labels:labels,

                datasets:[{

                    label:"HQ",

                    data:values,

                    backgroundColor:"#111111",

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

                        color:"#ffffff",

                        anchor:"center",

                        align:"center",

                        font:{

                            size:13,

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

                            precision:0

                        },

                        grid:{

                            color:"#eeeeee"

                        }

                    },

                    y:{

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

    const labels =

    Object.keys(result);

    const values =

    Object.values(result);

    if(etaChart){

        etaChart.destroy();

    }

    etaChart = new Chart(

        document.getElementById("etaChart"),

        {

            plugins:[ChartDataLabels],

            type:"bar",

            data:{

                labels:labels,

                datasets:[{

                    label:"HQ",

                    data:values,

                    backgroundColor:"#111111",

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

                        color:"#ffffff",

                        anchor:"center",

                        align:"center",

                        font:{

                            size:12,

                            weight:"bold"

                        },

                        formatter:value=>

                        value.toLocaleString()

                    }

                },

                scales:{

                    x:{

                        grid:{

                            display:false

                        }

                    },

                    y:{

                        beginAtZero:true,

                        ticks:{

                            precision:0

                        },

                        grid:{

                            color:"#eeeeee"

                        }

                    }

                }

            }

        }

    );

}// ======================================================
// OPEN SHIPMENT
// ======================================================

function openShipment(pi){

    const panel =
    document.getElementById("sidePanel");

    const content =
    document.getElementById("panelContent");

    const rows =
    shipments.filter(r=>r["P I"]===pi);

    if(rows.length===0){

        content.innerHTML="<h3>No Data Found</h3>";

        panel.classList.add("open");

        return;

    }

    const first = rows[0];

    const totalHQ = rows.reduce(

        (sum,row)=>sum + Number(row["HQ"]||0)

    ,0);

    const totalQty = rows.reduce(

        (sum,row)=>sum + Number(row["QTY"]||0)

    ,0);

    const invoices =

    [...new Set(

        rows.map(r=>r["C/I No"])

    )];

    let html = `

    <h2>${pi}</h2>

    <hr>

    <table style="width:100%;margin-bottom:20px;">

        <tr>

            <td><b>Factory</b></td>

            <td>${first["FACTORY"]||""}</td>

        </tr>

        <tr>

            <td><b>POD</b></td>

            <td>${first["POD"]||""}</td>

        </tr>

        <tr>

            <td><b>ETA</b></td>

            <td>${formatDate(first["ETA"])}</td>

        </tr>

        <tr>

            <td><b>Total HQ</b></td>

            <td>${totalHQ}</td>

        </tr>

        <tr>

            <td><b>Total Qty</b></td>

            <td>${totalQty.toLocaleString()}</td>

        </tr>

    </table>

    <h3 style="margin-bottom:15px;">

        📄 Invoices

    </h3>

    `;

    invoices.forEach(invoice=>{

        const id =

        invoice

        .replace(/[^a-zA-Z0-9]/g,"");

        html += `

        <div class="invoice-box">

            <div

                style="cursor:pointer;font-weight:bold;"

                onclick="toggleInvoice('${pi}','${invoice}','${id}')">

                📄 ${invoice}

            </div>

            <div id="${id}"></div>

        </div>

        `;

    });

    content.innerHTML = html;

    panel.classList.add("open");

}



// ======================================================
// CLOSE PANEL
// ======================================================

function closePanel(){

    document

    .getElementById("sidePanel")

    .classList.remove("open");

}



// ======================================================
// TOGGLE INVOICE
// ======================================================

function toggleInvoice(pi,invoice,id){

    const container =

    document.getElementById(id);

    if(container.innerHTML!=""){

        container.innerHTML="";

        return;

    }

    const rows =

    shipments.filter(r=>

        r["P I"]===pi

        &&

        r["C/I No"]===invoice

    );

    let totalQty = 0;

    let html = `

    <table style="width:100%;margin-top:12px;">

        <tr>

            <th>Model</th>

            <th>Qty</th>

        </tr>

    `;

    rows.forEach(row=>{

        totalQty +=

        Number(row["QTY"]||0);

        html += `

        <tr>

            <td>

                ${row["MODEL"]||""}

            </td>

            <td>

                ${Number(row["QTY"]||0).toLocaleString()}

            </td>

        </tr>

        `;

    });

    html += `

        <tr>

            <td>

                <b>Total</b>

            </td>

            <td>

                <b>

                    ${totalQty.toLocaleString()}

                </b>

            </td>

        </tr>

    </table>

    `;

    container.innerHTML = html;

}// ======================================================
// FORMAT DATE
// ======================================================

function formatDate(value){

    if(!value) return "";

    const date = new Date(value);

    if(isNaN(date)) return value;

    const months = [

        "Jan","Feb","Mar","Apr","May","Jun",

        "Jul","Aug","Sep","Oct","Nov","Dec"

    ];

    const day =
    String(date.getDate()).padStart(2,"0");

    const month =
    months[date.getMonth()];

    const year =
    date.getFullYear();

    return `${day}-${month}-${year}`;

}



// ======================================================
// AUTO REFRESH (OPTIONAL)
// ======================================================

// Uncomment if you want automatic refresh every minute

// setInterval(loadData,60000);



// ======================================================
// CLOSE PANEL WHEN CLICKING OUTSIDE
// ======================================================

window.addEventListener("click",function(e){

    const panel =

    document.getElementById("sidePanel");

    if(!panel) return;

    if(

        panel.classList.contains("open")

        &&

        !panel.contains(e.target)

        &&

        !e.target.closest("a")

        &&

        !e.target.closest(".details-btn")

    ){

        closePanel();

    }

});



// ======================================================
// ESC KEY CLOSE PANEL
// ======================================================

document.addEventListener("keydown",function(e){

    if(e.key==="Escape"){

        closePanel();

    }

});



// ======================================================
// WINDOW RESIZE
// ======================================================

window.addEventListener("resize",()=>{

    renderDashboard(filteredData);

});


// ======================================================
// SHOW PAGE
// ======================================================

function showPage(pageId, button){

    // إخفاء جميع الصفحات
    document.querySelectorAll("section").forEach(page=>{
        page.style.display = "none";
    });

    // إظهار الصفحة المطلوبة
    document.getElementById(pageId).style.display = "block";

    // إزالة active
    document.querySelectorAll(".menu-btn").forEach(btn=>{
        btn.classList.remove("active");
    });

    // تفعيل الزر
    if(button){
        button.classList.add("active");
    }

    // عند فتح صفحة Purchase Orders
    if(pageId === "purchasePage"){
        buildPurchaseOrders();
    }

}
// ======================================================
// PAGE LOADED
// ======================================================

document.addEventListener("DOMContentLoaded",()=>{

    loadData();

});// ======================================================
// PURCHASE ORDERS
// ======================================================

function buildPurchaseOrders(){

    const container = document.getElementById("purchaseCards");

    if(!container) return;

    container.innerHTML = "";

    if(!filteredPurchaseOrders.length){

        container.innerHTML = `
            <div class="card">
                <h3>No Purchase Orders Found</h3>
            </div>
        `;

        return;

    }

    let totalQty = 0;
    let totalShipped = 0;

    const groups = {};

    filteredPurchaseOrders.forEach(row=>{

        const pi = row["OrderID / PI NO"];

        if(!groups[pi]){

            groups[pi] = [];

        }

        groups[pi].push(row);

        totalQty += Number(row["TOTAL QTY"] || 0);

        totalShipped += Number(row["SHIPPED"] || 0);

    });

    document.getElementById("poCount").innerText =
        Object.keys(groups).length.toLocaleString();

    document.getElementById("poQty").innerText =
        totalQty.toLocaleString();

    document.getElementById("supplierCount").innerText =
        new Set(
            filteredPurchaseOrders.map(r=>r.Supplier)
        ).size;

    document.getElementById("completedPO").innerText =
        Math.round((totalShipped / totalQty) * 100) + "%";

    Object.keys(groups).forEach(pi=>{

    const safeId = pi.replace(/[^a-zA-Z0-9]/g,"");

        const rows = groups[pi];

        const supplier =
            rows[0]["Supplier"] || "-";

        const qty =
            rows.reduce(
                (a,b)=>a+Number(b["TOTAL QTY"]||0),
                0
            );

        const shipped =
            rows.reduce(
                (a,b)=>a+Number(b["SHIPPED"]||0),
                0
            );

        const remaining =
            rows.reduce(
                (a,b)=>a+Number(b["REMAINING"]||0),
                0
            );

        const percent =
            qty
            ? Math.round((shipped/qty)*100)
            : 0;

        let modelsHTML = "";

        rows.forEach(r=>{

            let color = "#f44336";

            if(r.STATUS==="done")
                color="#2ecc71";

            else if(r.STATUS==="done partial")
                color="#f39c12";

            modelsHTML += `
                <tr>

                    <td>${r.MODELS}</td>

                    <td>${Number(r["TOTAL QTY"]).toLocaleString()}</td>

                    <td>${Number(r.SHIPPED).toLocaleString()}</td>

                    <td>${Number(r.REMAINING).toLocaleString()}</td>

                    <td>

                        <span
                        style="
                            color:white;
                            background:${color};
                            padding:4px 10px;
                            border-radius:20px;
                            font-size:12px;
                        ">

                            ${r.STATUS}

                        </span>

                    </td>

                </tr>
            `;

        });        container.innerHTML += `

        <div class="purchase-card">

            <div class="purchase-header">

                <div class="purchase-info">

                    <h2>📦 ${pi}</h2>

                    <p>

                        <strong>Supplier:</strong>

                        ${supplier}

                    </p>

                </div>

                <div class="purchase-percent">

                    ${percent}%

                </div>

            </div>

            <div class="progress">

                <div
                    class="progress-fill"
                    style="width:${percent}%">
                </div>

            </div>

            <div class="progress-text">

                    <span>${percent}% Completed</span>
                    <span>${rows.length} Models</span>
            </div>

            <div class="po-summary">

                <div>

                    <strong>Total Qty</strong>

                    <br>

                    ${qty.toLocaleString()}

                </div>

                <div>

                    <strong>Shipped</strong>

                    <br>

                    ${shipped.toLocaleString()}

                </div>

                <div>

                    <strong>Remaining</strong>

                    <br>

                    ${remaining.toLocaleString()}

                </div>

            </div>

            <button
                class="po-toggle"
                onclick="togglePO('${safeId}')">

                📋 View Models (${rows.length})

            </button>

            <div
                id="po_${safeId}"
                style="display:none;">

                <table class="po-table">

                    <thead>

                        <tr>

                            <th>Model</th>

                            <th>Total</th>

                            <th>Shipped</th>

                            <th>Remaining</th>

                            <th>Status</th>

                        </tr>

                    </thead>

                    <tbody>

                        ${modelsHTML}

                    </tbody>

                </table>

            </div>

        </div>

        `;

    });

}// ======================================================
// TOGGLE PURCHASE ORDER
// ======================================================

function togglePO(id){

    const box = document.getElementById("po_" + id);

    if(!box) return;

    box.style.display =
        box.style.display === "none"
        ? "block"
        : "none";

}
// ======================================================
// FILTER PURCHASE ORDERS
// ======================================================

// ======================================================
// FILTER PURCHASE ORDERS
// ======================================================

function filterPurchaseOrders(){

    console.log("Search Fired");

    const keyword = document
        .getElementById("poSearch")
        .value
        .trim()
        .toLowerCase();

    console.log(keyword);

    console.log("Total PO:", purchaseOrders.length);

    filteredPurchaseOrders = purchaseOrders.filter(row=>{

        return (

            String(row["OrderID / PI NO"] || "")
                .toLowerCase()
                .includes(keyword)

            ||

            String(row["Supplier"] || "")
                .toLowerCase()
                .includes(keyword)

            ||

            String(row["MODELS"] || "")
                .toLowerCase()
                .includes(keyword)

        );

    });

    console.log("Filtered:", filteredPurchaseOrders.length);

    buildPurchaseOrders();

}
