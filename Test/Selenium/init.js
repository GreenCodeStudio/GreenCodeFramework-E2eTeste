const {Builder, By, Key, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const util = require('util');
const fs = require('fs');
const net = require('net');
const Xvfb = require("xvfb");
const path = require("path");
const ScreenshotComparator = require("./ScreenshotComparator");
asleep(60000).then(() => process.exit(1));

function asleep(x) {
    return new Promise(resolve => setTimeout(resolve, x))
}

async function takeScreenshot(driver, file) {
    let image = await driver.takeScreenshot()
    fs.writeFile('./screens/' + file + '-' + (new Date() * 1) + '.png', image, 'base64', function (err) {
        log(err);
    });
}

function log(...args) {
    console.log(new Date(), ...args);
}

function readDir(path) {
    return new Promise((resolve, reject) => {
        fs.readdir("./modules/", async (err, files) => {
            if (err) {
                reject(err);
            } else {
                resolve(files);
            }
        });
    })
}

(async function run() {
    try {
        var Xvfb = require('xvfb');
        var xvfb = new Xvfb();
        xvfb.startSync();

        let driver = await new Builder().forBrowser('firefox').build();

        const files = await readDir("./modules/");
        let tests = [];
        for (const file of files) {
            const testPath = path.resolve(process.cwd(), `./modules/${file}/Test/Selenium/index.js`);
            log(testPath);
            if (fs.existsSync(testPath)) {
                const obj = require(testPath);
                log('obj:', obj);
                obj.name=file;
                tests.push(obj)
            }
        }
        log('tests:', tests);
        const testObjects = tests.map(x => new x(driver));
        for (const test of testObjects) {
            if (test.prepareTest) {
                log('prepareTest:', test);
                await test.prepareTest();
            }
        }
        let testsSummary=[];
        for (const test of testObjects) {
            try {
                if (test.mainTest) {
                    log('mainTest:', test);
                    await test.mainTest();
                    await new Promise(resolve => setTimeout(resolve, 100))
                    testsSummary.push({name:test.constructor.name, success:true})
                }
            }catch(ex){
                console.error(ex)
                testsSummary.push({name:test.constructor.name, success:false})
            }
        }
        log('tests completed');
        log(testsSummary)
        if(testsSummary.find(x=>x.success===false)){
            process.exit(3)
        }
        if(await ScreenshotComparator.generateHtml()){
            console.log('found significant change on screnshots')
            process.exit(2)
        }
        driver.quit();
        xvfb.stopSync();
        process.exit(0)//tmp
    } catch (e) {
        log('exception:', e);
        process.exit(1)
    }
})();
