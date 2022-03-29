/* API for connecting a Nordic Thingy:52 device using web bluetooth.

  Original code by Lars Knudsen (@larsgk) from Thingy52Driver at
  https://github.com/larsgk/web-iot-lab/blob/main/thingy52-driver.js

  BSD 2

*/
export const Thingy = new class extends EventTarget {
    #device // Just allow one device, for now
    #ledCharacteristic

    constructor() {
        super();
        this._onBatteryChange = this._onBatteryChange.bind(this);
        this._onThermometerChange = this._onThermometerChange.bind(this);
        this._onAccelerometerChange = this._onAccelerometerChange.bind(this);
        this._onButtonChange = this._onButtonChange.bind(this);
    }

    async openDevice(device) {
        // if already connected to a device - close it
        if (this.#device) {
            this.disconnect();
        }

        const server = await device.gatt.connect();

        device.ongattserverdisconnected = e => this._disconnected(e);

        this.#device = device;
        this.dispatchEvent(new CustomEvent('connect', {detail: { device }}));

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

        this.#ledCharacteristic = await this._getLedCharacteristic(server);

        console.log('Opened device: ', device);
    }

    _onAccelerometerChange(event) {
        const target = event.target;

        const accel = {
          x: +target.value.getFloat32(0, true).toPrecision(5),
          y: +target.value.getFloat32(4, true).toPrecision(5),
          z: +target.value.getFloat32(8, true).toPrecision(5)
        };

        this.dispatchEvent(new CustomEvent('accelerometer', {
            detail: accel
        }));
    }

    async _startAccelerometerNotifications(server) {
        const service = await server.getPrimaryService('ef680400-9b35-4933-9b10-52ffa9740042');
        const characteristic = await service.getCharacteristic('ef68040a-9b35-4933-9b10-52ffa9740042');
        characteristic.addEventListener('characteristicvaluechanged', this._onAccelerometerChange);
        return characteristic.startNotifications();
    }

    _onButtonChange(event) {
        const target = event.target;
        const deviceId = target.service.device.id;

        const pressed = target.value.getUint8(0) === 1;

        this.dispatchEvent(new CustomEvent('button', {
            detail: { pressed }
        }));
    }

    async _startButtonClickNotifications(server) {
        const service = await server.getPrimaryService('ef680300-9b35-4933-9b10-52ffa9740042');
        const characteristic = await service.getCharacteristic('ef680302-9b35-4933-9b10-52ffa9740042');
        characteristic.addEventListener('characteristicvaluechanged', this._onButtonChange);
        return characteristic.startNotifications();
    }

    _onBatteryChange(event) {
        const target = event.target;
        const deviceId = target.service.device.id;

        const battery = target.value.getUint8(0);

        this.dispatchEvent(new CustomEvent('battery', {
            detail: { battery }
        }));
    }

    async _startBatteryNotifications(server) {
        const service = await server.getPrimaryService('battery_service');
        const characteristic = await service.getCharacteristic('battery_level');

        // Read and send initial value
        const battery = (await characteristic.readValue()).getUint8(0);
        this.dispatchEvent(new CustomEvent('battery', {
            detail: { battery }
        }));

        characteristic.addEventListener('characteristicvaluechanged', this._onBatteryChange);
        return characteristic.startNotifications();
    }

    _onThermometerChange(event) {
        const target = event.target;

        const integer = target.value.getUint8(0);
        const decimal = target.value.getUint8(1);

        const temperature = Number.parseFloat(`${integer}.${decimal}`);

        this.dispatchEvent(new CustomEvent('thermometer', {
            detail: { temperature }
        }));
    }

    async _startThermometerNotifications(server) {
        const service = await server.getPrimaryService('ef680200-9b35-4933-9b10-52ffa9740042');
        const characteristic = await service.getCharacteristic('ef680201-9b35-4933-9b10-52ffa9740042');
        characteristic.addEventListener('characteristicvaluechanged', this._onThermometerChange);
        return characteristic.startNotifications();
    }

    setLED(r, g, b) {
        return this.#ledCharacteristic.writeValue(new Uint8Array([1, r, g, b]));
    }

    async _getLedCharacteristic(server) {
        const service = await server.getPrimaryService('ef680300-9b35-4933-9b10-52ffa9740042');
        return await service.getCharacteristic('ef680301-9b35-4933-9b10-52ffa9740042');
    }

    disconnect() {
        this.#device?.gatt?.disconnect();
        this.#device = undefined;
    }

    _disconnected(evt) {
        this.dispatchEvent(new Event('disconnect'));
    }

    async scan() {
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ services: ['ef680100-9b35-4933-9b10-52ffa9740042'] }],
            optionalServices: [
                "battery_service",
                "ef680200-9b35-4933-9b10-52ffa9740042",
                "ef680300-9b35-4933-9b10-52ffa9740042",
                "ef680400-9b35-4933-9b10-52ffa9740042",
                "ef680500-9b35-4933-9b10-52ffa9740042"
            ]
        });

        if (device) {
            await this.openDevice(device);
        }
    }
}