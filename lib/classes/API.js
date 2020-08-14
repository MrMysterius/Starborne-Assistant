const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

module.exports = class APIServer {
    constructor (port) {
        this.port = port;

        this.eventsDir = path.join(process.cwd(), 'database/events.json');

        async function getSearch(req, res, type, dir) {
            fs.exists(dir, (isExisting)=>{
                if (!isExisting) {
                    res.send({status_code: 500, error: 'No events stored on the backend'});
                    return;
                }
                fs.readFile(dir, (err, data)=>{
                    if (err) {
                        res.send({status_code: 500, error: "Couldn't read file on backend"});
                    }
                    try {
                        let db = JSON.parse(data);
                        let now = new Date();
                        let found = [];
                        let until = req.query.period || 30;
                        until = until * 24 * 60 * 60 * 1000;
                        until = now.getTime() - until;
                        db.forEach((event) => {
                            switch (typeof type) {
                                case 'object':
                                    for (let i=0; i<type.length; i++) {
                                        if (event.type == type[i] && event.timestamp.full_timestamp >= until) {
                                            found.push(event);
                                            break;
                                        }
                                    }
                                    break;
                                case 'string':
                                    if (event.type == type && event.timestamp.full_timestamp >= until) {
                                        found.push(event);
                                    }
                                    break;
                            }
                        })
                        if (found.length == 0) {
                            res.send({status_code: 200, error: 'Nothing Found'})
                        } else {
                            res.send({status_code: 200, data: found});
                        }
                    }
                    catch (err) {
                        res.send({status_code: 500, error: err});
                    }
                })
            })
        }

        this.app = new express();

        this.app.use(cors());

        this.app.get('/', (req, res) => {
            res.writeHead(404);
            res.send('No Page Found');
        })

        this.app.get('/api/stats/commands', (req, res) => {
            getSearch(req, res, 'command', this.eventsDir);
        })

        this.app.get('/api/stats/servers', (req, res) => {
            let type = 'guild_total';
            if (req.query.type) {
                switch (req.query.type) {
                    case 'guild_added':
                        type = 'guild_added';
                        break;
                    case 'guild_removed':
                        type = 'guild_removed';
                        break;
                    case 'guild_total':
                        type = 'guild_total';
                        break;
                }
            }
            getSearch(req, res, type, this.eventsDir);
        })

        this.app.get('/api/stats/reports', (req, res) => {
            getSearch(req, res, 'report', this.eventsDir);
        })

        setTimeout(()=>{
            this.app.listen(this.port, ()=>{
                console.log(`[SERVER]\tListening on port ${this.port}`);
            })
        },5000);
    }
}