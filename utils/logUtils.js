const {formatDate} = require('./dataFormattingUtils')

function showLog(message) {
    console.log('[' + formatDate(new Date(), "%Y-%m-%d %H:%M:%S", false) + ']: ' + message + '.')
}

function showInfo(message, name) {
    showLog('[INFOS]: ' + (name ? '(' + name + ') ' : '') + message)
}

function showError(message, name) {
    showLog('[ERROR]: ' + (name ? '(' + name + ') ' : '') + message)
}

module.exports.showLog = showLog
module.exports.showInfo = showInfo
module.exports.showError = showError