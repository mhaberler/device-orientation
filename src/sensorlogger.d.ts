type Message = {
    messageId: number;
    sessionId: string;
    deviceId: string;
    payload: SensorReading[];
};

type SensorReading =
    | MicrophoneReading
    | LocationReading
    | XYZReading
    | OrientationReading
    | BarometerReading
    | BrightnessReading
    | NetworkReading
    | BatteryReading
    | BluetoothReading
    | BluetoothMetadataReading
    | WristMotionReading
    | PedometerReading
    | HeadphoneReading
    | AnnotationReading;

type MicrophoneReading = {
    name: "microphone";
    time: number;
    values: {
        dBFS: number;
    };
};

type LocationReading = {
    name: "location";
    time: number;
    values: {
        altitude: number;
        speedAccuracy: number;
        bearingAccuracy: number;
        latitude: number;
        altitudeAboveMeanSeaLevel: number;
        bearing: number;
        horizontalAccuracy: number;
        verticalAccuracy: number;
        longitude: number;
        speed: number;
    };
};

type XYZReading = {
    name:
    | "magnetometeruncalibrated"
    | "gyroscopeuncalibrated"
    | "accelerometeruncalibrated"
    | "magnetometer"
    | "gyroscope"
    | "accelerometer"
    | "gravity"
    | "magnetometer";
    time: number;
    values: {
        z: number;
        y: number;
        x: number;
    };
    accuracy?: number;
};

type OrientationReading = {
    name: "orientation";
    time: number;
    values: {
        yaw: number;
        qx: number;
        qz: number;
        roll: number;
        qw: number;
        qy: number;
        pitch: number;
    };
};
type BarometerReading = {
    name: "barometer";
    time: number;
    values: {
        relativeAltitude: number;
        pressure: number;
    };
};
type BrightnessReading = {
    name: "brightness";
    time: number;
    values: {
        brightness: number;
    };
};

type NetworkReading = {
    name: "network";
    time: number;
    values: {
        type?: string;
        isConnected?: boolean;
        isInternetReachable?: boolean;
        isWifiEnabled?: boolean;
        isConnectionExpensive?: boolean;
        ssid?: string;
        bssid?: string;
        strength?: number;
        ipAddress?: string;
        frequency?: number;
        cellularGeneration?: string;
        carrier?: string;
    };
};

type BatteryReading = {
    name: "battery";
    time: number;
    values: {
        batteryLevel: number;
        batteryState: "unknown" | "unplugged" | "charging" | "full";
        lowPowerMode: boolean;
    };
};

type BluetoothReading = {
    name: "bluetooth";
    time: number;
    values: {
        id: string;
        rssi: number | null;
        txPowerLevel?: number;
        manufacturerData?: string;
    };
};

type BluetoothMetadataReading = {
    name: "bluetoothmetadata";
    time: number;
    values: {
        id: string;
        name: string;
        isConnectable: number;
        localName?: string;
        serviceUUIDs?: string;
    };
};

type WristMotionReading = {
    name: "wrist motion";
    time: number;
    values: {
        rotationRateX: number;
        rotationRateY: number;
        rotationRateZ: number;
        gravityX: number;
        gravityY: number;
        gravityZ: number;
        accelerationX: number;
        accelerationY: number;
        accelerationZ: number;
        quaternionW: number;
        quaternionX: number;
        quaternionY: number;
        quaternionZ: number;
    };
};

type PedometerReading = {
    name: "pedometer";
    time: number;
    values: {
        steps: number;
    };
};
type HeadphoneReading = {
    name: "headphone";
    time: number;
    values: {
        devicelocation: "left" | "right";
        roll: number;
        yaw: number;
        pitch: number;
        rotationRateX: number;
        rotationRateY: number;
        rotationRateZ: number;
        quaternionW: number;
        quaternionX: number;
        quaternionY: number;
        quaternionZ: number;
        gravityX: number;
        gravityY: number;
        gravityZ: number;
        accelerationX: number;
        accelerationY: number;
        accelerationZ: number;
    };
};

type AnnotationReading = {
    name: "annotation";
    time: number;
    values: {
        text: string;
        millisecond_press_duration: number;
    };
};