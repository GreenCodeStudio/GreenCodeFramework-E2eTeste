const {Builder, logging} = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');
const ScreenshotComparator = require('./ScreenshotComparator');
const firefox = require("selenium-webdriver/firefox");
const {E2eTestLog} = require("./E2eTestLog");
const options = new firefox.Options();

if (process.platform === "win32") {
    options.setBinary("C:\\Program Files\\Mozilla Firefox\\firefox.exe");
}

function asleep(x) {
    return new Promise(resolve => setTimeout(resolve, x));
}

async function takeScreenshot(driver, file) {
    let image = await driver.takeScreenshot();
    fs.writeFile(`./screens/${file}-${Date.now()}.png`, image, 'base64', function (err) {
        if (err) {
            console.error(err);
        }
    });
}

function log(...args) {
    console.log(new Date(), ...args);
}

function readDir(dirPath) {
    return new Promise((resolve, reject) => {
        fs.readdir(dirPath, (err, files) => {
            if (err) {
                reject(err);
            } else {
                resolve(files);
            }
        });
    });
}

(async function run() {
    try {
        let driver;
        let xserver;
        if (process.platform !== "win32") {
            try {
                const xvfb = require('xvfb');
                xserver = new xvfb();
                xserver.startSync();
            } catch (ex) {
                console.warn(ex);
            }
        }

        driver = await new Builder()
            .forBrowser('firefox')
            .setFirefoxOptions(options)
            .setLoggingPrefs({browser: 'ALL'})
            .build();

        const files = await readDir('./modules/');
        let tests = [];
        for (const file of files) {
            const testPath = path.resolve(process.cwd(), `./modules/${file}/Test/Selenium/index.js`);
            log(testPath);
            if (fs.existsSync(testPath)) {
                const obj = require(testPath);
                log('obj:', obj);
                if (obj instanceof Array) {
                    obj.forEach(x => x.moduleName = file)
                    tests.push(...obj);
                }
                else {
                    obj.moduleName = file;
                    tests.push(obj);
                }
            }
        }
        log('tests:', tests);
        const testObjects = tests.map(x => new x(driver));
        for (const test of testObjects) {
            if (test.prepareTest) {
                log('prepareTest:', test);
                E2eTestLog.header(test.constructor.moduleName);
                await test.prepareTest();
            }
        }
        let testsSummary = [];
        for (const test of testObjects) {
            try {
                if (test.mainTest) {
                    E2eTestLog.header(test.constructor.moduleName);
                    log('mainTest:', test);
                    await test.mainTest();
                    await asleep(100);
                    testsSummary.push({name: test.constructor.moduleName, success: true});
                }
            } catch (ex) {
                console.error(ex);
                testsSummary.push({name: test.constructor.moduleName, success: false});
            } finally {
                try {
                    const entries = await driver.manage().logs().get(logging.Type.BROWSER);
                    entries.forEach(function (entry) {
                        console.log('[%s] %s', entry.level.name, entry.message);
                        console.log(entry);
                    });
                } catch (ex) {
                    console.warn(ex);
                }
            }
        }
        log('tests completed');
        log(testsSummary);
        E2eTestLog.header('Tests summary');
        for (const test of testsSummary) {
            E2eTestLog.paragraph(`Test ${test.name} ${test.success ? 'success' : 'failed'}`);
        }
        if (testsSummary.find(x => x.success === false)) {
            process.exit(3);
        }
        if (await ScreenshotComparator.generateHtml()) {
            console.log('found significant change on screenshots');
            process.exit(2);
        } else {
            console.log('no significant change on screenshots');
        }
        await driver.quit();
        if (process.platform !== "win32") {
            xserver.stopSync();
        }
        process.exit(0);
    } catch (e) {
        log('exception:', e);
        process.exit(1);
    }
})();
