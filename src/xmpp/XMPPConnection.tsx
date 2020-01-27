// @ts-ignore
import _Element from 'ltx/lib/Element';
// @ts-ignore
import { Client } from '@xmpp/client-core/lib/Client';
// @ts-ignore
import { Reconnect } from '@xmpp/reconnect';
import NetUtils from '../utils/NetUtils';

const { client, xml, jid } = require('@xmpp/client');


/**
 *
 * https://github.com/xmppjs/xmpp.js/tree/master/packages/client#transports
 *
 * xmpp is an instance of EventEmitter.


 *
 */

export interface XMPPListener {
    onLogin() : void,
    shouldConnect() : boolean,
    onMessageReceived(from : string, body : string, stanza : _Element, type : 'normal'|'chat'|'groupchat'|'headline'|'error'):void,
    onLoginError(message : string) : void,

}
export default class XMPPConnection {

    private mListeners : XMPPListener;

    private mConnection : Client = null;

    private queueId : number = -1;

    private lastTryMillis: number = 0;

    private interval : number = 10000;

    // try once every 10 seconds
    private lastReceivedStanzaTime : number | undefined;

    private lastSentPingUUID : String | undefined;

    private pingTimeoutTime = 10000;

    private pingCheckInterval = 30000;

    private mHealthCheckInternal : NodeJS.Timeout;

    private mConnectionProperties : {
        host:string,
        port:number,
        resource:string,
        domain:string,
        username : string,
        password:string,
    };

    constructor(host : string, port : number, resource : string, domain : string, username : string, password : string) {
      this.mConnectionProperties = {
        host,
        port,
        resource,
        domain,
        username,
        password,
      };
    }

    public setListeners(listeners : XMPPListener) {
      this.mListeners = listeners;
    }

    private createConnection() {
      const prop = this.mConnectionProperties;
      this.mConnection = client({
        service: `ws://${prop.host}:${prop.port}/ws/`,
        domain: prop.domain,
        resource: prop.resource,
        username: prop.username,
        password: prop.password,
      });

      this.mHealthCheckInternal = setInterval(() => {
        if (this.isConnected() && this.lastReceivedStanzaTime && (Date.now() - this.lastReceivedStanzaTime) >= this.pingCheckInterval) {
          this.ping();
        }
      }, this.pingCheckInterval);

      NetUtils.addListener(this.mConnectionListener);

      this.mConnection.on('error', (err : any) => {
        console.log('❌', err.toString());
        this.connectIfNeeded();
      });

      // Emitted when the connection is closed an no further attempt to reconnect will happen, after calling mConnection.stop().
      this.mConnection.on('offline', () => {
        console.log('⏹', 'offline');
      });

      this.mConnection.on('stanza', async (stan : any) => {
        this.lastReceivedStanzaTime = Date.now();
        // STANZA {"name":"message","attrs":{"xmlns":"jabber:client","from":"hamyar133"},"children":[{"name":"body","attrs":{},"children":["Hello"]}]}

        const stanza : _Element = stan;

        if (stanza.is('message')) {
          const child : _Element = stanza.getChild('body');
          const bodyText = child.children[0];
          this.mListeners.onMessageReceived(stanza.getAttr('from'), bodyText, stanza, stanza.attrs.type);
        } else if (stanza.is('iq')) {
          // IQ {"name":"iq","attrs":{"xmlns":"jabber:client","type":"result","id":"qpedfaxlfzm","to":"hamyar133/84gjz7ezg6"},"children":[{"name":"bind","attrs":{"xmlns":"urn:ietf:params:xml:ns:xmpp-bind"},"children":[{"name":"jid","attrs":{},"children":["hap09305211601@hamyar133/hamyar133"]}]}]}

          const id = stanza.getAttr('id');

          if (this.lastSentPingUUID && this.lastSentPingUUID === id) { // && (Date.now() - this.lastReceivedStanzaTime >= this.pingCheckInterval)
            this.lastSentPingUUID = null;
            // pong received
          }
          this.lastReceivedStanzaTime = Date.now();
        }
      });

      this.mConnection.on('disconnect', () => {
        this.connectIfNeeded(false);
      });

      // Emitted when connected, authenticated and ready to receive/send stanzas.
      this.mConnection.on('online', async (address : any) => {
        console.log('▶', 'online as', address.toString());
        await this.mConnection.send(xml('presence'));
        this.mListeners.onLogin();
      });


      this.mConnection.on('status', (status : any) => {
        console.debug('🛈', 'status', status);
      });
      this.mConnection.on('input', (input : any) => {
        this.lastReceivedStanzaTime = Date.now();
        console.debug('⮈', input);
      });
      this.mConnection.on('output', (output : any) => {
        console.debug('⮊', output);
      });
    }

    public login() {

      if (this.mConnection) {
        this.getReconnect().stop();
      }

      this.connectIfNeeded();
    }

    public _userForName(name : string) {
      return `${name}@${this.mConnectionProperties.domain}/${this.mConnectionProperties.resource}`;
    }

