Washtenaw County Health Department 
Vaccine Appointment Availability Checker
=========================================

This script periodically crawls WCHD's COVID-19 vaccine appointment calender and notifies user if "No times are available" message is removed. The website uses AJAX to display different dates in the calender element, and we support it by browsing it on a headless Chrome. 

## Dependency
* node.js
* npm

## Install
1. Download or git clone this repository.
2. `cd` to the directory.
3. `npm install` to install dependent packages.
4. Setup your notification method (see below).
5. `npm start` or `node index.js` to start the program.

## Setup notification
### Via Webhook
1. index.js has an example config using Google's API
2. Setup incoming webhook and obtain your URI (See [this page](https://developers.google.com/hangouts/chat/how-tos/webhooks) for Google chat API)
3. Set URI in index.js
4. If you use a service other than Google, you may need to modify JSON payload.

### Via Email
1. Setup SMTP server. In this example, we assume a Linux host with `mail` command.
2. Following is an example code snippet for email notification.
```javascript
    const { exec } = require('child_process') // Add this to the headers
    //...
    const notify = async (msg) => {
        return exec(`echo '${msg}' | mail -s "Title" email@address.com`)
    }
```