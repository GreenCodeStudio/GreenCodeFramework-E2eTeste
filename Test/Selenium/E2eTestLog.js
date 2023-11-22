const fs = require("fs");
module.exports= {
    E2eTestLog: {
        file:fs.openSync('./tmp/testLog.html', 'w'),
        init(){
            const fileStart='<!DOCTYPE html><html><head><meta charset="utf-8"><title>Test log</title></head><body>';
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
        screnshot(image){
            fs.writeFile(this.file, `<img src="data:image/png;base64,${image}">`, '', (err) => {
                console.error(err);
            });
        }
    }
}
