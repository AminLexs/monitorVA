function getStringWithoutStrangeSymbols(str) {
  const regex = /[\x0F]|[\x01]|[\x00]|[\x17]|[\x02]|[\x15]|[\x16]|[\x1D]/g;
  return str.replace(regex, ' ');
}

module.exports.getStringWithoutStrangeSymbols = getStringWithoutStrangeSymbols;
