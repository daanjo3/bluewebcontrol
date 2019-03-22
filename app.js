const express = require('express');
var blue = require('bluetoothctl');

const blueconfig = require('./config.json');

// Start the express server
const app = express();
const port = blueconfig.port;

// Initialise the bluetoothctl wrapper
blue.Bluetooth();

const bluetarget = blueconfig.target;

// Bluetooth target device data
var boomdata = null;

/* Retrieve all information on discovered devices */
app.get('/', (req, res) => {
    console.log('GET /');
    var btc = blue.devices;
    res.send(btc);
});

/* Retrieve information on the status of the target device */
app.get('/info', async (req, res) => {
    boomdata = null;
    blue.info(bluetarget);
    boomdata = await ensureBoomdata();
    res.send(boomdata);
});

/* Set whether the controller is scanning for devices */
app.get('/scan/:setScan', (req, res) => {
    console.log(req.params.setScan);
    if (req.params.setScan == 'true' || req.params.setScan == 'false') {
        var setScan = req.params.setScan == 'true' ? true : false;
        console.log(`bluetooth scanning set to ${setScan}`);
        blue.scan(setScan);
        res.send(`bluetooth scanning set to ${setScan}`);
    } else {
        res.send('invalid parameter provided');
    }
});

/* Connects to the bluetooth target. This function automatically turns off scanning
 * as this could interfere with the connection. Responds with updated info.
*/

// TODO: wait for bluetooth to actually disconnect before displaying boomdata update
app.get('/connect', async (req, res) => {
    blue.connect(bluetarget);
    blue.scan(false);
    boomdata = null;
    blue.info(bluetarget);
    boomdata = await ensureBoomdata();
    res.send(boomdata);
});

/* Disconnect the controller from the target bluetooth device. Responds with updated info. */

// TODO: wait for bluetooth to actually disconnect before displaying boomdata update
app.get('/disconnect', async (req, res) => {
    blue.disconnect(bluetarget);
    boomdata = null;
    blue.info(bluetarget);
    boomdata = await ensureBoomdata();
    res.send(boomdata);
});

/* Ensures that new data is retrieved before returning. */

// TODO: add functionality to wait for specific parameters to be set to specific values
function ensureBoomdata() {
    return new Promise(function (resolve, reject) {
        (function waitForBoomdata() {
            if (boomdata) {
                return resolve(boomdata);
            }
            setTimeout(waitForBoomdata, 30);
        })();
    });
}

/* Event listener that updates that bluetooth device information */
blue.on(blue.bluetoothEvents.Device, function (devices) {
    var obj = devices.filter(function(el) { return el.mac == bluetarget });
    boomdata = obj.length > 0 ? obj[0] : null;
    console.log('boomdata updated');
});

app.listen(port, () => console.log(`Bluewebcontrol is listening on ${port}!`))