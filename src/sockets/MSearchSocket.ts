import * as dgram from 'dgram';

import * as constants from './Constants';
import { MSearch } from './MSearch';
import { Message } from './Message';
import { SocketBase } from './SocketBase';

/**
 * Class representing a SSDP socket that support the HTTP method M-SEARCH.
 */
export class MSearchSocket extends SocketBase {
    /**
     * @address The network address to listen for M-SEARCH responses on.
     */
    constructor(private address: string) {
        super();
    }

    /**
     * Starts a search by using HTTP method M-SEARCH.
     */
    search() {
        const message = new MSearch().toBuffer();
        this.socket.send(
            message,
            0,
            message.length,
            constants.SSDP_PORT,
            constants.SSDP_MULTICAST_ADDRESS);
    }

    protected onListening() {
        const address = this.socket.address();
        console.log(`M-SEARCH socket is now listening on ${address.address}:${address.port}`);

        // Trigger a search when socket is ready
        this.search();
    }

    protected onMessage(messageBuffer: Buffer, remote: dgram.AddressInfo) {
        const message = new Message(remote.address, messageBuffer);

        if (message.method !== 'HTTP/1.1 200 OK') {
            return;
        }

        this.emit('hello', message);
    }

    protected bind() {
        this.socket.bind(undefined, this.address);
    }
}
