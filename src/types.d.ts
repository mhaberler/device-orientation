
type MQTTSetting = {
    connect: boolean,
    host: string,
    port: number,
    username: string,
    password: string,
    topic: string,
    keepAlive: number,
    connectTimeout: number,
    reconnectPeriod: number,
    perMessageDeflate: boolean,
    showQRcode: boolean,
    protocol: MqttProtocol,
};

type IMUOrientation = {
    time: number,
    ref: boolean,
    x: number,
    y: number,
    z: number,
    w: number,
    hdg: number,
    heading_correction: boolean
};

type Hdg = {
    time: number,
    hdg: number,
};

type MQTTMessage =
    | Message
    | IMUOrientation
    | Hdg;

// type SensorloggerConfig = {



// }

enum UIMode {
    Sensorbox,
    SensorLogger,
    Expert
}