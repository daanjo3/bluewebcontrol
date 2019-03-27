/* Blue Web Control
 * Class definition that translates all bluetoothctl functions into
 * functions useful for the API.
 * 
 * Features:
 * list              - receive information on all available devices
 * info              - receive info from a specific device
 * connect           - connect to the specified device, otherwise to targeted devices
 * disconnect        - disconnect from the targeted device
 * scanning          - enable or disable scanning
*/

class BlueWebControl {

    constructor(bluetooth) {
        this.blue = bluetooth || require('bluetoothctl');
        this.blue.Bluetooth();
    }

    // ----------------- Callable methods -------------------- //

    list(response) {
        this.blue.once(this.blue.bluetoothEvents.Device, (devices) => { response.send(devices) });
    }

    info(target, response) {
        // Declare result listener
        this.setReponseStateListener(target, response);
        this.blue.info(target);
    }

    connect(target, response) {        
        // TODO Check current state(?)

        // Declare result listener
        this.setReponseStateListener(target, response);
        this.blue.connect(target);
    }

    disconnect(target, response) {
        // TODO Check current state(?)
        
        // Declare result listener
        this.setReponseStateListener(target, response);
        this.blue.disconnect(target);
    }

    scanning(scanning, response) {
        if (scanning) {
            this.blue.scan(scanning);
        }
        // TODO Ensure this.blue.isScanning is updated before returning
        console.log(`scanning: ${this.blue.isScanning}`)
        response.send(this.blue.isScanning);
    }

    // ---------------------------------------------------------------------- //

    // Set a listener to be fired once when the data updates
    setResponseStateListener(target, response) {
        this.blue.once(this.blue.bluetoothEvents.Device, (devices) => {
            var state = getTargetState(devices, target);
            response.send(state);
        });
    }
}

// Returns the data which is relevant to the target
function getTargetState(devices, target) {
    if (!devices) {
        console.warn('No devices found');
        return null;
    }
    return devices.filter(function(el) { return el.mac == target });
}

module.exports = {
    BlueWebControl
}