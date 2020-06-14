const http = require('http');
const WebSocketServer = require('websocket').server;

class wss {
    constructor(port) {
        this.server = http.createServer((req, res)=>{});
        this.server.listen(port, ()=>{
            console.log(`${new Date()} WebSocketServer is listening on port ${port}`);
        })

        this.wss = new WebSocketServer({
            httpServer: this.server
        })

        this.codeGenArray = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','0','1','2','3','4','5','6','7','8','9'];
        this.clients = {};
        this.counter = 0;

        this.wss.on('request', (r) => {
            let connection = r.accept('echo-protocol', r.origin);

            let id = this.counter++;
            this.clients[id] = connection;

            connection.on('message', (m) => {
                var msg = m.utf8Data;
                if (msg.startsWith('Spy Report on hex') || msg.startsWith('DEBUG Spy Report on hex')) {
                    let station = lib.fnc.getStationInformation(msg);
                    var codeWorking = false, code;
                    while (!codeWorking) {
                        var codeFound = false;
                        code = '';
                        for (var i=0;i<6;i++) {
                            code += this.codeGenArray[Math.floor(Math.random() * this.codeGenArray.length)];
                        }
                        for (var i=0;i<reports.length;i++) {
                            if (reports[i].code == code) {
                                codeFound = true;
                            }
                        }
                        if (!codeFound) codeWorking = true;
                    }
                    reports.push({code: code, data: station, msg: msg});
                    this.clients[id].send(code);
                    console.log(`[+ | CODE] ${code}`);
                }
            });

            connection.on('close', (reasonCode, description) => {
                delete this.clients[id];
            });
        })
    }
}

module.exports = wss;