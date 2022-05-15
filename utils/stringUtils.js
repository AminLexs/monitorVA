function getStringWithoutStrangeSymbols(str) {
  const regex = /[\x0F]|[\x01]|[\x00]|[\x17]|[\x02]|[\x15]|[\x16]|[\x1D]/g;
  return str.replace(regex, ' ');
}

function getShortContainersID(id) {
  return id.slice(0, 12);
}

module.exports.getStringWithoutStrangeSymbols = getStringWithoutStrangeSymbols;
module.exports.getShortContainersID = getShortContainersID;
