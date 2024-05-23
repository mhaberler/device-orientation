from pyzbar.pyzbar import decode
from PIL import Image
import pyzstd
import base64
import json
import sys
import os.path

# decode a Sensor Logger config code from
# an image file
# the config string with URI prefix
# the config string without URI prefix
# example
# python decode.py qrcode.png https://sensorlogger.app/link/config/KLUv/WRDAEUGAELOKR9gadMGqha2u4dEmj36NjE7NcQIMyFBJUx/2WQQAMC5zzNxdFzOGViIi5IJyQJmU5J63J6VFkZWHeZbtx8dmctFbm6aFg8WR5/i9kVFUWVAP9LSviGrS9BZ9U0AgQBA79V1e5+hkHYZi2OMZmwDutqmO4G5PYuNjDamcga353AIwMU3bLbREVSKS0xNfZ2YNvEFdOxrhFVO5NuPxHyK4OiOqmRZdb4QCgBCRtbCDELMGHgcd34vN1DtQyrZnpIA5tqQde4BeN9HaA== KLUv/WRDAEUGAELOKR9gadMGqha2u4dEmj36NjE7NcQIMyFBJUx/2WQQAMC5zzNxdFzOGViIi5IJyQJmU5J63J6VFkZWHeZbtx8dmctFbm6aFg8WR5/i9kVFUWVAP9LSviGrS9BZ9U0AgQBA79V1e5+hkHYZi2OMZmwDutqmO4G5PYuNjDamcga353AIwMU3bLbREVSKS0xNfZ2YNvEFdOxrhFVO5NuPxHyK4OiOqmRZdb4QCgBCRtbCDELMGHgcd34vN1DtQyrZnpIA5tqQde4BeN9HaA==

prefix = b'https://sensorlogger.app/link/config/'
for arg in sys.argv[1:]:
    s = ""
    if os.path.isfile(arg):
        img = Image.open(arg)
        q = decode(img)
        for d in q:
            if d.type != "QRCODE":
                continue
            s = bytes(d.data)
            print(f"QRcode found in image {arg}")
            break
    else:
        s = bytes(arg, encoding='utf8')
    if len(s):
        print(f"decoding {s}")
        if s.startswith(prefix):
            cf = s[len(prefix) :]
        else:
            cf = s
        print(f"b64decode '{cf}'")
        d = base64.b64decode(cf)
        cfg = pyzstd.decompress(d)
        print("Result:")
        js = json.loads(cfg)
        print(json.dumps(js, indent=4))
