import { GUI, Controller, BooleanController } from 'lil-gui'
import {
    AmbientLight,
    ArrowHelper,
    AxesHelper,
    BoxGeometry,
    Clock,
    Euler,
    GridHelper,
    LoadingManager,
    MathUtils,
    Mesh,
    MeshLambertMaterial,
    MeshStandardMaterial,
    PCFSoftShadowMap,
    PerspectiveCamera,
    PlaneGeometry,
    PointLight,
    PointLightHelper,
    Quaternion,
    Scene,
    Vector3,
    WebGLRenderer,
} from 'three'
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { DragControls } from 'three/examples/jsm/controls/DragControls'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as animations from './helpers/animations'
import { toggleFullScreen } from './helpers/fullscreen'
import { resizeRendererToDisplaySize } from './helpers/responsiveness'
import { qrcodeAsSVG } from './helpers/displayqrcode'
import { Notyf } from 'notyf';
import mqtt, { IClientOptions, MqttProtocol } from 'mqtt';
import './style.css'
import '/node_modules/notyf/notyf.min.css'
import { ZstdInit, ZstdStream, ZstdCodec } from '@oneidentity/zstd-js/wasm';
import { bytesToBase64 } from './helpers/base64'

const CANVAS_ID = 'scene'

let canvas: HTMLElement
let renderer: WebGLRenderer
let scene: Scene
let loadingManager: LoadingManager
let ambientLight: AmbientLight
let pointLight: PointLight
let cube: Mesh
let camera: PerspectiveCamera
let cameraControls: OrbitControls
let dragControls: DragControls
let axesHelper: AxesHelper
let pointLightHelper: PointLightHelper
let clock: Clock
let gui: GUI
let mqttFolder: GUI
let finePrintFolder: GUI
let client: mqtt.MqttClient;
let qrController: Controller;
let lastOrientation = new Quaternion();
let heading: Vector3 = new Vector3(1, 0, 0).normalize();
let arrow: ArrowHelper;
let arrow_visible = false;
let euler: Euler = new Euler(0, 0, 0);
let notyf: Notyf;
// let loader: GLTFLoader;
// let dracoLoader: DRACOLoader;
let hostCtr: Controller;
let portCtr: Controller;
let usernameCtr: Controller;
let passwordCtr: Controller;
let topicCtr: Controller;
let connectCtr: Controller;

const prefix = "https://sensorlogger.app/link/config/"
const sensorloggerConfig: Object = {
    workflow: "Classic",
    sensorState: {
        Orientation: {
            enabled: true,
            speed: 200
        },
        Magnetometer: {
            enabled: true,
            speed: 200
        },
    },
    mqtt: {
        enabled: true,
        url: "",
        port: 443,
        tls: true,
        topic: "sensor-logger",
        batchPeriod: 200,
        username: "",
        password: "",
        skip: true
    },
    confirmEnding: true,
    keepAwake: "On",
}

const animation = { enabled: false, play: true }
const gltfModel = { enabled: false, name: "Modelname" }
const mountSettings = {
    applyReferencePosition: false,
    referencePosition: new Quaternion().identity(),
};


init()
animate()

// function loadModel(name: string) {
//     // Load a glTF resource
//     loader.load(
//         // resource URL
//         name,
//         // called when the resource is loaded
//         function (gltf) {
//             notyf.success(`${name} loaded`);
//             scene.add(gltf.scene);

//             // gltf.animations; // Array<THREE.AnimationClip>
//             // gltf.scene; // THREE.Group
//             // gltf.scenes; // Array<THREE.Group>
//             // gltf.cameras; // Array<THREE.Camera>
//             // gltf.asset; // Object

//         },
//         // called while loading is progressing
//         function (xhr) {
//             console.log((xhr.loaded / xhr.total * 100) + '% loaded');
//         },
//         // called when loading has errors
//         function (error) {
//             notyf.error(`${name} - load failed: ${error} `);
//             console.log('An error happened');
//         }
//     );
// }

