# Twilio Media Streams と AmiVoice Cloud Platformの連携サンプル

このサンプルはTwilioの電話音声をリアルタイムに取得できるTwilio Media Streamsと[AmiVoice Cloud Platform](https://acp.amivoice.com/main/)の連携サンプルです。

## App sever setup

### Installation

**Requires Node >= v12.1.0**

以下コマンドを実行

```npm install```

#### Running the server

以下コマンドを実行

`node ./server.js`

## Setup

### 設定
1. [Twilio アカウント作成](https://cloudapi.kddi-web.com/signup)

1. [電話番号の購入](https://cloudapi.kddi-web.com/magazine/twilio-voice/how-to-buy-phone-number-from-twilio-cornsole)

1. [AmiVoice Cloud Platform アカウント作成](https://acp.amivoice.com/main/)

1. `.env.example`ファイルをコピーして`.env`ファイルを作成

1. `AMIVOICE_API_KEY`にAmiVoice Cloud Platformのマイページから取得したAPIキーを設定

1. ngrokを起動
`ngrok http 8080`

1. `templates/streams`ファイルの`<ngrok url>`部分を上記手順で起動した、ngrokのドメインに修正

5. 購入した、電話番号のA CALL COMES INに`<ngrok url>/twiml`を設定
例：'https://xxxx.ngrok.io/twiml'

## 動作例
本サンプルはリアルタイムで認識した文字をコンソールに出力いたします。
```
2022-02-03T00:59:26.634Z POST TwiML
2022-02-03T00:59:28.141Z Media WS: Connection accepted
2022-02-03T00:59:28.342Z Media WS: Connected event received:  { event: 'connected', protocol: 'Call', version: '0.2.0' }
2022-02-03T00:59:28.344Z Media WS: Start event received:  {
  event: 'start',
  sequenceNumber: '1',
  start: {
    accountSid: '',
    streamSid: '',
    callSid: '',
    tracks: [ 'inbound' ],
    mediaFormat: { encoding: 'audio/x-mulaw', sampleRate: 8000, channels: 1 }
  },
  streamSid: ''
}
amivoice connected
s mulaw -a-general authorization=
amiVoice started.
認識中 track:inbound message:1...
認識中 track:inbound message:一番...
認識中 track:inbound message:19...
認識中 track:inbound message:199...
認識中 track:inbound message:1級建築...
認識中 track:inbound message:一番吸収した...
確定  track:inbound message:一番吸収した。
2022-02-03T00:59:34.050Z inbound:一番吸収した。
send close command
amiVoice closed.
```