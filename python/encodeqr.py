from PIL import Image
import pyzstd
import base64
import json
import qrcode

# create a Sensor Logger QRcode from config object

qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_L,
    box_size=10,
    border=4,
)

prefix = b"https://sensorlogger.app/link/config/"

cfg = {
   "workflow": "Classic",
    "sensorState": {
        "Orientation": {
            "enabled": True,
            "speed": 200
        },
        "Magnetometer": {
            "enabled": True,
            "speed": 200
        }, 
    },
    "mqtt": {
        "enabled": True,
        "url": "SETME",
        "port": "443",
        "tls": True,
        "topic": "sensor-logger",
        "batchPeriod": 200,
        "username": "SETME",
        "password": "SETME",
        "skip": True
    },
    "uncalibrated": False,
    "confirmEnding": True,
    "keepAwake": "On",
}

s = json.dumps(cfg).encode()
z = pyzstd.compress(s)
e = prefix + base64.b64encode(z)
qr.add_data(e)
qr.make(fit=True)
img = qr.make_image(fill_color="black", back_color="white")
img.save("generated.png")
