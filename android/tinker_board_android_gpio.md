---
sort: 3
---

# CONTROL GPIO ON TINKER BOARD 2S ANDROID

## I. Access Tinker Board 2S with root permistion

Plug USB OTG from Tinker Board 2S to PC

On Host
```shell
adb root (root access)

adb shell (Enter as root)

su

mount -o rw,remount / (for permission write access)

```
On Tinker Board 2S

```shell
cd /sys/class/leds

# Control act-led on (Led near power led)
echo "1" >> act-led/brightness
# Control act-led off (Led near power led)
echo "0" >> act-led/brightness
```