function init() {
    // ===== 🖼️ CANVAS, RENDERER, & SCENE =====
    {
        canvas = document.querySelector(`canvas#${CANVAS_ID}`)!
        renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = PCFSoftShadowMap
        scene = new Scene()
    }

    // ===== 👨🏻‍💼 LOADING MANAGER =====
    {
        loadingManager = new LoadingManager()

        loadingManager.onStart = () => {
            console.log('loading started')
        }
        loadingManager.onProgress = (url, loaded, total) => {
            console.log('loading in progress:')
            console.log(`${url} -> ${loaded} / ${total}`)
        }
        loadingManager.onLoad = () => {
            console.log('loaded!')
        }
        loadingManager.onError = () => {
            console.log('❌ error while loading')
        }
    }

    // ===== 💡 LIGHTS =====
    {
        ambientLight = new AmbientLight('white', 0.4)
        pointLight = new PointLight('white', 20, 100)
        pointLight.position.set(-2, 2, 2)
        pointLight.castShadow = true
        pointLight.shadow.radius = 4
        pointLight.shadow.camera.near = 0.5
        pointLight.shadow.camera.far = 4000
        pointLight.shadow.mapSize.width = 2048
        pointLight.shadow.mapSize.height = 2048
        scene.add(ambientLight)
        scene.add(pointLight)
    }

    // gltf support
    {
        // loader = new GLTFLoader();
        // dracoLoader = new DRACOLoader();
        // loader.setDRACOLoader(dracoLoader);
    }
    // ===== 📦 OBJECTS =====
    {
        const sideLength = 1
        const cubeGeometry = new BoxGeometry(sideLength, sideLength, sideLength)
        const cubeMaterial = new MeshStandardMaterial({
            color: '#f69f1f',
            metalness: 0.5,
            roughness: 0.7,
        })
        cube = new Mesh(cubeGeometry, cubeMaterial)
        cube.castShadow = true
        cube.position.y = 0.5

        const planeGeometry = new PlaneGeometry(3, 3)
        const planeMaterial = new MeshLambertMaterial({
            color: 'gray',
            emissive: 'teal',
            emissiveIntensity: 0.2,
            side: 2,
            transparent: true,
            opacity: 0.7,
        })
        const plane = new Mesh(planeGeometry, planeMaterial)
        // plane.rotateX(Math.PI / 2)
        plane.receiveShadow = true

        scene.add(cube)
        scene.add(plane)
    }

    // ===== 🎥 CAMERA =====
    {
        camera = new PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 100)
        camera.position.set(2, 2, 5)
    }

    // ===== 🕹️ CONTROLS =====
    {
        cameraControls = new OrbitControls(camera, canvas)
        cameraControls.target = cube.position.clone()
        cameraControls.enableDamping = true
        cameraControls.autoRotate = false
        cameraControls.update()

        dragControls = new DragControls([cube], camera, renderer.domElement)
        dragControls.addEventListener('hoveron', (event) => {
            const mesh = event.object as Mesh
            const material = mesh.material as MeshStandardMaterial
            material.emissive.set('orange')
        })
        dragControls.addEventListener('hoveroff', (event) => {
            const mesh = event.object as Mesh
            const material = mesh.material as MeshStandardMaterial
            material.emissive.set('black')
        })
        dragControls.addEventListener('dragstart', (event) => {
            const mesh = event.object as Mesh
            const material = mesh.material as MeshStandardMaterial
            cameraControls.enabled = false
            animation.play = false
            material.emissive.set('black')
            material.opacity = 0.7
            material.needsUpdate = true
        })
        dragControls.addEventListener('dragend', (event) => {
            cameraControls.enabled = true
            animation.play = true
            const mesh = event.object as Mesh
            const material = mesh.material as MeshStandardMaterial
            material.emissive.set('black')
            material.opacity = 1
            material.needsUpdate = true
        })
        dragControls.enabled = false

        // Full screen
        window.addEventListener('dblclick', (event) => {
            if (event.target === canvas) {
                toggleFullScreen(canvas)
            }
        })
    }

    // ===== 🪄 HELPERS =====
    {
        axesHelper = new AxesHelper(4)
        axesHelper.visible = true
        scene.add(axesHelper)

        pointLightHelper = new PointLightHelper(pointLight, undefined, 'orange')
        pointLightHelper.visible = false
        scene.add(pointLightHelper)

        const gridHelper = new GridHelper(20, 20, 'teal', 'darkgray')
        gridHelper.position.y = -0.01
        // scene.add(gridHelper)
    }
    // heading arrow
    {
        const length = 2;
        const headLength = 0.1 * length;
        const headWidth = 0.2 * headLength;
        const arrow_color = 0xffff00;
        arrow = new ArrowHelper(
            new Vector3(2, 2, 0).normalize(), // direction
            new Vector3(0.01, 0.01, 0), // origin
            length,
            arrow_color, headLength, headWidth);

    }

    // ===== 📈 STATS & CLOCK =====
    {
        clock = new Clock()
    }

    // QR code svg container
    const qrcodeContainer = document.getElementById("qrcode-container");
    if (qrcodeContainer) {
        qrcodeContainer.onclick = () => {
            qrController.setValue(false)
        }
    } else {
        console.error("Element with ID 'qrcode-container' not found.");
    }

    // Notyf notifier
    notyf = new Notyf({ position: { x: 'left', y: 'bottom' } });

    // ==== 🐞 DEBUG GUI ====
    {
        gui = new GUI({ title: '🐞 Debug GUI', width: 300 })

        const cubeOneFolder = gui.addFolder('Cube one')

        cubeOneFolder.add(cube.position, 'x').min(-5).max(5).step(0.5).name('pos x')
        cubeOneFolder.add(cube.position, 'y').min(-5).max(5).step(0.5).name('pos y')
        cubeOneFolder.add(cube.position, 'z').min(-5).max(5).step(0.5).name('pos z')

        cubeOneFolder.add(cube.material, 'wireframe')
        cubeOneFolder.addColor(cube.material, 'color')
        cubeOneFolder.add(cube.material, 'metalness', 0, 1, 0.1)
        cubeOneFolder.add(cube.material, 'roughness', 0, 1, 0.1)

        cubeOneFolder
            .add(cube.rotation, 'x', -Math.PI * 2, Math.PI * 2, Math.PI / 4)
            .name('rotate x')
        cubeOneFolder
            .add(cube.rotation, 'y', -Math.PI * 2, Math.PI * 2, Math.PI / 4)
            .name('rotate y')
        cubeOneFolder
            .add(cube.rotation, 'z', -Math.PI * 2, Math.PI * 2, Math.PI / 4)
            .name('rotate z')

        cubeOneFolder.add(animation, 'enabled').name('animated')

        cubeOneFolder.add(gltfModel, 'gltf', {
            Cube: "Cube",
            AdafruitBoard: "Adafruit",
            iPhone: "andr",
            Android: "andr",
            Balloon: "Ballo"
        }).name('Model')
            .onChange(value => {
                console.log(value)
            });

        // cubeOneFolder.hide();
        // cubeOneFolder.close();

        const controlsFolder = gui.addFolder('Controls')
        controlsFolder.add(dragControls, 'enabled').name('drag controls')
        controlsFolder.close();

        const lightsFolder = gui.addFolder('Lights')
        lightsFolder.add(pointLight, 'visible').name('point light')
        lightsFolder.add(ambientLight, 'visible').name('ambient light')
        lightsFolder.close();

        const helpersFolder = gui.addFolder('Helpers')
        helpersFolder.add(axesHelper, 'visible').name('axes')
        helpersFolder.add(pointLightHelper, 'visible').name('pointLight')

        const cameraFolder = gui.addFolder('Camera')
        cameraFolder.add(cameraControls, 'autoRotate')
        cameraFolder.close();

        // MQTT parameters
        let mqttSettings: MQTTSetting = {
            connect: false,
            host: `${import.meta.env.VITE_BROKER}`,
            port: parseInt(import.meta.env.VITE_PORT),
            username: `${import.meta.env.VITE_USER}`,
            password: `${import.meta.env.VITE_PASSWORD}`,
            topic: `${import.meta.env.VITE_TOPIC}`,
            keepAlive: 30,
            connectTimeout: 5000,
            reconnectPeriod: 2000,
            perMessageDeflate: false,
            showQRcode: false,
            protocol: whichMqttProtocol(),
        }

        mqttFolder = gui.addFolder('MQTT')
        hostCtr = mqttFolder.add(mqttSettings, "host").name('Host');
        portCtr = mqttFolder.add(mqttSettings, "port").name('Port');
        usernameCtr = mqttFolder.add(mqttSettings, "username").name('Username');
        passwordCtr = mqttFolder.add(mqttSettings, "password").name('Password');
        topicCtr = mqttFolder.add(mqttSettings, "topic").name('Topic');
        connectCtr = mqttFolder.add(mqttSettings, "connect")
            .name('Connect')
            .onChange(() => {
                mqtt_setup(mqttSettings);
            });

        finePrintFolder = gui.addFolder('MQTT: the gory details')
        finePrintFolder.add(mqttSettings, "keepAlive").name('Keepalive sec')
        finePrintFolder.add(mqttSettings, "connectTimeout").name('connectTimeout msec')
        finePrintFolder.add(mqttSettings, "reconnectPeriod").name('reconnectPeriod msec')
        finePrintFolder.add(mqttSettings, "perMessageDeflate").name('Deflate')
        finePrintFolder.add(mqttSettings, 'protocol', {
            "unencrypted Websockets": 'ws',
            "secure Websockets": 'wss'
        }).name('Protocol')
            .onChange(value => {
                console.log(value)
            });

        finePrintFolder.close()

        qrController = mqttFolder.add(mqttSettings, "showQRcode")
            .name('Sensorlogger\nQR Code')
            .onChange(value => {
                if (!qrcodeContainer)
                    return;
                if (value) {
                    sensorloggerConfig["mqtt"]["url"] = mqttSettings.host
                    sensorloggerConfig["mqtt"]["port"] = mqttSettings.port
                    sensorloggerConfig["mqtt"]["username"] = mqttSettings.username
                    sensorloggerConfig["mqtt"]["password"] = mqttSettings.password
                    sensorloggerConfig["mqtt"]["topic"] = mqttSettings.topic
                    sensorloggerConfig["mqtt"]["tls"] = mqttSettings.protocol === 'wss'

                    let js = JSON.stringify(sensorloggerConfig);
                    console.log(js)
                    const compressionLevel = 20;
                    const doCheckSum = true;

                    ZstdInit().then(({ ZstdStream }: ZstdCodec) => {
                        const data: Uint8Array = new TextEncoder().encode(js)
                        const compressedStreamData: Uint8Array = ZstdStream.compress(data, compressionLevel, doCheckSum);
                        let base64: string = bytesToBase64(compressedStreamData);
                        let slconfig: string = prefix + base64
                        console.log(slconfig)
                        let svg = qrcodeAsSVG({
                            value: slconfig,
                            length: ((window.innerWidth > 0) ? window.innerWidth : screen.width) / 2
                        })
                        qrcodeContainer.innerHTML = "<h2>Sensorlogger QR Code</h2> <p>" + svg;
                    });
                } else {
                    qrcodeContainer.innerHTML = "";
                }
            });

        // "Mounting matrix"
        const mountFolder = gui.addFolder('Mount position')
        mountFolder.add(mountSettings, "applyReferencePosition")
            .name('Record & apply\nMount Position\ntransform')
            .onChange(() => {
                if (mountSettings.applyReferencePosition) {
                    mountSettings.referencePosition = lastOrientation.clone().conjugate();
                } else {
                    mountSettings.referencePosition = new Quaternion().identity()
                }
                // console.log(mountSettings);
            });

        // persist GUI state in local storage on changes
        gui.onFinishChange(() => {
            const guiState = gui.save()
            localStorage.setItem('guiState', JSON.stringify(guiState))
        })

        // load GUI state if available in local storage
        const guiState = localStorage.getItem('guiState')
        if (guiState) {
            gui.load(JSON.parse(guiState))
        }

        // reset GUI state button
        const resetGui = () => {
            localStorage.removeItem('guiState')
            // gui.reset()
            let foo = mqttFolder;
            hostCtr.setValue(`${import.meta.env.VITE_BROKER}`);
            portCtr.setValue(parseInt(import.meta.env.VITE_PORT));
            usernameCtr.setValue(`${import.meta.env.VITE_USER}`);
            passwordCtr.setValue(`${import.meta.env.VITE_PASSWORD}`);
            topicCtr.setValue(`${import.meta.env.VITE_TOPIC}`);
            connectCtr.setValue(false);

            const guiState = gui.save()
            localStorage.setItem('guiState',  JSON.stringify(guiState));
            gui.reset()

            gui.load(guiState, true)
        }
        gui.add({ resetGui }, 'resetGui').name('RESET')
        gui.close()
    }
}

