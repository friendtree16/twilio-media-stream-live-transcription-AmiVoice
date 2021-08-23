class AmiVoiceService {
    constructor(apiKey, track = 'inbound') {
        this.apiKey = apiKey;
        this.track = track;
    }

    connect() {
        this.client = new WebSocketClient();

        this.client.on('connectFailed', function (error) {
            console.log('Connect Error: ' + error.toString());
        });

        this.client.on('connect', function (connection) {
            amiVoiceConnection = connection;
        });

        client.connect('wss://acp-api.amivoice.com/v1/');
    }

    receiveAmiVoiceMessage(message) {
        if (message.type === 'utf8') {
            const tag = message.utf8Data.charAt(0);
            if (tag == 's') {
                // 認識スタート
                console.log('amiVoice started.');
                this.started = true;
            } else if (tag === 'S') {
                // サーバ内で発話区間の先頭が検出された S <start_time>
            } else if (tag === 'E') {
                // サーバ内で発話区間の終端が検出された　E <end_time>
            } else if (tag === 'C') {
                // サーバ内で検出した発話区間に対する認識処理が開始された
            } else if (tag === 'U') {
                // サーバ内で検出した発話区間に対する認識処理中に、認識途中結果を知らせる
                const data = JSON.parse(message.utf8Data.substring(2));
                log(data.text);
            } else if (tag === 'A') {
                // 認識処理が完了し、認識結果が受容されたとき
                const data = JSON.parse(message.utf8Data.substring(2));
                log(data.text);
            } else if (tag === 'G') {
                // サーバ内で生成されたアクション情報 ※このイベントは無視する
                //https://acp.amivoice.com/main/manual/g-%e3%82%a4%e3%83%99%e3%83%b3%e3%83%88%e3%83%91%e3%82%b1%e3%83%83%e3%83%88/
            } else if (tag == 'e') {
                this.started = false;
            }
        }
    }

    closeAmiVoice() {
        console.log('echo-protocol Connection Closed');
    }

    errorAmiVoice(error) {
        console.log("Connection Error: " + error.toString());
    }

}