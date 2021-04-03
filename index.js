const puppeteer = require('puppeteer')
const request = require('request')

const NUM_MONTHS = 4
const SCRAPE_FREQUENCY_SEC = 60     // Check every n sec. Too frequent scraping would blacklist your IP address by the server (it's a typical DDoS protection scheme). 
const AJAX_TIMEOUT_MS = 250         // Increase only if you get an erroneous message due to slow connection.

const notify = async (msg) => {
    // Example: google chat notification using incoming webhook
    // See https://developers.google.com/hangouts/chat/how-tos/webhooks

    return request.post(
        'https://chat.googleapis.com/v1/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        {json: {text: msg}},
        (error, response, body) => {
            if (!error && response.statusCode == 200) {
                console.log("Notification sent to webhook")
                return true
            } else {
                console.log(error)
                return false
            }
        }
    )
}

const check_availability = () => {
    let not_available_msg = document.getElementById("no-times-available-message")
    if (not_available_msg)
        return {"avail": false, "msg": not_available_msg.textContent}
    else
        return {"avail": true, "msg": "*No-times-available-message is not found.*"}
}

const click_on_more_dates = async (page) => {
    return Promise.all([
        page.waitForSelector('a.calendar-next'),
        page.waitForTimeout(AJAX_TIMEOUT_MS),
        page.click('a.calendar-next')
    ]) 
}

const scrape = async (page, url) => {
    await page.goto(url)
    await page.waitForSelector('a.calendar-next')
    let results = []
    for (let i = 0; i < NUM_MONTHS; i++) {
        await page.evaluate(check_availability).then((result) => results.push(result))
        await click_on_more_dates(page)
    }
    return results;

}

const sleep = async (sec) => new Promise((resolve) => setTimeout(resolve, sec*1000));

!(async() => {
  try {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    const url = 'https://wchdappointmentmaker.as.me/schedule.php?calendarID=5287527#'
    let notification_sent = false

    while (true) {
        try {
            console.log(`\u001b[34m[${new Date()}]\u001b[0m Checking updates...`)
            const results = await scrape(page, url)
            results.forEach((result) => console.log(`\u001b[34m[${new Date()}]\u001b[0m ${result.msg}`))

            if (results.some((result) => result.avail) && !notification_sent) {
                notification_sent = await notify(results.map((r) => r.msg).join('\n') + `\nCheck ${url}`)
            } else {
                notification_sent = false
            }
        } catch (e) {
            console.log(`\u001b[34m[${new Date()}]\u001b[0m Error: ${e}`)
        }

        await sleep(SCRAPE_FREQUENCY_SEC)
    }

    browser.close()
  } catch(e) {
    console.error(e)
  }
})()