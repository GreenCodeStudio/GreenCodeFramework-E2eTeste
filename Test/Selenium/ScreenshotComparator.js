const sharp = require("sharp");
const fs = require("fs").promises;
const fsClassic=require("fs");

module.exports = {
    async generateHtml() {
        console.log('generatingHtml')
        let html = '<h1>Screnshot comparsion</h1>';
        diffNoticed=false;
        let list=await this.listComparsion();
        list.sort((a,b)=>a.entropy-b.entropy);
        for (const listComparsionElement of list) {
            html += `<div><img src="${listComparsionElement.diff}"><img src="${listComparsionElement.approved}"><img src="${listComparsionElement.current}"></div>`
            diffNoticed=diffNoticed||listComparsionElement.diffNoticed;
        }
       await  fs.writeFile('./screens/screnshotComparsion.html', html);
        console.log('written ./screens/screnshotComparsion.html')
        return diffNoticed;
    }, async listComparsion() {
        console.log('a',fs.readdir);
        let names = [...await fs.readdir('./screens'), ...await fs.readdir('./ApprovedScrenshots')];
        names = names.filter(x => x.endsWith('.png'));
        names = [...new Set(names)];
        console.log({names})
        return await Promise.all(names.map(async name => {
            let approved = null;
            if (fsClassic.existsSync('./ApprovedScrenshots/' + name)) approved = 'data:image/png;base64,' + await fs.readFile('./ApprovedScrenshots/' + name, {encoding: 'base64'});
            let current = null;
            if (fsClassic.existsSync('./screens/' + name)) current = 'data:image/png;base64,' + await fs.readFile('./screens/' + name, {encoding: 'base64'});
            let diff = null;
            let diffnoticed=false;
            let entropy=0;
            if (approved && current) {
                let diffImg = await sharp('./ApprovedScrenshots/' + name)
                    .composite([{
                        input: './screens/' + name, top: 0, left: 0, blend: 'difference'
                    },]).toBuffer();
                let stats=await sharp(diffImg)                        .stats();
                entropy=stats.entropy
                try {
                    console.log([...diffImg].slice(0, 100))
                    console.log(await sharp(diffImg)                        .stats())
                }catch(ex){console.error(ex)}
                diff = `data:image/png;base64,${diffImg.toString('base64')}`
            }
            return {approved, current, diff, diffNoticed, entropy};
        }));
    }
}