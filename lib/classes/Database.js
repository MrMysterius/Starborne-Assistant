const fs = require('fs');
const path = require('path');
const betterSqlite3 = require('better-sqlite3');

module.exports = class Database {
    constructor (name) {
        let dirPath = path.join(process.cwd(), 'database', name+'.db');
        let logPath = path.join(process.cwd(), 'logs', name+'-log.txt');
        let writeStream = (data) => {fs.appendFile(logPath, `[${new Date()}] ${data}\n`, 'utf-8', (err) => {});}
        this.database = new betterSqlite3(dirPath, {verbose: writeStream});

        this.database.prepare('CREATE TABLE IF NOT EXISTS servers ([server_id] VARCHAR(50) PRIMARY KEY NOT NULL, [custom_prefix] VARCHAR(5) DEFAULT NULL, [consent] INTEGER NOT NULL DEFAULT 0, [owner_id] VARCHAR(50))').run();
        this.database.prepare('CREATE TABLE IF NOT EXISTS channels ([channel_id] VARCHAR(50) PRIMARY KEY NOT NULL, [server_id] VARCHAR(50) NOT NULL, [starborne_server] INTEGER DEFAULT NULL, [isAutoChannelEnabled] INTEGER NOT NULL DEFAULT 0, [autoChannelCategoryId] VARCHAR(50) DEFAULT NULL, [autoChannelTimeout] INTEGER DEFAULT 2880)').run();
        this.database.prepare('CREATE TABLE IF NOT EXISTS auto_channels ([channel_id] VARCHAR(50) PRIMARY KEY NOT NULL, [server_id] VARCHAR(50) NOT NULL, [lastMessageOn] INTEGER NOT NULL, [hex] VARCHAR(10) NOT NULL, [starborne_server] INTEGER DEFAULT NULL, [timeout] INTEGER NOT NULL)').run();
        this.database.prepare('CREATE TABLE IF NOT EXISTS messages ([id] INTEGER NOT NULL, [message_id] VARCHAR(50) NOT NULL, [server_id] VARCHAR(50) NOT NULL ,[user_id] VARCHAR(50) NOT NULL, [station] TEXT, [spy_report] TEXT, [timestamp] INTEGER NOT NULL, PRIMARY KEY(id AUTOINCREMENT))').run();
    }
}