    private guid = () => {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }
      return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
    }

    private ping = () => {
      const uuid = this.guid();
      this.lastSentPingUUID = uuid;

      const messageStanza = xml('iq', { from: `${this.mConnectionProperties.username}/${this.mConnectionProperties.resource}`, id: uuid, type: 'get' });
      messageStanza
        .c('ping', { xmlns: 'urn:xmpp:ping' })
        .up();

      this.mConnection.send(messageStanza).then((res : any) => {
        setTimeout(() => {
          if (this.lastSentPingUUID && this.lastSentPingUUID === uuid) {
            this.pingFailed();
          }
        }, this.pingTimeoutTime);// allow 10 seconds for response
      }).catch((error : string) => {
        this.pingFailed();
      });
    };

    private pingFailed = () => {
      console.log('ping failed');
      this.disconnect();
    };

    public sendMessage = (message : String, receiver : String) => {
      const messageStanza = xml('message', { to: receiver, type: 'chat' });

      messageStanza
        .c('body', {})
        .t(message)
        .up();

      /* const stanza = xml(
             'message',
             {type: 'chat', to: receiver},
             xml('body', message)
         ); */
      this.mConnection.send(messageStanza).catch((error : string) => {
        console.log(error);
      });
    };

    /**
     *  *
     online: indicates that xmpp is authenticated and addressable. It is emitted every time there is a successful (re)connection.
     offline: indicates that xmpp disconnected and no automatic attempt to reconnect will happen (after calling xmpp.stop()).
     connecting: Socket is connecting
     connect: Socket is connected
     opening: Stream is opening
     open: Stream is open
     closing: Stream is closing
     close: Stream is closed
     disconnecting: Socket is disconnecting
     disconnect: Socket is disconnected
     * @returns {boolean}
     */
    public isConnected = () => Boolean(this.mConnection && (this.mConnection.status === 'online'))// NetUtils.isConnected() &&
    ;

    public isConnecting = () => Boolean(this.mConnection && (this.mConnection.status === 'connecting'))// or .status !== 'disconnect' && .status !== 'offline'  ?
    ;

    public getReconnect = () : Reconnect => this.mConnection.reconnect;

    private mConnectionListener = (isConnected : boolean) => {

      if (isConnected) {
        if (this.queueId !== -1) {
          clearTimeout(this.queueId);
          this.queueId = -1;
        }
        this.connectIfNeeded(true);
      } else if (this.isConnected() || this.isConnecting()) {
        this.disconnect();
      }
    };


    private connectIfNeeded = (force = false) => {

      console.log(`asked to force connect connected?${this.isConnected()} , network available ? ${NetUtils.isConnected()}`);

      if (this.isConnecting() || (this.isConnected())) {
        console.log('aready connected or connecting');
        return;
      }

      if (this.queueId !== -1) {
        console.log(`connect not needed , queueId ${this.queueId}`);
        return;
      }

      if (this.mListeners.shouldConnect() && this.mConnectionProperties.username && this.mConnectionProperties.password) { //
        if (!NetUtils.isConnected()) {
          console.log('no network , we will not try untill we are online');
          // we dont queue connect , instead we add listener for connectivity , waiting for it to come online
          return;
        }
        if (force || this.lastTryMillis === 0 || (Date.now() - this.lastTryMillis) >= this.interval) {
          console.log('connecting executed');
          this.executeConnecting();
        } else {
          console.log('connect not needed , due to timing');
          this.queueConnect();
        }
      }
    };

    private executeConnecting = () => {
      if (this.queueId !== -1) {
        clearTimeout(this.queueId);
        this.queueId = -1;
      }
      if (this.isConnecting()) {
        console.log(`already connecting ${this.mConnection.status}`);
        return;
      }
      this.lastTryMillis = Date.now();
      // try to login to test domain with the same password as username

      if (!this.mConnection || this.mConnection.status === 'offline') {
        this.createConnection();
        this.mConnection.start().catch((error : string) => {
          this.mListeners.onLoginError(error);

          if (error && (error.toString().indexOf('not-authorized') !== -1 || error.toString().indexOf('InvalidCharacterError') !== -1)) {
            this.disconnect();
          }
        });
      } else {
        this.getReconnect().reconnect().catch((error : string) => {
          console.log(error);
          this.mListeners.onLoginError(error);
          if (error && (error.toString().indexOf('not-authorized') !== -1 || error.toString().indexOf('InvalidCharacterError') !== -1)) {
            this.disconnect();
          }
        });
      }
    };

    private queueConnect = () => {
      this.queueId = setTimeout(() => {
        this.queueId = -1;
        this.connectIfNeeded();
      }, this.lastTryMillis === 0 ? this.interval : this.interval - (Date.now() - this.lastTryMillis));
    };

    disconnect = () => {
      if (this.queueId !== -1) {
        clearTimeout(this.queueId);
      }
      clearInterval(this.mHealthCheckInternal);
      NetUtils.removeListener(this.mConnectionListener);
      if (this.mConnection) {
        this.mConnection.stop().catch((error : string) => {
          console.log(error);
        });
      }
    };

}
