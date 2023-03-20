---
sort: 1
---

# TINKER BOARD 2S ANDROID

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

- 





