const sqlite3 = require('better-sqlite3');
const path = require('path');

class database {
    constructor (dir) {
        dir = path.join(process.cwd()+dir);

        //new db object
        this.database = new sqlite3(dir, {verbose: console.log});

        //Making sure tables are set
        //servers
        this.database.prepare('CREATE TABLE IF NOT EXISTS servers ([server_id] VARCHAR(50) PRIMARY KEY NOT NULL, [custom_prefix] VARCHAR(5) DEFAULT NULL, [store_consent] INTEGER NOT NULL DEFAULT 0)').run();
        //channel_settings
        this.database.prepare('CREATE TABLE IF NOT EXISTS channel_settings ([server_id] VARCHAR(50) NOT NULL, [channel_id] VARCHAR(50) NOT NULL, [starborne_server] INTEGER DEFAULT NULL, [auto_category_enabled] INTEGER NOT NULL DEFAULT 0, [category_id] VARCHAR(50) DEFAULT NULL, [deletion_timeout] INTEGER DEFAULT 2880, PRIMARY KEY (channel_id, server_id))').run();
        //auto_channels
        this.database.prepare('CREATE TABLE IF NOT EXISTS auto_channels ([server_id] VARCHAR(50) NOT NULL, [channel_id] VARCHAR(50) NOT NULL, [last_message_timestamp] INTEGER NOT NULL, PRIMARY KEY(server_id, channel_id))').run();
        //messages
        this.database.prepare('CREATE TABLE IF NOT EXISTS messages ([id] INTEGER NOT NULL, [message_id] VARCHAR(50) NOT NULL, [user_id] VARCHAR(50) NOT NULL, [station] TEXT, [spy_report] TEXT, [timestamp] INTEGER NOT NULL, PRIMARY KEY(id AUTOINCREMENT))').run();

        //Statements
        const stmt = {
            servers_insert: this.database.prepare('INSERT INTO servers (server_id) VALUES (@server_id)'),
            servers_update: this.database.prepare('UPDATE servers SET custom_prefix = @custom_prefix, store_consent = @store_consent WHERE server_id = @server_id'),
            servers_delete: this.database.prepare('DELETE FROM servers WHERE server_id = @server_id'),
            channel_settings_insert: this.database.prepare('INSERT INTO channel_settings (server_id, channel_id) VALUES (@server_id, @channel_id)'),
            channel_settings_update: this.database.prepare('UPDATE channel_settings SET starborne_server = @starborne_server, auto_category_enabled = @auto_category_enabled, category_id = @category_id, deletion_timeout = @deletion_timeout WHERE server_id = @server_id AND channel_id = @channel_id'),
            channel_settings_delete: this.database.prepare('DELETE FROM channel_settings WHERE server_id = @server_id AND channel_id = @channel_id'),
            auto_channels_insert: this.database.prepare('INSERT INTO auto_channels (server_id, channel_id, last_message_timestamp) VALUES (@server_id, @channel_id, @last_message_timestamp)'),
            auto_channels_update: this.database.prepare('UPDATE auto_channels SET last_message_timestamp = @last_message_timestamp WHERE server_id = @server_id AND channel_id = @channel_id'),
            auto_channels_delete: this.database.prepare('DELETE FROM auto_channels WHERE server_id = @server_id AND channel_id = @channel_id'),
            messages_insert: this.database.prepare('INSERT INTO messages (message_id, user_id, station, spy_report, timestamp) VALUES (@message_id, @user_id, @station, @spy_report, @timestamp)'),
            messages_delete: this.database.prepare('DELETE FROM messages WHERE id = @id')
        }

        this.queue = [];

        this.queue_interval_id = setInterval(() => {
            if (this.queue.length != 0) {
                switch (this.queue[0].table) {
                    //servers
                    case 'servers':
                        switch (this.queue[0].action) {
                            case 'insert':
                                stmt.servers_insert.run(this.queue[0].data);
                                break;
                            case 'update':
                                stmt.servers_update.run(this.queue[0].data);
                                break;
                            case 'delete':
                                stmt.servers_delete.run(this.queue[0].data);
                        }
                        break;
                    case 'channels_settings':
                        switch (this.queue[0].action) {
                            case 'insert':
                                stmt.channel_settings_insert.run(this.queue[0].data);
                                break;
                            case 'update':
                                stmt.channel_settings_update.run(this.queue[0].data);
                                break;
                            case 'delete':
                                stmt.channel_settings_delete.run(this.queue[0].data);
                                break;
                        }
                        break;
                    case 'auto_channels':
                        switch (this.queue[0].action) {
                            case 'insert':
                                stmt.auto_channels_insert.run(this.queue[0].data);
                                break;
                            case 'update':
                                stmt.auto_channels_update.run(this.queue[0].data);
                                break;
                            case 'delete':
                                stmt.auto_channels_delete.run(this.queue[0].data);
                                break;
                        }
                        break;
                    case 'messages':
                        switch (this.queue[0].action) {
                            case 'insert':
                                stmt.messages_insert.run(this.queue[0].data);
                                break;
                            case 'delete':
                                stmt.messages_delete.run(this.queue[0].data);
                                break;
                        }
                        break;
                }
                this.queue.shift();
            }
        },1);
    }
    /**
     * @param {string} table Name of the Table
     * @param {string} action Action
     * @param {object} data Data to store in the Database
     */
    do(table, action, data) {
        if (table != undefined && action != undefined && data != undefined) {
            this.queue.push({table: table, action: action, data: data});
        } else {
            throw new Error('Missing Parameters on the Add Function of the Database')
        }
    }
    //Getting Rows
    /**
     * @param {string} server_id
     * @returns {promise}
     */
    servers(server_id) {
        return new Promise((resolve) => {
            let row = this.database.prepare('SELECT * FROM servers WHERE server_id = ?').get(server_id);
            if (row != undefined && row.server_id != undefined) {
                resolve(row);
            } else {
                resolve('error');
            }
        });
    }
    /**
     * @param {string} server_id
     * @param {string} channel_id
     * @returns {promise}
     */
    channel_settings(server_id, channel_id) {
        return new Promise((resolve) => {
            let row = this.database.prepare('SELECT * FROM channel_settings WHERE server_id = ? AND channel_id = ?').get(server_id, channel_id);
            if (row != undefined && row.server_id != undefined && channel_id != undefined) {
                resolve(row);
            } else {
                resolve('error');
            }
        });
    }
    /**
     * @param {number} timeout Current timeout
     * @returns {promise}
     */
    auto_channels(timeout) {
        return new Promise((resolve) => {
            let timestamp = new Date().getTime() - (timeout*60);
            let rows = this.database.prepare('SELECT * FROM auto_channels WHERE last_message_timestamp <= ?').all(timestamp);
            if (rows != undefined) {
                resolve(rows);
            } else {
                resolve('error');
            }
        });
    }
    /**
     * @param {string} id
     * @returns {promise}
     */
    messages(id) {
        return new Promise((resolve) => {
            let row = this.database.prepare('SELECT * FROM messages WHERE id = ?').get(id);
            if (row != undefined && row.id != undefined && row.message_id != undefined) {
                resolve(row);
            } else {
                resolve('error');
            }
        });
    }
}

module.exports = database;