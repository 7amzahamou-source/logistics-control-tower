// ======================================================
// Logistics Control Tower
// Designed & Developed by Hamza Hamou
// Version 3.0
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

        shipments = await response.json();

        shipments.sort((a,b)=>{

            return new Date(a["ETA"]) - new Date(b["ETA"]);

        });

        filteredData = [...shipments];

        loadFilters();

        renderDashboard(filteredData);

    }

    catch(error){

        console.error(error);

        alert("Unable to load Google Sheet.");

    }

}



// ======================================================
// RENDER DASHBOARD
// ======================================================

function renderDashboard(data){

    updateKPIs(data);

    if(window.innerWidth <= 768){

        fillMobileCards(data);

    }

    else{

        fillTable(data);

    }

    drawFactoryChart(data);

    drawETAChart(data);

}



// ======================================================
// WINDOW RESIZE
// ======================================================

window.addEventListener("resize",()=>{

    renderDashboard(filteredData);

});



// ======================================================
// START APPLICATION
// ======================================================

loadData();// ======================================================
// DESKTOP TABLE
// ======================================================

function fillTable(data){

    const table = document.getElementById("shipmentTable");

    table.innerHTML = "";

    data.forEach((row,index)=>{

        table.innerHTML += `

        <tr>

            <td>${index+1}</td>

            <td>

                <a href="#"

                onclick="openShipment('${row["P I"]}');return false;">

                    ${row["P I"]||""}

                </a>

            </td>

            <td>${row["C/I No"]||""}</td>

            <td>${row["FACTORY"]||""}</td>

            <td>${row["ENTRY"]||""}</td>

            <td>${row["HQ"]||0}</td>

            <td>${row["POD"]||""}</td>

            <td title="${row["MODEL"]||""}">

                ${row["MODEL"]||""}

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

    container.innerHTML="";

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

                    ${row["HQ"]||0}

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

}// ======================================================
// KPI
// ======================================================

function updateKPIs(data){

    const totalHQ = data.reduce(

        (sum,row)=>sum + Number(row["HQ"]||0)

    ,0);

    const totalQty = data.reduce(

        (sum,row)=>sum + Number(row["QTY"]||0)

    ,0);

    document.getElementById("totalHQ").innerHTML =
    totalHQ.toLocaleString();

    document.getElementById("totalQty").innerHTML =
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

    factoryFilter.innerHTML =
    '<option value="">All Factories</option>';

    podFilter.innerHTML =
    '<option value="">All POD</option>';

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

    document

    .getElementById("factoryFilter")

    .value;

    const pod =

    document

    .getElementById("podFilter")

    .value;

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

        const matchSearch =

        pi.includes(search)

        ||

        model.includes(search)

        ||

        fac.includes(search);

        const matchFactory =

        factory=="" ||

        row["FACTORY"]===factory;

        const matchPOD =

        pod=="" ||

        row["POD"]===pod;

        return (

            matchSearch

            &&

            matchFactory

            &&

            matchPOD

        );

    });

    renderDashboard(filteredData);

}



// ======================================================
// RESET FILTERS
// ======================================================

function resetFilters(){

    document.getElementById("search").value="";

    document.getElementById("factoryFilter").value="";

    document.getElementById("podFilter").value="";

    filteredData=[...shipments];

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

            column==="ENTRY"

            ||

            column==="HQ"

            ||

            column==="QTY"

        ){

            valueA = Number(valueA);

            valueB = Number(valueB);

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

        if(valueA < valueB)

        return asc ? -1 : 1;

        if(valueA > valueB)

        return asc ? 1 : -1;

        return 0;

    });

    renderDashboard(filteredData);

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
// PAGE LOADED
// ======================================================

document.addEventListener("DOMContentLoaded",()=>{

    loadData();

});
