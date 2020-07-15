const path = require('path');

let data = require(path.join(process.cwd(), 'assets/data/cards.json'));

module.exports = {
    name: 'spyGetCardStats',
    run: async ({name}) => {
        return new Promise((resolve) => {
            if (name == null || name == undefined) return -1;

            var id = -1;
            for (var k=0; k<data.length; k++) {
                if (data[k].name === name) {
                    id = k;
                }
            }
        
            if (id === -1) {
                resolve(-1);
            } else {
                resolve(data[id]);
            }
        })
    }
}