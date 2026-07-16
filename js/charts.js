// ======================================================
// CHARTS.JS
// Logistics Control Tower V2
// ======================================================

let factoryChart = null;
let etaChart = null;

// ======================================================
// REFRESH ALL CHARTS
// ======================================================

function refreshCharts(data){

    drawFactoryChart(data);

    drawETAChart(data);

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

    const canvas =
        document.getElementById("factoryChart");

    if(!canvas) return;

    factoryChart = new Chart(canvas,{

        type:"bar",

        plugins:[ChartDataLabels],

        data:{

            labels:labels,

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
                        Number(value).toLocaleString()

                }

            },

            scales:{

                x:{

                    beginAtZero:true,

                    ticks:{

                        color:"#555",

                        precision:0

                    },

                    grid:{

                        color:"#edf2f7"

                    }

                },

                y:{

                    ticks:{

                        color:"#333",

                        font:{

                            size:12,

                            weight:"600"

                        }

                    },

                    grid:{

                        display:false

                    }

                }

            }

        }

    });

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

    const labels =
        Object.keys(result);

    const values =
        Object.values(result);

    if(etaChart){

        etaChart.destroy();

    }

    const canvas =
        document.getElementById("etaChart");

    if(!canvas) return;

    etaChart = new Chart(canvas,{

        type:"bar",

        plugins:[ChartDataLabels],

        data:{

            labels:labels,

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
                        Number(value).toLocaleString()

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

                        color:"#555",

                        precision:0

                    },

                    grid:{

                        color:"#edf2f7"

                    }

                }

            }

        }

    });

}
