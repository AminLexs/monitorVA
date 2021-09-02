function getHumanPeriod ( time ) {

    var second = 1000
    var minute = 60000
    var hour = 3600000
    var day = 86400000

    var resultTime = time
    var d, h, m, s
    var result = ''

    d = Math.floor(resultTime / day)
    if (d > 0) {
        resultTime = resultTime % day
    }
    h = Math.floor(resultTime / hour)
    if (h > 0) {
        resultTime = resultTime % hour
    }
    m = Math.floor(resultTime / minute)
    if (m > 0) {
        resultTime = resultTime % minute
    }
    s = Math.floor(resultTime / second)

    if (d > 0) {
        result += d + 'd '
    }
    if (h > 0) {
        result += h + 'h '
    }
    if (m > 0) {
        result += m + 'm '
    }

    result += s + 's'

    return result
}

function getHumanBytes (bytes, precision) {
    //console.log('bytes', bytes)

    var kilobyte = 1024
    var megabyte = kilobyte * 1024
    var gigabyte = megabyte * 1024
    var terabyte = gigabyte * 1024

    if ((bytes >= 0) &&
        (bytes < kilobyte)) {

        return bytes + ' B'
    }
    else if ((bytes >= kilobyte) &&
        (bytes < megabyte)) {

        return (bytes / kilobyte).toFixed(precision) + ' KB'
    }
    else if ((bytes >= megabyte) &&
        (bytes < gigabyte)) {

        return (bytes / megabyte).toFixed(precision) + ' MB'
    }
    else if ((bytes >= gigabyte) &&
        (bytes < terabyte)) {

        return (bytes / gigabyte).toFixed(precision) + ' GB'
    }
    else if (bytes >= terabyte) {
        return (bytes / terabyte).toFixed(precision) + ' TB'
    }
    else {
        return bytes + ' B'
    }
}

function listFormat ( type, value ) {

    switch (type) {
        case 'script':
            return value ? path.basename(value) : 'N/C'
        case 'memory':
            return value ? getHumanBytes(value) : 'N/C'
        case 'uptime':
            return value > 0 ? getHumanPeriod(value) : 'N/C'
        case 'pid':
            return value || 'N/C'
        case 'host':
            return value ? value.replace('http://',''): 'N/C'
        case 'status':
            return value == 'up' ? "up" : "down"
        case 'enabled':
            return value ? "yes" : "no"
        case 'port':
            return value || 'N/C'
        case 'date':
            return (new Date(+value * 1000)).toString()
        case 'run':
            return value != ':' ? value : 'N/C'
        default:
            return value
    }
    return ''
}

function createTable(headings, contentElements, howToParse) {
    let tableElement = document.createElement('table');
    tableElement.id = 'listTable'
    tableElement.className = 'centered'
    let tHead = document.createElement("thead")
    let trHead = document.createElement("tr")
    headings.forEach(elem => {
        let thHead = document.createElement("th")
        thHead.innerHTML = elem
        trHead.append(thHead)
    })
    tHead.append(trHead)
    tableElement.append(tHead)

    let tBody = document.createElement("tbody")
    contentElements.forEach(contElem => {
        let tr = document.createElement("tr")
        let index = 0
        howToParse[0].forEach(elem=>{
            let td = document.createElement("td")
            td.innerHTML = listFormat(howToParse[1][index],contElem[elem])
            index++
            tr.append(td)
        })
        tBody.append(tr)
    })
    tableElement.append(tBody)
    document.getElementById("content").appendChild(tableElement);
}

function createCanvas(id,width,height){
    var inputElement = document.createElement('canvas');
    inputElement.id = id
    inputElement.width = (width!==undefined)? width:600
    inputElement.height = (height!==undefined)? height:400
    document.getElementById("content").appendChild(inputElement);
}

function createLineChart(canvas,label,vertLabel){
    return new Chart(canvas, {
        type: 'line',
        label:label,
        data: {
            labels: ["0s"],
            datasets: []
        },
        options: {
            responsive: false,

            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Время'
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: vertLabel
                    }
                }]
            }
        }
    });
}



let colors =  ['rgba(255,99,132,0.6)', 'rgba(255,99,132,0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)',
    'rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)',
    'rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)',
    'rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)'
]

module.exports.createLineChart = createLineChart
module.exports.createTable = createTable
module.exports.createCanvas = createCanvas
module.exports.getHumanPeriod = getHumanPeriod