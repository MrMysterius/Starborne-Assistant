const https = require('https');
const path = require('path');
const fs = require('fs');

module.exports = {
    name: 'downloadReport',
    run: async ({url}) => {
        return new Promise((resolve) => {
            try {
                let rdm = Math.floor(Math.random() * 100000);
                let filePath = path.join(process.cwd(), `temp/${rdm}.txt`);
                let file = fs.createWriteStream(filePath, 'utf-8');
                let req = https.get(url, (res) => {
                    res.pipe(file);
                    file.on('finish', () => {
                        file.close();
                        let read = fs.readFileSync(filePath.toString(), 'utf-8');
                        fs.unlink(filePath, ()=>{});
                        let regex = new RegExp('\\r', 'g');
                        read = read.replace(regex, '');
                        resolve(read);
                    })
                })
            }
            catch (err) {
                console.log(err);
                resolve(0);
            }
        })
    }
}