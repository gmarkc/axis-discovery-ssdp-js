import * as _ from 'lodash';

import { Constants } from '../shared/Constants';
import { Message } from '../shared/Message';
import { SsdpSocket } from '../shared/SsdpSocket';

/**
 * Class representing a SSDP socket that support the HTTP method NOTIFY.
 */
export class NotifySocket extends SsdpSocket {

	/**
	 * @addresses The network addresses to listen for NOTIFY advertisements on.
	 */
	constructor(private readonly addresses: string[]) {
		super();
	}

	protected onListening() {
		const address = this.socket.address();
		console.log(`NOTIFY socket is now listening on ${address.address}:${address.port}`);

		_.forEach(this.addresses, address => {
			this.socket.addMembership(Constants.SSDP_MULTICAST_ADDRESS, address);
		});
	}

	protected onMessage(message: Buffer, remote: any) {
		const ssdpMessage = new Message(remote.address, remote.port, remote.family, message);

		if (ssdpMessage.method != 'NOTIFY * HTTP/1.1' ||
			ssdpMessage.getHeaderValue('NT') != 'urn:axis-com:service:BasicService:1') {
			return;
		}
		
		const device = ssdpMessage.mapToDevice();
		const nts = ssdpMessage.getHeaderValue('NTS');

		if (nts === 'ssdp:alive') {
			this.emit('hello', device);
		}
		else if (nts === 'ssdp:byebye') {
			this.emit('goodbye', device);
		}
	}

	protected bind() {
		this.socket.bind(Constants.SSDP_PORT);
	}
}
