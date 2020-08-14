const PATH = require('path');
const FS = require('fs');
const { resolve } = require('path');

const runNow = (commandToRunObject, data) => {
    try {
        let result = commandToRunObject.run(data);
        if (result != undefined) {
            return result;
        }
        return 1;
    }
    catch (err) {
        console.log(err);
        return 0;
    }
}

const checkFiles = (files, functionDirPath) => {
    let list = [];
    files.forEach((file) => {
        let filePath = PATH.join(functionDirPath, file);
        let stats = FS.lstatSync(filePath);
        if ((stats.isDirectory() && file != 'config' || stats.isFile() && file.endsWith('.js')) && !file.startsWith('--')) {
            list.push({path: filePath});
            console.log(`\t\t\t- ${file}`);
        }
    })
    return list;
}

const getPath = ({path, type}) => {
    switch (type) {
        case 'absolute':
            return PATH.normalize(path);
            break;
        case 'relative':
            return PATH.join(process.cwd(), path);
            break;
    }
    return undefined;
}

module.exports = class CommandsHandler {
    constructor (config) {        
        this.function = [];

        console.log(`[FUNCTIONS|LOADING]\tBeginning...`);
        for (var i=0;i<config.length;i++) {
            let functionDirPath = getPath(config[i]);
            if (functionDirPath != undefined) {
                console.log(`[FUNCTIONS|LOADING]\tReading directory ${functionDirPath}...`);
                try {
                    console.log(`[FUNCTIONS|LOADING]\tRequiring files/directorys in ${functionDirPath}...`);
                    checkFiles(FS.readdirSync(functionDirPath), functionDirPath).forEach(({path}) => {
                        try {
                            let temp = require(path);
                            if (temp.name == undefined) throw new Error("This is not viable command file");
                            this.function.push(temp);
                            console.log(`\t\t\t+ ${temp.name} - ${path}`);
                        }
                        catch (err) {
                            console.log(`[FUNCTIONS|ERROR]\tCouldn't require ${path}\n\n${err}\n`);
                        }
                    });
                }
                catch (err) {
                    console.log(`[FUNCTIONS|ERROR]\tReading directory ${functionDirPath}\n\n${err}\n`);
                }
            }
        }
        console.log(`[FUNCTIONS|LOADED]\tCompleted!`);
    }

    run (functionToRun, data) {
        return new Promise((resolve) => {
            for(let entryID=0;entryID<this.function.length;entryID++) {
                if (this.function[entryID].name == functionToRun) resolve(runNow(this.function[entryID], data));
            }
            resolve(0);
        })
    }
}