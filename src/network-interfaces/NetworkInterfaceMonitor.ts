import * as os from 'os';
import * as _ from 'lodash';

export class NetworkInterfaceMonitor {
    /**
     * Returns all public IPv4 addresses from all network interface cards.
     */
    getIPv4Addresses(): string[] {
        const interfaces = os.networkInterfaces();

        const addresses = _.chain(interfaces)
            .values()
            .flatten()
            .filter((entry: os.NetworkInterfaceInfo) => entry.family === 'IPv4')
            .filter((entry: os.NetworkInterfaceInfo) => !entry.internal)
            .map((entry: os.NetworkInterfaceInfo) => entry.address)
            .value();

        return addresses;
    }
}