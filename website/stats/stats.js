function createChart({days, now, chart, data, datasetID}) {
    let months = [31,28,31,30,31,30,31,31,30,31,30,31];
    if (now.getFullYear()%400==0||now.getFullYear()%100!=0&&now.getFullYear()%4==0) {
        months[1]++;
    }
    let labels= [];
    let finalData = [];
    for (let i=0; i<days; i++) {
        let day = now.getDate() - days+i;
        let month = now.getMonth();
        let year = now.getFullYear();
        if (day<1) {
            month--;
            if (month<0) {
                month+12;
                year--;
            }
            day+=months[month];
        }
        month++;
        labels.push(`${(day<10)?'0'+day:day}/${(month<10)?'0'+month:month}/${year}`);
        let counter = 0;
        data.forEach((event) => {
            if (event.timestamp.day == day && event.timestamp.month == month && event.timestamp.year == year) {
                if (event.count && event.type=='guild_total') {
                    counter = event.count;
                } else {
                    counter++;
                }
            }
        })
        finalData.push(counter);
    }
    chart.data.labels = labels;
    chart.data.datasets[datasetID].data = finalData;
    chart.update();
}

async function tick(servers_chart, reports_chart, commands_chart) {
    const DAYS_BACK_PERIOD = 7;
    let serversReq = new XMLHttpRequest();
    let serversAddReq = new XMLHttpRequest();
    let serversRemReq = new XMLHttpRequest();
    let reportsReq = new XMLHttpRequest();
    let commandsReq = new XMLHttpRequest();
    serversReq.open('GET', 'https://starborne-assistant.com:2300/api/stats/servers?period='+DAYS_BACK_PERIOD, false);
    serversAddReq.open('GET', 'https://starborne-assistant.com:2300/api/stats/servers?type=guild_added&period='+DAYS_BACK_PERIOD, false);
    serversRemReq.open('GET', 'https://starborne-assistant.com:2300/api/stats/servers?type=guild_removed&period='+DAYS_BACK_PERIOD, false);
    reportsReq.open('GET', 'https://starborne-assistant.com:2300/api/stats/reports?period='+DAYS_BACK_PERIOD, false);
    commandsReq.open('GET', 'https://starborne-assistant.com:2300/api/stats/commands?period='+DAYS_BACK_PERIOD, false);
    await serversReq.send();
    await serversAddReq.send();
    await serversRemReq.send();
    await reportsReq.send();
    await commandsReq.send();

    let servers = JSON.parse(serversReq.responseText);
    let serversAdd = JSON.parse(serversAddReq.responseText);
    let serversRem = JSON.parse(serversRemReq.responseText);
    let reports = JSON.parse(reportsReq.responseText);
    let commands = JSON.parse(commandsReq.responseText);

    let now = new Date();
    
    if (!servers.error) {
        createChart({days:DAYS_BACK_PERIOD, now:now, data:servers.data, chart: servers_chart, datasetID: 2});
    }
    if (!serversAdd.error) {
        createChart({days:DAYS_BACK_PERIOD, now:now, data:serversAdd.data, chart: servers_chart, datasetID: 1});
    }
    if (!serversRem.error) {
        createChart({days:DAYS_BACK_PERIOD, now:now, data:serversRem.data, chart: servers_chart, datasetID: 0});
    }
    if (!reports.error) {
        createChart({days:DAYS_BACK_PERIOD, now:now, data:reports.data, chart: reports_chart, datasetID: 0});
    }
    if (!commands.error) {
        createChart({days:DAYS_BACK_PERIOD, now:now, data:commands.data, chart: commands_chart, datasetID: 0});
    }
}

window.addEventListener('load', () => {
    Chart.defaults.global.defaultFontColor = '#FFFFFF';

    let ctx_servers = document.getElementById('servers_chart').getContext('2d');
    let ctx_reports = document.getElementById('reports_chart').getContext('2d');
    let ctx_commands = document.getElementById('commands_chart').getContext('2d');

    let servers_chart = new Chart(ctx_servers, {
        // The type of chart we want to create
        type: 'line',
    
        // The data for our dataset
        data: {
            labels: [],
            datasets: [{
                label: 'Removed',
                borderColor: '#ff4a4a',
                backgroundColor: '#ff4a4a',
                data: []
            },{
                label: 'Added',
                borderColor: '#59ff80',
                backgroundColor: '#59ff80',
                data: []
            },{
                label: 'Total',
                borderColor: '#46f2de',
                backgroundColor: '#46f2de',
                data: []
            }
            ]
        },
    
        // Configuration options go here
        options: {
            title: {
                display: true,
                text: 'Servers'
            },
            borderJoinStyle: 'round',
            elements: {
                line: {
                    tension: 0
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInCubic'
            }
        }
    });


    let reports_chart = new Chart(ctx_reports, {
        // The type of chart we want to create - #39f77f
        type: 'line',
    
        // The data for our dataset
        data: {
            labels: [],
            datasets: [{
                label: 'Processed',
                borderColor: '#758aff',
                backgroundColor: '#758aff',
                data: []
            }]
        },
    
        // Configuration options go here
        options: {
            title: {
                display: true,
                text: 'Reports'
            },
            borderJoinStyle: 'round',
            elements: {
                line: {
                    tension: 0
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInCubic'
            }
        }
    });

    let commands_chart = new Chart(ctx_commands, {
        // The type of chart we want to create - #39f77f
        type: 'line',
    
        // The data for our dataset
        data: {
            labels: [],
            datasets: [{
                label: 'Used',
                borderColor: '#fffd73',
                backgroundColor: '#fffd73',
                data: []
            }]
        },
    
        // Configuration options go here
        options: {
            title: {
                display: true,
                text: 'Commands'
            },
            borderJoinStyle: 'round',
            elements: {
                line: {
                    tension: 0
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInCubic'
            }
        }
    });

    setInterval(tick, 30000, servers_chart, reports_chart, commands_chart);
    setTimeout(tick, 500, servers_chart, reports_chart, commands_chart);
})