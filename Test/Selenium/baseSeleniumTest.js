const fs = require("fs");
const {until, By} = require("selenium-webdriver");

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
        if (!fs.existsSync('./screens/')){
            fs.mkdirSync('./screens/');
        }
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

    async scrollTo(selector) {
        await this.driver.executeScript(`document.querySelector(arguments[0]).scrollIntoView()`, selector);
    }
    async clickElement(selector) {
        const element = await this.waitForElement(selector);
        await this.driver.executeScript("arguments[0].scrollIntoView();", element);
        await element.click();
    }

    async sendKeysToElement(selector, keys) {
        const element = await this.waitForElement(selector);
        await element.sendKeys(keys);
    }

    async waitForElement(selector) {
        let completed=false
        const realWait=this.driver.wait(until.elementLocated(By.css(selector)));
        const timeout=this.asleep(10000);
        realWait.then(()=>completed=true)
        timeout.then(()=>{
            if(!completed)
                console.error('waiting for element timeout ', selector)
        })
        await Promise.race([realWait,timeout])
        return await this.driver.findElement(By.css(selector));
    }
}
