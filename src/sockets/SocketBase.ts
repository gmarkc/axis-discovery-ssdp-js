import * as expect from '@fantasticfiasco/expect';
import * as dgram from 'dgram';
import * as events from 'events';
import { AddressInfo } from 'net';

import { log } from '../logging';

export abstract class SocketBase extends events.EventEmitter {

    protected socket?: dgram.Socket;

    /**
     * Start listen for advertisements.
     */
    public async start(): Promise<void> {
        expect.toNotExist(this.socket, 'Socket has already been started');

        this.socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
        this.socket.on('listening', () => this.onListening());
        this.socket.on('message', (message: Buffer, remote: AddressInfo) => this.onMessage(message, remote));
        this.socket.on('error', (error: Error) => this.onError(error));

        await this.bind();
    }

    /**
     * Stop listen for advertisements.
     */
    public stop(): Promise<void> {
        expect.toExist(this.socket, 'Socket has never been started');

        return new Promise<void>((resolve) => {
            this.socket!.close(() => resolve());
        });
    }

    protected abstract onListening(): void;

    protected abstract onMessage(messageBuffer: Buffer, remote: AddressInfo): void;

    protected abstract bind(): Promise<void>;

    protected onError(error: Error) {
        log('SocketBase#onError - %o', error);
    }
}
