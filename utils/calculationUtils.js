function calcCPUPercent(data) {
    // Calculate CPU usage based on delta from previous measurement
    let cpuUsageDelta = data.cpu_stats.cpu_usage.total_usage - data.precpu_stats.cpu_usage.total_usage
    let systemUsageDelta = data.cpu_stats.system_cpu_usage - data.precpu_stats.system_cpu_usage
    let cpuCoresAvail = data.cpu_stats.cpu_usage.percpu_usage ? data.cpu_stats.cpu_usage.percpu_usage.length : 0

    let cpuUsagePercent = 0
    if (systemUsageDelta !== 0 || cpuCoresAvail !== 0) {
        if (systemUsageDelta && systemUsageDelta !== 0) {
            cpuUsagePercent = (cpuUsageDelta / systemUsageDelta) * 4 * 100.0
        }
    }
    return cpuUsagePercent
}

function calcMemoryUsage(data) {
    let memUsage = data.memory_stats.usage
    let memAvail = data.memory_stats.limit

    let memUsagePercent = 0
    if ((memUsage !== undefined && memAvail !== undefined) && memAvail !== 0) {
        memUsagePercent = memUsage / memAvail * 100
    }
    return memUsagePercent
}

module.exports.calcCPUPercent = calcCPUPercent
module.exports.calcMemoryUsage = calcMemoryUsage
