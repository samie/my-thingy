/* API for connecting a Nordic Thingy:52 device using web bluetooth.

  This is code is adapted from code by Lars Knudsen (@larsgk)
  https://github.com/larsgk/web-iot-lab/blob/main/thingy52-driver.js
  and code by Gergana Young (@geryb-bg)
  https://github.com/geryb-bg/lightsaber/blob/master/nordic-thingy-poc/index.js

*/

const SERVICE = {
     BATTERY: '0000180f-0000-1000-8000-00805f9b34fb',
     THINGY52: 'ef680100-9b35-4933-9b10-52ffa9740042',
     ENVIRONMENT: 'ef680200-9b35-4933-9b10-52ffa9740042',
     UI: 'ef680300-9b35-4933-9b10-52ffa9740042',
     MOTION: 'ef680400-9b35-4933-9b10-52ffa9740042',
     SOUND: 'ef680500-9b35-4933-9b10-52ffa9740042',
     DFU: '0000FE59-0000-1000-8000-00805f9b34fb'
};
const CHARACTERISTICS = {
    // Thingy52
     NAME: 'ef680101-9b35-4933-9b10-52ffa9740042',
     ADVERTISING: 'ef680102-9b35-4933-9b10-52ffa9740042',
     CONNECTION: 'ef680104-9b35-4933-9b10-52ffa9740042',
     EDDYSTONE_URL: 'ef680105-9b35-4933-9b10-52ffa9740042',
     CLOUD_TOKEN: 'ef680106-9b35-4933-9b10-52ffa9740042',
     FW_VERSION: 'ef680107-9b35-4933-9b10-52ffa9740042',
     MTU: 'ef680108-9b35-4933-9b10-52ffa9740042',

     // Battery
     BATTERY_LEVEL: '00002a19-0000-1000-8000-00805f9b34fb',
     BATTERY_STATE: '00002A1B',
     POWER_STATE: '00002A1A',

     // Environment characteristics
     TEMPERATURE: 'ef680201-9b35-4933-9b10-52ffa9740042',
     AIR_PRESSURE: 'ef680202-9b35-4933-9b10-52ffa9740042',
     HUMIDITY: 'ef680203-9b35-4933-9b10-52ffa9740042',
     AIR_QUALITY: 'ef680204-9b35-4933-9b10-52ffa9740042',
     COLOR: 'ef680205-9b35-4933-9b10-52ffa9740042',
     CONFIGURATION: 'ef680206-9b35-4933-9b10-52ffa9740042',

     // UI
     LED: 'ef680301-9b35-4933-9b10-52ffa9740042',
     BUTTON: 'ef680302-9b35-4933-9b10-52ffa9740042',
     EXT_PIN: 'ef680303-9b35-4933-9b10-52ffa9740042',

     // MOTION
     MOTION_CONFIG: 'ef680401-9b35-4933-9b10-52ffa9740042',
     TAP: 'ef680402-9b35-4933-9b10-52ffa9740042',
     ORIENTATION: 'ef680403-9b35-4933-9b10-52ffa9740042',
     QUATERNION: 'ef680404-9b35-4933-9b10-52ffa9740042',
     PEDOMETER: 'ef680405-9b35-4933-9b10-52ffa9740042',
     MOTION_DATA: 'ef680406-9b35-4933-9b10-52ffa9740042',
     EULER: 'ef680407-9b35-4933-9b10-52ffa9740042',
     ROTATION_MATRIX: 'ef680408-9b35-4933-9b10-52ffa9740042',
     HEADING: 'ef680409-9b35-4933-9b10-52ffa9740042',
     GRAVITY_VECTOR: 'ef68040a-9b35-4933-9b10-52ffa9740042',

     // Sound
     SOUND_CONFIG: 'ef680501-9b35-4933-9b10-52ffa9740042',
     SPEAKER: 'ef680502-9b35-4933-9b10-52ffa9740042',
     SPEAKER_STATUS: 'ef680503-9b35-4933-9b10-52ffa9740042',
     MICROPHONE: 'ef680504-9b35-4933-9b10-52ffa9740042',

     // DFU
     DFU_CONTROL: '8ec90001-f315-4f60-9fb8-838830daea50'
};

