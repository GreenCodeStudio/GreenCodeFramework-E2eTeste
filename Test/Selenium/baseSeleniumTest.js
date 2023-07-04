const fs = require("fs");

module.exports = class BaseSeleniumTest {
    constructor(driver) {
        this.driver = driver;
    }

    async takeScreenshot(file = 'default', assert = false) {
        let image = await this.driver.takeScreenshot()
        let name;
        if (assert)
            name = './screens/' + file + '.png';
        else
            name = './screens/additional/' + file + '-' + (new Date() * 1) + '.png';
        fs.writeFile(name, image, 'base64', (err) => {
            this.log(err);
        });
        this.log('Saving screnshot', name);
    }

    log(...args) {
        console.log(new Date(), ...args);
    }

    asleep(x) {
        return new Promise(resolve => setTimeout(resolve, x))
    }

    assert(val) {
        if (!val) {
            process.exit(1);
        }
    }

    async openURL(url) {
        await this.driver.get('http://localhost:8080' + url);
    }
}