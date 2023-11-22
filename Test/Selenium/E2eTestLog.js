const fs = require("fs");
module.exports= {
    E2eTestLog: {
        file:fs.openSync('./temp/testLog.html', 'w'),
        header(text, level=2){
            fs.writeFile(this.file, `<h${level}>${text}</h${level}>`, '', (err) => {
                this.log(err);
            });
        },
        paragraph(text){
            fs.writeFile(this.file, `<p>${text}</p>`, '', (err) => {
                this.log(err);
            });
        },
        screnshot(image){
            fs.writeFile(this.file, `<img src="data:image/png;base64,${image}">`, '', (err) => {
                this.log(err);
            });
        }
    }
}
