const fs = require("fs");
module.exports= {
    E2eTestLog: {
        file:fs.openSync('./tmp/testLog.html', 'w'),
        init(){
            const fileStart=fs.readFileSync('./modules/E2eTests/Test/Selenium/testLogStart.html');
            fs.writeFile(this.file, fileStart, '', (err) => {
                console.error(err);
            });
        },
        header(text, level=2){
            fs.writeFile(this.file, `<h${level}>${text}</h${level}>`, '', (err) => {
                console.error(err);
            });
        },
        paragraph(text){
            fs.writeFile(this.file, `<p>${text}</p>`, '', (err) => {
                console.error(err);
            });
        },
        screnshot(image, name){
            fs.writeFile(this.file, `<img src="data:image/png;base64,${image}" title="${name}">`, '', (err) => {
                console.error(err);
            });
        },
        exception(ex){
            fs.writeFile(this.file, `<pre style="background: #faa">${ex}\r\n\r\n${ex.stack}</pre>`, '', (err) => {
                console.error(err);
            });
        }
    }
}
module.exports.E2eTestLog.init()
