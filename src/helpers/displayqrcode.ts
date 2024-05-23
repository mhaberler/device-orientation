import { generateSVGString } from '@intosoft/custoqr';


const QRconfig : Object = {
    // "length": 600,
    "length": (window.innerWidth > 0) ? window.innerWidth : screen.width,
    "padding": 20,
    "errorCorrectionLevel": "H" as const,
    "logo": {
        "url": "",
        "size": 11,
        "removeBg": false
    },
    "shapes": {
        "eyeFrame": "body" as const,
        "eyeball": "circle" as const,
        "body": "square" as const
    },
    "colors": {
        "background": "rgba(226, 197, 38, 0)",
        // "body": "rgba(220, 46, 77, 1)",
        "body": "rgba(255, 255, 255, 1)",
        "eyeFrame": {
            "topLeft": "body",
            "topRight": "body",
            "bottomLeft": "body"
        },
        "eyeball": {
            "topLeft": "body",
            "topRight": "body",
            "bottomLeft": "body"
        }
    }
}

function qrcodeAsSVG(config?: any ) {
    return generateSVGString({...QRconfig, ...config});
}

export { qrcodeAsSVG }



