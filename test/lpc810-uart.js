var Uart = require('../').Uart,
  uart4 = new Uart('/dev/ttyO4', {baudRate: Uart.B115200}),
  sendBuf = new Buffer([0]);
  bytesReceived = 0;

uart4.once('ready', function () {
  uart4.write(sendBuf);
});

uart4.on('data', function (chunk) {
  bytesReceived += chunk.length;
  if (bytesReceived === 11520) {
    console.log(chunk[0]);
    sendBuf[0] = (sendBuf[0] + 1) % 256 ;
    uart4.write(sendBuf);
    bytesReceived = 0;
  }
});

