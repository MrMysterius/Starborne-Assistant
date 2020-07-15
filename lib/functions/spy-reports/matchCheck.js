const { resolve } = require("path")

module.exports = {
    name: 'spyMatchCheck',
    run: async ({match}) => {
        return new Promise((resolve) => {
            if (match != null && match[0] != undefined) resolve(1);
            resolve(0);
        })
    }
}