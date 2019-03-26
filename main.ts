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
    type EvtAct = () => void;

    let btnCb: { [key: number]: EvtAct } = {};
    let joyCb: EvtAct;
    let infraRxCb: (data: string) => void;
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
                if (btnCb[arg1]) {
                    btnCb[arg1]();
                }
            } else if (cmd == 1) {
                let arg1 = parseInt(seekNext())
                joyX = parseInt(seekNext())
                joyY = parseInt(seekNext())
                if (btnCb[arg1]) {
                    btnCb[arg1]();
                }
                if (joyCb){
                    joyCb();
                }
            } else if (cmd == 4){
                if (infraRxCb){
                    infraRxCb(seekNext());
                }
            }
        }
    })

    //% shim=kittenwifi::setSerialBuffer
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
        setSerialBuffer(64);
        serial.readString()
        serial.writeString('\nJOYFROG\n')
    }

    /**
     * On Joystick button
    */
    //% blockId=on_btn_pressed block="on Button |%button pressed"
    //% weight=98
    export function on_btn_pressed(button: JoyBtns, handler: () => void): void {
        btnCb[button] = handler;
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
    export function infra_send(data: string): void {
        serial.writeLine("M3 "+data)
    }

}
