const sharp = require("sharp");
const fs = require("fs").promises;
const fsClassic = require("fs");

module.exports = {
    async generateHtml() {
        console.log('generatingHtml')
        let html = '<h1>Screnshot comparsion</h1>';
        diffNoticed = false;
        let list = await this.listComparsion();
        list.sort((a, b) => a.entropy - b.entropy);
        for (const listComparsionElement of list) {
            console.log('aaaaaaaaa', diffNoticed, listComparsionElement.diffNoticed)
            html += `<div><h2>${listComparsionElement.name}</h2><img src="${listComparsionElement.diff}"><img src="${listComparsionElement.approved}"><img src="${listComparsionElement.current}"></div>`
            diffNoticed = diffNoticed || listComparsionElement.diffNoticed;
        }
        await fs.writeFile('./tmp/screens/screnshotComparsion.html', html);
        console.log('written ./tmp/screens/screnshotComparsion.html')
        return diffNoticed;
    }, async listComparsion() {
        let names = [...await fs.readdir('./tmp/screens'), ...await fs.readdir('./tests/ApprovedScrenshots')];
        names = names.filter(x => x.endsWith('.png'));
        names = [...new Set(names)];
        return await Promise.all(names.map(async name => {
            let approved = null;
            if (fsClassic.existsSync('./tests/ApprovedScrenshots/' + name)) approved = 'data:image/png;base64,' + await fs.readFile('./tests/ApprovedScrenshots/' + name, {encoding: 'base64'});
            let current = null;
            if (fsClassic.existsSync('./tmp/screens/' + name)) current = 'data:image/png;base64,' + await fs.readFile('./tmp/screens/' + name, {encoding: 'base64'});
            let diff = null;
            let diffNoticed = false;
            let entropy = 0;
            if (approved && current) {
                let diffImg = await sharp('./tests/ApprovedScrenshots/' + name)
                    .composite([{
                        input: './tmp/screens/' + name, top: 0, left: 0, blend: 'difference'
                    },]).toBuffer();
                let stats = await sharp(diffImg).stats();
                diffNoticed = stats.channels[0].max > 50 || stats.channels[1].max > 50 || stats.channels[2].max > 50
                console.log('Max value', Math.max(stats.channels[0].max, stats.channels[1].max, stats.channels[2].max));
                entropy = stats.entropy
                try {
                    console.log(await sharp(diffImg).stats())
                } catch (ex) {
                    console.error(ex)
                }
                diff = `data:image/png;base64,${diffImg.toString('base64')}`
            } else {
                entropy = 10000;
            }
            return {approved, current, diff, diffNoticed, entropy, name};
        }));
    }
}
