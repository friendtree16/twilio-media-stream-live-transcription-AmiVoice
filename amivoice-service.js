const EventEmitter = require('events');
const WebSocketClient = require('websocket').client;

class AmiVoiceService extends EventEmitter {
    constructor(apiKey, track = 'inbound') {
        super();
        this.apiKey = apiKey;
        this.track = track;
        this.isReady = false;
        this.connect();
    }

    connect() {
        if (!this.isReady) {
            const client = new WebSocketClient();

            client.on('connectFailed', error => {
                console.log('Connect Error: ' + error.toString());
                this.isReady = false;
            });

            client.on('connect', connection => {
                this.connection = connection;
                console.log('amivoice connected');

                connection.on('message', message => {
                    if (message.type === 'utf8') {
                        const tag = message.utf8Data.charAt(0);
                        if (tag == 's') {
                            // 認識スタート
                            console.log('amiVoice started.');
                            this.isStarted = true;
                        } else if (tag === 'S') {
                            // サーバ内で発話区間の先頭が検出された S <start_time>
                        } else if (tag === 'E') {
                            // サーバ内で発話区間の終端が検出された　E <end_time>
                        } else if (tag === 'C') {
                            // サーバ内で検出した発話区間に対する認識処理が開始された
                        } else if (tag === 'U') {
                            // サーバ内で検出した発話区間に対する認識処理中に、認識途中結果を知らせる
                            const data = JSON.parse(message.utf8Data.substring(2));
                            console.log('認識中 track:' + this.track + ' message:' + data.text);
                        } else if (tag === 'A') {
                            // 認識処理が完了し、認識結果が受容されたとき
                            const data = JSON.parse(message.utf8Data.substring(2));
                            console.log('確定  track:' + this.track + ' message:' + data.text);
                            this.emit('transcription', {track:this.track,body:data});
                        } else if (tag === 'G') {
                            // サーバ内で生成されたアクション情報 ※このイベントは無視する
                            //https://acp.amivoice.com/main/manual/g-%e3%82%a4%e3%83%99%e3%83%b3%e3%83%88%e3%83%91%e3%82%b1%e3%83%83%e3%83%88/
                        } else if (tag == 'e') {
                            this.isStarted = false;
                            console.log('amiVoice closed.');
                        }
                    }
                });
                
                connection.on('error', error => {
                    console.log("Connection Error: " + error.toString());
                });
                
                connection.on('close', () => {
                    this.isStarted = false;
                    this.isReady = false;
                    console.log('echo-protocol Connection Closed');
                });
                
                this.isReady = true;
                this.start();
            });

            client.connect('wss://acp-api.amivoice.com/v1/');
        }
    }

    start() {
        if (!this.isReady) {
            console.log('start connection');
            this.connect();
            return;
        }

        if (this.isReady && !this.isStarted) {
            var command = "s";
            command += " mulaw";
            command += " -a-general";
            command += " authorization=" + this.apiKey;
            console.log(command);
            this.connection.send(command);
        }
    }

    send(payload) {
        if (this.isStarted) {
            const buff = Buffer.from(payload, 'base64');

            const outData = new Uint8Array(buff.length + 1);
            outData[0] = 0x70; // 'p'
            for (var i = 0; i < buff.length; i++) {
                outData[1 + i] = buff[i];
            }
            this.connection.send(Buffer.from(outData));
        }
    }

    close() {
        if (this.isStarted && this.isReady) {
            const endCommand = "e";
            this.connection.send(endCommand);
            this.isStarted = false;
            console.log('send close command');
        }
    }
}

module.exports = {
    AmiVoiceService,
};