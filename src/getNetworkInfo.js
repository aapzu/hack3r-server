const { execSync } = require('node:child_process');

const getNetworkInfo = () => {
  const NETWORK_REGEX = /(?<=\n|^)(?<networkInterface>\w+).+\n(\s+.+\n){1,10}\s+inet\s(?<inetAddress>[\d\.]+)/g

  const stdout = execSync('ifconfig').toString()
  return [...stdout.matchAll(NETWORK_REGEX)].reduce((acc, { groups: { networkInterface, inetAddress } }) => ({
    ...acc,
    [networkInterface]: {
      inet: inetAddress
    },
  }), {})
}

module.exports = getNetworkInfo