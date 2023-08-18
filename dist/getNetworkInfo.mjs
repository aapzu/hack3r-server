import { execSync } from 'child_process';
import { fromPairs } from 'lodash';
const getNetworkInfo = () => {
    const NETWORK_REGEX = /^(?<networkInterface>\w+): .+\n(?:.+\n){0,10}\s+inet\s(?<inetAddress>[\d\.]+)/;
    const stdout = execSync('ifconfig').toString();
    const sections = stdout.split(/\n{2,3}(?=\S)/g);
    const networkInfoArray = sections
        .filter(s => NETWORK_REGEX.test(s))
        .map(section => {
        const match = section.match(NETWORK_REGEX);
        if (!match || !match.groups) {
            throw new Error(`Invalid network section: ${section}`);
        }
        const { groups: { networkInterface, inetAddress } } = match;
        return [networkInterface, { inet: inetAddress }];
    });
    return fromPairs(networkInfoArray);
};
export default getNetworkInfo;
//# sourceMappingURL=getNetworkInfo.mjs.map