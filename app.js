const express = require('express');

const { BlueWebControl } = require('./bt');
const bwc = new BlueWebControl();
// Start the express server
const app = express();

const config = require('./config.json');
// Add configuration input validation. For now assuming config is correct
const target = config.target;
const port = config.port;

/* Retrieve all information on discovered devices */
app.get('/', (req, res) => { bwc.list(res) });

/* Retrieve information on the status of the target device */
app.get('/info', (req, res) => { bwc.info(target, res); });
app.get('/info/:mac', (req, res) => {
    var mac = req.params.mac;
    if (verifyTarget(mac)) {
        bwc.info(mac, res);
    } else {
        console.warn('Received invalid target');
        res.send(null);
    }
})

/* Connects to the bluetooth target. This function automatically turns off scanning
 * as this could interfere with the connection. Responds with updated info.
*/
app.get('/connect', (req, res) => { bwc.connect(target, res) });
app.get('/connect/:mac', (req, res) => {
    var mac = req.params.mac;
    if (verifyTarget(mac)) {
        bwc.connect(mac, res);
    } else {
        console.warn('Received invalid target');
        res.send(null);
    }
});

/* Disconnect the controller from the target bluetooth device. Responds with updated info. */
app.get('/disconnect', (req, res) => { bwc.disconnect(target, res) });
app.get('/disconnect/:mac', (req, res) => {
    var mac = req.params.mac;
    if (verifyTarget(mac)) {
        bwc.disconnect(mac, res);
    } else {
        console.warn('Received invalid target');
        res.send(null);
    }
})

/* Set whether the controller is scanning for devices */
app.get('/scan', (req, res) => { bwc.scanning(null, res); })
app.get('/scan/:setScan', (req, res) => {
    var scanning = verifyBool(req.params.setScan);
    if (scanning) {
        bwc.scanning(scanning, res);
    } else {
        console.warn('Received invalid parameter');
        res.send(null);
    }
});

app.listen(port, () => console.log(`Bluewebcontrol is listening on ${port}!`))

// --------------- Input validation --------------------------- //

// Verifies a boolean and returns it, or null otherwise
function verifyBool(bool) {
    if (bool == null) { return null; }
    if (bool == 'true' || bool == 'false') {
        return bool == 'true' ? true : false;
    }
    return null;
}

// Verifies whether the provided target is a valid MAC address
function verifyTarget(target) {
    const re = new RegExp('^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$');
    if (!target) {
        return false;
    }
    return re.test(target);
}