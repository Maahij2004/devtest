const dgram = require('dgram');
const udpServer = dgram.createSocket('udp4');
function startUdpServer() {
    udpServer.on('message', (msg, rinfo) => {
        const message = msg.toString();
        console.log(`UDP message received from ${rinfo.address}:${rinfo.port}: ${message}`);
    });
    udpServer.bind(4000, () => {
        console.log('UDP server is listening on port 4000');
    });
}
module.exports = startUdpServer;