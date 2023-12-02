---
sort: 1
---

# TINKER BOARD 2S ROOT ANDROID

### Cài đặt tools cần thiết trên Ubuntu 20

```shell
sudo apt update
sudo apt install android-tools-adb android-tools-fastboot
```

### Cài đặt Android cho Tinker Board 2S

#### Download Tinker Board Android OS

Link: https://dlcdnets.asus.com/pub/ASUS/Embedded_IPC/Tinker%20Board%202/Tinker_Board_2-Android11-v2.0.6-20220303.zip?model=Tinker%20Board%202S

#### Cài đặt Android OS vào Tinker Board 2S

Ở đây mình sử dụng chức năng USB UMS (USB Mass Storage) trên Tinker Board U-boot. Chức năng này giúp giả lập bộ nhớ eMMC
trên Tinker Board 2S thành một ổ đĩa vật lý. Từ đó dùng tools balenaetcher trên Windown để flash Android OS vào eMMC của
Tinker Board 2S.

#### Root Tinker Board 2S

- Download các tool cần thiết để root cho Tinker Board 2S: https://www.mediafire.com/folder/mncw8m6p6z0im/tinker_board_resource
- Cắm dây USB C để giao tiếp Tinker Board 2S tới máy tính Ubuntu
- Nạp file boot.img trong thư mục download lên Tinker Board 2S
```shell
adb push boot.img /storage/emulated/0/Download/
```
- Install Magisk tools lên Tinker Board 2S
```shell
adb install Magisk.apk
```
- Cắm bàn phím và chuột vào Tinker Board để chạy ứng dụng Magisk
- Press the Install button
- Choose “Select and Patch a File” in method, and select the boot.img file,  
- The Magisk app will patch the boot.img file to [Internal Storage]/Download/magisk_patched_[random_strings].img
- Pull magisk_patched_[random_strings].img to your PC
```shell
adb pull /storage/emulated/0/Download/magisk_patched_[random_strings].img
```
- Flash boot image patched by magisk in fastboot mode
```shell
adb reboot-bootloader
sudo fastboot flash boot magisk_patched_[random_strings].img
sudo fastboot reboot
```
- Install rootChecker
```shell
adb install RootChecker.apk
```
- Install Youtupe TV
```shell
adb install youtube_tv.apk
```








