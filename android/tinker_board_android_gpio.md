---
sort: 4
---

# TINKER BOARD 2S ANDROID CONTROL GPIO

## I. Access Tinker Board 2S with root permistion

Plug USB OTG from Tinker Board 2S to PC

On Host
```shell
adb root (root access)

adb shell (Enter as root)

su

mount -o rw,remount / (for permission write access)

```
## II. Simple control gpio on Tinker Board 2S with root permistion

### Using command on terminal

```shell
cd /sys/class/leds

# Control act-led on (Led near power led)
echo "1" >> act-led/brightness
# Control act-led off (Led near power led)
echo "0" >> act-led/brightness
```

### So we add commandline to shell script as below:

-Create a file with the contend as below on Laptop host with the name file "gpio_on.sh"

-Tạo một file với nội dung như dưới đây trên laptop tên là "gpio_on.sh"

```shell
#!/system/bin/sh
echo 1 >> act-led/brightness
```

Run shell script
```shell
sh gpio_on.sh
```
























