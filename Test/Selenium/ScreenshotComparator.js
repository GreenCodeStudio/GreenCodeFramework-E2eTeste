const sharp = require("sharp");
const fs = require("fs");

module.exports = {
    async generateHtml() {
        console.log('generatingHtml')
        let html = '<h1>Screnshot comparsion</h1>';
        for (const listComparsionElement of await this.listComparsion()) {
            html += `<div><img src="${listComparsionElement.diff}"><img src="${listComparsionElement.approved}"><img src="${listComparsionElement.current}"></div>`
        }
       await  fs.writeFile('./screens/screnshotComparsion.html', html);
        console.log('written ./screens/screnshotComparsion.html')
    }, async listComparsion() {
        let names = [...await fs.readdir('./screens'), ...await fs.readdir('./ApprovedScrenshots')];
        names = names.filter(x => x.endsWith('.png'));
        names = [...new Set(names)];
        console.log({names})
        return await Promise.all(names.map(async name => {
            let approved = null;
            if (await fs.exists('./ApprovedScrenshots/' + name)) approved = 'data:image/png;base64,' + await fs.readFile('./ApprovedScrenshots/' + name, {encoding: 'base64'});
            let current = null;
            if (await fs.exists('./screens/' + name)) current = 'data:image/png;base64,' + await fs.readFile('./screens/' + name, {encoding: 'base64'});
            let diff = null;
            if (approved && current) {
                let diffImg = sharp('./ApprovedScrenshots/' + name)
                    .composite([{
                        input: './screens/' + name, top: 0, left: 0, blend: 'difference'
                    },])
                diff = `data:image/png;base64,${diffImg.toString('base64')}`
            }
            return {approved, current, diff};
        }));
    }
}