function isSecure() {
    return window.location.protocol == 'https:';
}

function whichMqttProtocol(): MqttProtocol {
    return window.location.protocol == 'https:' ? 'wss' : 'ws';
}

function mqtt_setup(mqttSettings: MQTTSetting) {
    if (mqttSettings.connect) {
        const clientId = 'devorient_' + Math.random().toString(16).substring(2, 8)
        const options: IClientOptions = { // https://github.com/mqttjs/MQTT.js#mqttclientstreambuilder-options
            host: mqttSettings.host,
            port: mqttSettings.port,
            username: mqttSettings.username,
            password: mqttSettings.password,
            clientId: clientId,
            clean: true,
            connectTimeout: 5000,
            reconnectPeriod: 3000,
            protocol: mqttSettings.protocol,
            keepalive: mqttSettings.keepAlive,
            wsOptions: { perMessageDeflate: mqttSettings.perMessageDeflate }
        }
        const qos = 0

        client = mqtt.connect(options)

        client.on('error', (err) => {
            console.log('Connection error: ', err)
            notyf.error({message: `MQTT Connection error: ${err}`,  duration: 30});
        })

        client.on('reconnect', () => {
            notyf.success('MQTT Reconnecting...');
        })

        client.on('connect', () => {
            console.log('Client connected: ' + clientId)
            notyf.success('MQTT connected');
            client.subscribe(mqttSettings.topic, { qos }, (error) => {
                if (error) {
                    console.log('Subscribe error:', error)
                    return
                }
                notyf.success('MQTT subscribed');
            })
            client.subscribe("imu/orientation", { qos }, (error) => {
                if (error) {
                    console.log('Subscribe error:', error)
                    return
                }
                // notyf.success('MQTT subscribed');
            })
        })

        client.on('message', (topic, message) => {
            let json: any = JSON.parse(message.toString());
            if (topic === 'sensor-logger') {
                if ('name' in json && json.name === 'test') {
                    notyf.success('Sensorlogger test push detected');
                }
                if ('payload' in json) {
                    json.payload.forEach((p: any) => {
                        if (p.name === 'orientation') {
                            let r: OrientationReading = p
                            let orientation: Quaternion = new Quaternion(r.values.qx, r.values.qy, r.values.qz, r.values.qw);
                            lastOrientation.copy(orientation);
                            cube.quaternion.slerp(orientation.multiply(mountSettings.referencePosition), 1);

                            // euler.setFromQuaternion(orientation.normalize());

                            // if (!arrow_visible) {
                            //     scene.add(arrow)
                            //     arrow_visible = true;
                            // }
                            // animate()
                        }
                        // if (p.name === 'magnetometeruncalibrated') {
                        //     let mag: XYZReading = p
                        //     const direction = new Vector3(mag.values.x, mag.values.y, mag.values.z).normalize();
                        //     arrow.setDirection(direction)
                        //     if (!arrow_visible) {
                        //         scene.add(arrow)
                        //         arrow_visible = true;
                        //     }
                        //     // animate()
                        // }
                    });
                }
            }
            if (topic === 'imu/orientation') {
                let imu: IMUOrientation = json;
                let o: Quaternion = new Quaternion(imu.x, imu.y, imu.z, imu.w);
                lastOrientation.copy(o);
                cube.quaternion.slerp(o.multiply(mountSettings.referencePosition), 1);

                // euler.setFromQuaternion(orientation.normalize());
                // const dir = new Vector3().setFromEuler(euler).normalize();

                let hdg = Math.atan2(2 * o.x * o.y + 2 * o.z * o.w, 1 - 2 * o.y * o.y - 2 * o.z * o.z)
                if (hdg < 0) hdg = Math.PI * 2 + hdg;
                // console.log(MathUtils.radToDeg(hdg)) // GOOD!
                //     arrow.setDirection(dir)
                // if (!arrow_visible) {
                //     scene.add(arrow)
                //     arrow_visible = true;
                // }
                // animate()
                // setHeading(imu.hdg)
            }
        })
    } else {
        if (typeof client !== 'undefined') {
            client.end();
            notyf.success({ message: 'MQTT client ended', background: "blue" });
        }
    }
}

