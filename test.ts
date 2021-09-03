joyfrog.on_btn_pressed(joyfrog.JoyBtns.BTN_UP, function () {
    basic.showArrow(ArrowNames.North)
})
joyfrog.on_btn_pressed(joyfrog.JoyBtns.BTN_RIGHT, function () {
    basic.showArrow(ArrowNames.East)
})
joyfrog.on_btn_pressed(joyfrog.JoyBtns.BTN_LEFT, function () {
    basic.showArrow(ArrowNames.West)
})
joyfrog.on_btn_pressed(joyfrog.JoyBtns.BTN_SPACE, function () {
    basic.showIcon(IconNames.Heart)
})
joyfrog.on_btn_pressed(joyfrog.JoyBtns.BTN_DOWN, function () {
    basic.showArrow(ArrowNames.South)
})
joyfrog.joyfrog_init()
