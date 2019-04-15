/*
Riven
load dependency
"joyfrog": "file:../pxt-joyfrog"
*/


//% color="#15aabf" weight=10 icon="\uf11b"
namespace joyfrog {
    let v: string;

    export enum JoyDirection {
        X,
        Y
    }

    export enum JoyBtns {
        //% block=space
        BTN_SPACE = 0x2C,
        //% block=↑
        BTN_UP = 0x52,
        //% block=↓
        BTN_DOWN = 0x51,
        //% block=←
        BTN_LEFT = 0x50,
        //% block=→
        BTN_RIGHT = 0x4f,
        //% block=X
        BTN_X = 0x1B,
        //% block=Y
        BTN_Y = 0x1C,
        //% block=A
        BTN_A = 0x04,
        //% block=B
        BTN_B = 0x05,
        //% block=1
        BTN_1 = 0x1E,
        //% block=2
        BTN_2 = 0x1F,
        //% block=3
        BTN_3 = 0x20,
        //% block=4
        BTN_4 = 0x21,
        //% block=5
        BTN_5 = 0x22,
        //% block=6
        BTN_6 = 0x23,
        //% block=7
        BTN_7 = 0x24,
        //% block=8
        BTN_8 = 0x25
    }

    export enum JoyPort {
        //% block=Port3
        PORT_3 = 1,
        //% block=Port4
        PORT_4 = 2,
    }

    type EvtAct = () => void;

    // let btnCb: { [key: number]: EvtAct } = {};

    let btnCb: KeyHandler[] = []

    export class KeyHandler {
        key: number;
        fn: () => void;
    }

    let joyCb: EvtAct;
    let infraRxCb: (data: string) => void;
    let digiReadCb: (data: number) => void;
    let analogReadCb: (data: number) => void;
    let joyX: number;
    let joyY: number;

    function trim(t: string): string {
        if (t.charAt(t.length - 1) == ' ') {
            t = t.substr(0, t.length - 1)
        }
        return t;
    }

    function seekNext(space: boolean = true): string {
        for (let i = 0; i < v.length; i++) {
            if ((space && v.charAt(i) == ' ') || v.charAt(i) == '\r' || v.charAt(i) == '\n') {
                let ret = v.substr(0, i)
                v = v.substr(i + 1, v.length - i)
                return ret;
            }
        }
        return '';
    }

    serial.onDataReceived('\n', function () {
        v = serial.readString()
        let argv: string[] = []

        if (v.charAt(0) == 'M') {
            v = v.substr(1, v.length - 1) + ' '
            let cmd = parseInt(seekNext())
            if (cmd == 2) {
                // serial.writeString("$ " + btnCb[arg1])
                let arg1 = parseInt(seekNext())
                for (let i=0;i<btnCb.length;i++){
                    if (btnCb[i].key == arg1){
                        btnCb[i].fn()
                    }
                }
                /*
                if (btnCb[arg1]) {
                    btnCb[arg1]();
                }
                */
            } else if (cmd == 1) {
                let arg1 = parseInt(seekNext())
                joyX = -255 - parseInt(seekNext())
                joyY = -255 - parseInt(seekNext())
                /*
                if (btnCb[arg1]) {
                    btnCb[arg1]();
                }
                */
                for (let i = 0; i < btnCb.length; i++) {
                    if (btnCb[i].key == arg1) {
                        btnCb[i].fn()
                    }
                }
                if (joyCb) {
                    joyCb();
                }
            } else if (cmd == 4) {
                if (infraRxCb) {
                    infraRxCb(seekNext());
                }
            } else if (cmd == 8) {
                let arg1 = parseInt(seekNext())
                let arg2 = parseInt(seekNext())
                if (digiReadCb) {
                    digiReadCb(arg2);
                }
            } else if (cmd == 11) {
                let arg1 = parseInt(seekNext())
                if (analogReadCb) {
                    analogReadCb(arg1);
                }
            }
        }
    })

    //% shim=joyfrog::setSerialBuffer
    function setSerialBuffer(size: number): void {
        return null;
    }

    /**
     * Init joyfrog extension
    */
    //% blockId=joyfrog_init block="JoyFrog init"
    //% weight=100
    export function joyfrog_init(): void {
        serial.redirect(
            SerialPin.P13,
            SerialPin.P16,
            BaudRate.BaudRate115200
        )
        basic.pause(100)
        setSerialBuffer(64);
        serial.readString()
        serial.writeString('\n\n')
        basic.pause(100)
        serial.writeString("M0\n")
        basic.pause(100)
        serial.writeString('M7 14\n')
    }

    /**
     * On Joystick button
    */
    //% blockId=on_btn_pressed block="on Button |%button pressed"
    //% weight=98
    export function on_btn_pressed(button: JoyBtns, handler: () => void): void {
        // btnCb[button] = handler;
        let btnHandler = new KeyHandler()
        btnHandler.fn = handler
        btnHandler.key = button
        btnCb.push(btnHandler)
    }

    //% blockId=on_joystick_pushed block="on Joystick Pushed"
    //% weight=97
    export function on_joystick_pushed(handler: () => void): void {
        joyCb = handler;
    }

    //% blockId=joystick_value block="Joystick %dir"
    //% weight=96
    //% blockGap=50
    export function joystick_value(dir: JoyDirection): number {
        return dir == JoyDirection.X ? joyX : joyY;
    }

    //% blockId=on_infra_data block="on Infra Rx"
    //% weight=89
    export function on_infra_data(handler: (data: string) => void): void {
        infraRxCb = handler;
    }

    /**
     * Send infra data
     * @param data Data to send; eg: ff906f
    */
    //% blockId=infra_send block="Infra Tx %data"
    //% weight=89
    //% blockGap=50
    export function infra_send(data: string): void {
        serial.writeLine("M3 " + data)
    }

    //% blockId=digi_write block="Digital Write %port Value|%value"
    //% weight=79
    export function digi_write(port: JoyPort, value: number): void {
        serial.writeLine("M9 " + port + " " + value + "\n")
    }

    //% blockId=digi_read block="Digital Read %port"
    //% weight=77
    export function digi_read(port: JoyPort): void {
        serial.writeLine("M8 " + port + " \n")
    }

    //% blockId=on_digi_read block="on Digital Read"
    //% weight=76
    //% blockGap=50
    export function on_digi_read(handler: (data: number) => void): void {
        digiReadCb = handler;
    }

    //% blockId=analog_read block="Analog Read %port"
    //% weight=74
    export function analog_read(port: JoyPort): void {
        serial.writeLine("M11 " + port + " \n")
    }

    //% blockId=on_analog_read block="on Analog Read"
    //% weight=72
    //% blockGap=50
    export function on_analog_read(handler: (data: number) => void): void {
        analogReadCb = handler;
    }

    //% blockId=port_pwm block="Port %port PWM Pulse|%pulse (us) Period|%period (us)"
    //% weight=72
    export function port_pwm(port: JoyPort, pulse: number, period: number): void {
        serial.writeLine("M12 " + port + " " + pulse + " " + period + "\n")
    }

    //% blockId=port_servo block="Port %port Servo Degree|%degree"
    //% weight=72
    //% blockGap=50
    export function port_servo(port: JoyPort, degree: number): void {
        const t0 = Math.round(degree * 50 / 9 + 1000);
        serial.writeLine("M12 " + port + " " + t0 + " 50000\n")
    }
}
