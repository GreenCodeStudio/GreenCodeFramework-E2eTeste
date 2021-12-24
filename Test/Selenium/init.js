const {Builder, By, Key, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const util = require('util');
const fs = require('fs');
const net = require('net');
const Xvfb = require("xvfb");
const path = require("path");
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
    for (const test of testObjects) {
        if (test.mainTest) {
            log('mainTest:', test);
            await test.mainTest();
            await this.asleep(100);
        }
    }
    log('tests completed');

    driver.quit();
    xvfb.stopSync();
})();
