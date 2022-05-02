function formatDate(date, fstr, utc) {
    utc = utc ? 'getUTC' : 'get'
    return fstr.replace(/%[YmdHMS]/g, function (m) {
        switch (m) {
            case '%Y':
                return date[utc + 'FullYear']()
            case '%m':
                m = 1 + date[utc + 'Month']()
                break
            case '%d':
                m = date[utc + 'Date']()
                break
            case '%H':
                m = date[utc + 'Hours']()
                break
            case '%M':
                m = date[utc + 'Minutes']()
                break
            case '%S':
                m = date[utc + 'Seconds']()
                break
            default:
                return m.slice(1)
        }
        return ('0' + m).slice(-2)
    })
}

function listFormat(type, value) {
    var cfrb = color.xterm(9).bold
    var cfgb = color.xterm(10).bold
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
            return value ? value.replace('http://', '') : 'N/C'
        case 'status':
            return value === 'up' ? cfgb('up') : cfrb('down')
        case 'enabled':
            return value ? cfgb('yes') : cfrb('no')
        case 'port':
            return value || 'N/C'
        case 'run':
            return value !== ':' ? value : 'N/C'
        default:
            return value
    }

}

function getHumanPeriod(time) {

    var second = 1000
    var minute = 60000
    var hour = 3600000
    var day = 86400000

    var curTime = new Date().getTime()
    var resultTime = Math.max(curTime - time, 0)
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
    if (s > 0) {
        result += s + 's'
    }

    return result
}

function getHumanBytes(bytes, precision) {
    //console.log('bytes', bytes)

    var kilobyte = 1024
    var megabyte = kilobyte * 1024
    var gigabyte = megabyte * 1024
    var terabyte = gigabyte * 1024

    if ((bytes >= 0) &&
        (bytes < kilobyte)) {

        return bytes + ' B'
    } else if ((bytes >= kilobyte) &&
        (bytes < megabyte)) {

        return (bytes / kilobyte).toFixed(precision) + ' KB'
    } else if ((bytes >= megabyte) &&
        (bytes < gigabyte)) {

        return (bytes / megabyte).toFixed(precision) + ' MB'
    } else if ((bytes >= gigabyte) &&
        (bytes < terabyte)) {

        return (bytes / gigabyte).toFixed(precision) + ' GB'
    } else if (bytes >= terabyte) {
        return (bytes / terabyte).toFixed(precision) + ' TB'
    } else {
        return bytes + ' B'
    }
}

module.exports.formatDate = formatDate
module.exports.listFormat = listFormat
module.exports.getHumanPeriod = getHumanPeriod
module.exports.getHumanBytes = getHumanBytes