function animate() {
    requestAnimationFrame(animate)
    if (animation.enabled && animation.play) {
        animations.rotate(cube, clock, Math.PI / 3)
        animations.bounce(cube, clock, 1, 0.5, 0.5)
    }
    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement
        camera.aspect = canvas.clientWidth / canvas.clientHeight
        camera.updateProjectionMatrix()
    }
    cameraControls.update()
    renderer.render(scene, camera)
}

// Function to create a unit vector from an angle in the XY plane
function unitVectorFromAngle(angleInDegrees) {
    const angleInRadians = MathUtils.degToRad(angleInDegrees); // Convert degrees to radians
    const x = Math.cos(angleInRadians); // Calculate the x component
    const y = Math.sin(angleInRadians); // Calculate the y component

    // Create and return the unit vector
    return new Vector3(x, y, 0);
}

// Function to create a unit vector from an angle in the XY plane
// function setHeading(angleInDegrees) {
//     const angleInRadians = MathUtils.degToRad(angleInDegrees); // Convert degrees to radians
//     const x = Math.cos(angleInRadians); // Calculate the x component
//     const y = Math.sin(angleInRadians); // Calculate the y component
//     heading.setX(x)
//     heading.setY(y)
//     heading.normalize()
//     // Create and return the unit vector
//     // return new Vector3(x, y, 0);
// }

// https://vitejs.dev/guide/build.html#load-error-handling
window.addEventListener('vite:preloadError', (event) => {
    window.location.reload() // for example, refresh the page
})