const SPEAKER_MODE = {
  FREQUENCY: 1,
  PCM: 2,
  SAMPLE: 3
}

const MIC_MODE = {
  ADPCM: 1,
  SPL: 2,
}

const LED_COLOR = {
    RED: 1,
    GREEN: 2,
    YELLOW: 3,
    BLUE: 4,
    PURPLE: 5,
    CYAN: 6,
    WHITE: 7,
};

const LED_MODE = {
    OFF: 0,
    ON: 1,
    BREATHE: 2,
    FLASH_ONCE: 3
};
export const Thingy = new class extends EventTarget {

    #device
    #connected = false;
    #led
    #soundConfig
    #speaker

    constructor() {
        super();
        this._onBatteryChange = this._onBatteryChange.bind(this);
        this._onThermometerChange = this._onThermometerChange.bind(this);
        this._onAccelerometerChange = this._onAccelerometerChange.bind(this);
        this._onButtonChange = this._onButtonChange.bind(this);
        this._disconnected = this._disconnected.bind(this);
    }

    async _openDevice(device) {
        // if already connected to a device - close it
        if (this.#device) {
            this.disconnect();
        }

        this.dispatchEvent(new CustomEvent('thingy52_before_connect', {detail: { device }}));

        this.#device = device;

        const server = await device.gatt.connect();
        device.ongattserverdisconnected = e => this._disconnected(e);

        // Initialize and listen for changes to accelerometerm thermometer and button
        await this._startAccelerometerNotifications(server);
        await this._startThermometerNotifications(server);
        await this._startButtonClickNotifications(server);

        // NOTE: On Linux/BlueZ, there might be an issue with 16bit IDs
        try {
            await this._startBatteryNotifications(server);
        } catch(err) {
            console.log("Error with battery service: ", err);
        }

        this.#led = await this._getCharacteristics(server, SERVICE.UI, CHARACTERISTICS.LED);
        this.#soundConfig = await this._getCharacteristics(server, SERVICE.SOUND, CHARACTERISTICS.SOUND_CONFIG);
        this.#speaker = await this._getCharacteristics(server, SERVICE.SOUND, CHARACTERISTICS.SPEAKER);

        this.#connected = true;
        this.dispatchEvent(new CustomEvent('thingy52_connect', {detail: { device }}));
    }

    async _getCharacteristics(server, serviceUuid, characteristicsUuid) {
        const service = await server.getPrimaryService(serviceUuid);
        return await service.getCharacteristic(characteristicsUuid);
    }

    _disconnected(evt) {
        const deviceId = this.#device.id;
        this.dispatchEvent(new Event('thingy52_disconnect', {detail: { deviceId }}));
    }

    _onAccelerometerChange(event) {
        const target = event.target;

        const accel = {
          x: +target.value.getFloat32(0, true).toPrecision(5),
          y: +target.value.getFloat32(4, true).toPrecision(5),
          z: +target.value.getFloat32(8, true).toPrecision(5)
        };

        this.dispatchEvent(new CustomEvent('thingy52_accelerometer', {
            detail: accel
        }));
    }

    async _startAccelerometerNotifications(server) {
        const c = await this._getCharacteristics(server, SERVICE.MOTION, CHARACTERISTICS.GRAVITY_VECTOR);
        c.addEventListener('characteristicvaluechanged', this._onAccelerometerChange);
        return c.startNotifications();
    }

    _onButtonChange(event) {
        const target = event.target;
        const pressed = target.value.getUint8(0) === 1;

        const deviceId = this.#device.id;
        this.dispatchEvent(new CustomEvent('thingy52_button', {
            detail: { deviceId, pressed }
        }));
    }

    async _startButtonClickNotifications(server) {
        const c =await this._getCharacteristics(server, SERVICE.UI, CHARACTERISTICS.BUTTON);
        c.addEventListener('characteristicvaluechanged', this._onButtonChange);
        return c.startNotifications();
    }

    _onBatteryChange(event) {
        const target = event.target;
        const battery = target.value.getUint8(0);

        const deviceId = this.#device.id;
        this.dispatchEvent(new CustomEvent('thingy52_battery', {
            detail: { deviceId, battery }
        }));
    }

    async _startBatteryNotifications(server) {
        const c = await this._getCharacteristics(server, SERVICE.BATTERY, CHARACTERISTICS.BATTERY_LEVEL);
        // Read and send initial value
        const batteryLevel = (await c.readValue()).getUint8(0);

        const deviceId = this.#device.id;
        this.dispatchEvent(new CustomEvent('thingy52_battery', {
            detail: { deviceId, batteryLevel }
        }));

        c.addEventListener('characteristicvaluechanged', this._onBatteryChange);
        return c.startNotifications();
    }

    _onThermometerChange(event) {
        const target = event.target;
        const integer = target.value.getUint8(0);
        const decimal = target.value.getUint8(1);
        const temperature = Number.parseFloat(`${integer}.${decimal}`);

        const deviceId = this.#device.id;
        this.dispatchEvent(new CustomEvent('thingy52_temperature', {
            detail: { deviceId, temperature }
        }));
    }

    async _startThermometerNotifications(server) {
        const c = await this._getCharacteristics(server, SERVICE.ENVIRONMENT, CHARACTERISTICS.TEMPERATURE);
        c.addEventListener('characteristicvaluechanged', this._onThermometerChange);
        return c.startNotifications();
    }

    setLED(r, g, b) {
        if (this.#connected) {
          return this.#led.writeValue(new Uint8Array([LED_MODE.ON, r, g, b]));
        }
    }

    setLEDBreathe(color, intensity, delay) {
        if (this.#connected) {
          const data = new Uint8Array([LED_MODE.BREATHE, color, intensity, delay & 0xFF, (delay >> 8) & 0xFF]);
          return this.#led.writeValue(data);
        }
    }

    setLEDFlashOnce(color, intensity) {
        if (this.#connected) {
          const data = new Uint8Array([LED_MODE.FLASH_ONCE, color, intensity]);
          return this.#led.writeValue(data);
        }
    }

    setLEDOff() {
        if (this.#connected) {
          return this.#led.writeValue(new Uint8Array([LED_MODE.OFF]));
        }
    }

    beep(frequency, duration, volume) {
        if (this.#connected && this.#soundConfig && this.#speaker) {
          frequency = frequency? frequency :700;
          duration = duration? duration :500;
          volume = volume? volume :100;
          const speaker = this.#speaker; // Scope handing
          this.#soundConfig.writeValue(new Uint8Array([SPEAKER_MODE.FREQUENCY, MIC_MODE.ADPCM])).then(function(){
            let sound = new Uint8Array(5);
                    sound[0] = frequency & 0xFF;
                    sound[1] = (frequency >> 8) & 0xFF;
                    sound[2] = duration & 0xFF;
                    sound[3] = (duration >> 8) & 0xFF;
                    sound[4] = volume;
            speaker.writeValue(sound);
          });
        }
    }

    disconnect() {
        this.#device?.gatt?.disconnect();
        this.#connected = false;
        this.#device = undefined;
        this.#led = undefined;
        this.#soundConfig = undefined;
        this.#speaker = undefined;
    }

    async scan() {
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ services: [SERVICE.THINGY52] }],
            optionalServices: [
                SERVICE.BATTERY,
                SERVICE.ENVIRONMENT,
                SERVICE.UI,
                SERVICE.MOTION,
                SERVICE.SOUND
            ]
        });

        if (device) {
            await this._openDevice(device);
        }
    }
}