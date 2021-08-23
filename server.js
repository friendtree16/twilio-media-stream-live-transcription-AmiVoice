"use strict";

const fs = require('fs');
const path = require('path');
var http = require('http');
var HttpDispatcher = require('httpdispatcher');
var WebSocketServer = require('websocket').server;
var WebSocketClient = require('websocket').client;

var dispatcher = new HttpDispatcher();
var wsserver = http.createServer(handleRequest);
var amiVoiceConnection = null;

const HTTP_SERVER_PORT = 8080;

var mediaws = new WebSocketServer({
  httpServer: wsserver,
  autoAcceptConnections: true,
});

function log(message, ...args) {
  console.log(new Date(), message, ...args);
}

function handleRequest(request, response){
  try {
    dispatcher.dispatch(request, response);
  } catch(err) {
    console.error(err);
  }
}

dispatcher.onPost('/twiml', function(req,res) {
  log('POST TwiML');

  var filePath = path.join(__dirname+'/templates', 'streams.xml');
  var stat = fs.statSync(filePath);

  res.writeHead(200, {
    'Content-Type': 'text/xml',
    'Content-Length': stat.size
  });

  var readStream = fs.createReadStream(filePath);
  readStream.pipe(res);
});

mediaws.on('connect', function(connection) {
  log('Media WS: Connection accepted');
  new MediaStream(connection, amiVoiceConnection);
});

class MediaStream {
  constructor(connection,amiVoiceConnection) {
    connection.on('message', this.processMessage.bind(this));
    connection.on('close', this.close.bind(this));
    amiVoiceConnection.on('message', this.receiveAmiVoiceMessage.bind(this));
    amiVoiceConnection.on('error', this.errorAmiVoice.bind(this));
    amiVoiceConnection.on('close', this.closeAmiVoice.bind(this));
    this.messageCount = 0;
    this.started = false;
    this.mediaData = '';
    this.amiVoiceConnection = amiVoiceConnection;
  }

  processMessage(message) {
    if (message.type === 'utf8') {
      var data = JSON.parse(message.utf8Data);
      if (data.event === "connected") {
        log('Media WS: Connected event received: ', data);

      }
      if (data.event === "start") {
        log('Media WS: Start event received: ', data);

        var command = "s";
        command += " mulaw";
        command += " -a-general"
        command += " authorization=your api key"
        console.log(command);
        this.amiVoiceConnection.send(command);
      }
      if (data.event === "media") {
        const buff = Buffer.from(data.media.payload, 'base64');

        var outData = new Uint8Array(buff.length + 1);
        outData[0] = 0x70; // 'p'
        for (var i = 0; i < buff.length; i++) {
          outData[1 + i] = buff[i];
        }
        this.amiVoiceConnection.send(Buffer.from(outData));
      }
      if (data.event === "close") {
        log('Media WS: Close event received: ', data);
        this.close();
      }
      this.messageCount++;
    } else if (message.type === 'binary') {
      log('Media WS: binary message received (not supported)');
    }
  }

  close(){
    log('Media WS: Closed. Received a total of [' + this.messageCount + '] messages');
    if (this.started) {
      var endCommand = "e";
      this.amiVoiceConnection.send(endCommand);
    }
  }
}

wsserver.listen(HTTP_SERVER_PORT, function(){
  console.log("Server listening on: http://localhost:%s", HTTP_SERVER_PORT);
});
