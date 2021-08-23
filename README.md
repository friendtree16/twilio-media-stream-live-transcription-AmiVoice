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

1. `templates/streams`ファイルの`<ngrok url>`部分を上記手順で起動した、ngrokのものに修正

5. 購入した、電話番号のA CALL COMES INに`<ngrok url>/twiml`を設定
例：'https://xxxx.ngrok.io/twiml'