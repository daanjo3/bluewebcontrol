# Bluetooth Web API
This tools hosts a web API that is used to control bluetooth devices.
It requires bluetoothctl to be installed and used.

## Usage
Install NPM dependencies (express & bluetoothctl)

```
cd bluewebcontrol
npm install
```

Create a config.json file that contains a target element and a port
```json
{
    "target": "<bluetooth mac address>"
    "port": "3000"
}
```

Start the Express server

```
node app.js
```

##Features as of now

### GET /info
Returns the latest information on the target bluetooth device

### GET /scan/[true|false]
Turns scanning on or off

### GET /connect
Connects to the target and turns scanning off to avoid interference

### GET /disconnect
Disconnect the target

