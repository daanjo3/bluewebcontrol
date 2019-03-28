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
        this.bluedata = new BlueDeviceData(this.blue);
    }

    // ----------------- Callable methods -------------------- //

    list(response) {
        this.blue.once(this.bluedata.DataUpdateEvent, (data) => { response.send(data) });
    }

    info(target, response) {
        // Declare result listener
        response.send(this.bluedata.get(target));
    }

    connect(target, response) {        
        // TODO Check current state(?)

        // Declare result listener
        this.setFieldUpdateListener(target, 'connected', response);
        this.blue.connect(target);
    }

    disconnect(target, response) {
        // TODO Check current state(?)
        
        // Declare result listener
        this.setFieldUpdateListener(target, 'connected', response);
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
    // TODO update listener to allow waiting for specific data changes [connected false -> true]
    setFieldUpdateListener(target, field, response) {
        console.log('setFieldUpdateListener');
        const watchEntry = this.bluedata.watch(target, field);

        function watchUpdate(response, watchEntry, watchEvent, updateData) {
            response.send(updateData);
        }
        this.bluedata.once(this.bluedata.ConnectionUpdateEvent, (watchEvent, updateData) => watchUpdate(response, watchEntry, watchEvent, updateData, this));
    }
}

// -------------------------------------------------------------------- //
const EventEmitter = require('events')

class BlueDeviceData extends EventEmitter {
    // TODO Watcher list losts it's purpose due to it not being used in FieldUpdateListener
    // Figure out how to send events to listeners upon specific device updates.

    constructor(blue) {
        super();
        this.ConnectionUpdateEvent = 'fieldupdate';
        this.DataUpdateEvent = 'dataupdate';
        this.watcher = [];

        blue.on(blue.bluetoothEvents.Device, (data) => { 
            var watcherNew = [];
            for (let watch of this.watcher) {
                let newval = this.getDeviceFieldData(data, watch['device'], watch['field']);

                if (watch['value'] && newval && (watch['value'] != newval)) {
                    this.emit(this.ConnectionUpdateEvent, watch, this.getDeviceData(data, watch['device']));
                } else {
                    watcherNew.push(watch);
                }

            }
            this.watcher = watcherNew;
            this._data = data
            this.emit(this.DataUpdateEvent, this._data);
        });
    }

    // ---------------------------------------------------------------- //

    all() {
        return this._data;
    }

    get(target) {
        // TODO wait for new update if the last one is too old
        var device = this.getDeviceData(this._data, target);
        if (!device) {
            throw 'Device not found';
        }
        return device;
    }

    value(target, field) {
        return this.getDeviceFieldData(this._data, target, field);
    }

    watch(target, field) {
        var entry = {
            'device': target,
            'field': field,
            'value': this.value(target, field)
        };
        this.watcher.push(entry);
        console.log('New watcher entry pushed');
        return entry;
    }

    // ---------------------------------------------------------------- //

    getDeviceFieldData(data, target, field) {
        var device = this.getDeviceData(data, target);
        if (device[field] == '') {
            return 'no'
        }
        return device[field];
    }

    getDeviceData(data, target) {
        return data.filter(function(el) { return el.mac == target })[0];
    }
}

// -------------------------------------------------------------------- //

// Returns the data which is relevant to the target
function getTarget(devices, target) {
    if (!devices) {
        console.warn('No devices found');
        return null;
    }
    return devices.filter(function(el) { return el.mac == target });
}

module.exports = {
    BlueWebControl
}