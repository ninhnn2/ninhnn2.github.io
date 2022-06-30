---
sort: 2
---

# HƯỚNG DẪN KẾT NỐI TCP/IP MODULE SIM 4G SIM7600 A7670 VỚI LICHEEPI NANO

### 1. Ứng dụng 4G LTE với board LicheePi Nano

4G LTE được ứng dụng để điều khiển thu thâp thông tin ở khoảng cách xa và không có wifi
hoặc ethernet.Thiết bị sử dụng 4G có thể là một microcontroller (ESP, STM32...) hoặc một
gateway chạy linux. Nếu như ứng dụng của chúng ta chỉ sử dụng một loại protocol đơn giản
thì chỉ cần sử dụng một con MCU + module SIM7600CE, còn nếu ứng dụng bắt buộc phải sữ dụng
nhiều protocol cùng lúc thì một gateway chạy linux được ưu tiên lựa chọn.

### 2. LicheePi Nano Pinout

![image](https://user-images.githubusercontent.com/86546911/176376622-2e869c43-8eb7-49d3-8511-4aeacdd89cd7.png)


Sử dụng uart1 LicheePi Nano để giao tiếp với module SIM A7670C

| Licheepi Nano | Uart 1   |
| ------------- | -------- |
|      A2       |   RX     |
|      A3       |   TX     |



### 3. Module SIM A7670C Pinout

![image](https://user-images.githubusercontent.com/86546911/176383066-5a393fcc-4607-436a-b09d-c9017f4b2302.png)

### 4. Sơ đồ đấu dây

Với module A7670C của mình thì không ra chân usb, nên ở đây mình sử dụng giao thức PPPOS (Point to Point Over Serial).
PPP là giao thức giao tiếp dữ liệu lớp cao, được sử dụng chủ yếu trong các module mạng. Ưu điểm của giao thức PPP là
có thể gửi trực tiếp giữ liệu mà không cần phải sử dụng AT command. Vì thế chúng ta chỉ cần nối Tx/Rx trên LicheePi Nano
với Rx/Tx trên module sim A7670C là được.

### 5. Làm sao để chạy được giao thức PPPOS cho LicheePi Nano

Để chạy được giao thức PPPOS (hoặc QMI/MBIM interface) thì đầu tiên Linux kernel trên LicheePi Nano phải enable driver
ppp (hoặc QMI/MBIM driver). Tiếp theo đó, bản rom linux chạy trên LicheePi Nano phải được cài đặt tools ppp (hoặc qmicli/mbimcli
tương ứng với từng interface).

### 6. Enable driver PPP trong Linux kernel LicheePi Nano

Để thuận tiện lấy source linux kernel và toolschain để rebuild kernel với driver PPP được enable, mình nghỉ các bạn nên
tham khảo bài viết trước của mình:

[Tự tạo linux distro cho LicheePi Nano](https://ninhnn2.github.io/study_licheepinano/nano_buildsystem.html)

- Clone source LicheePi Nano SDK
```shell
 git clone https://github.com/ninhnn2/licheepi_nano_sdk.git
```

- Đi vào thư mục licheepi_nano_sdk
```shell
cd licheepi_nano_sdk
```

- Pull hết source linux kernel và toolschain cần thiết
```shell
./build.sh pull_all
```


- Đi vào thư mục linux kernel
```shell
cd Lichee-Pi-linux
```

- Update device tree từ repo vào source linux kernel
```shell
 cp ../suniv-f1c100s-licheepi-nano.dts arch/arm/boot/dts/
```

- Update kernel config từ repo vào source linux kernel
```shell
cp ../linux-licheepi_nano_defconfig arch/arm/configs/
```

- Apply config linux kernel cho LicheePi Nano
```shell
make ARCH=arm CROSS_COMPILE=../toolchain/gcc-linaro-7.4.1-2019.02-x86_64_arm-linux-gnueabi/bin/arm-linux-gnueabi- linux-licheepi_nano_defconfig
```

- Mở menuconfig để enable các driver cần thiết
```shell
make ARCH=arm CROSS_COMPILE=../toolchain/gcc-linaro-7.4.1-2019.02-x86_64_arm-linux-gnueabi/bin/arm-linux-gnueabi- menuconfig
```


![image](https://user-images.githubusercontent.com/86546911/176582935-f27ba007-df23-41bb-85e6-bd8534d69519.png)



Vào Device Drivers ---> Network device support ---> <*>   PPP (point-to-point protocol) support


![image](https://user-images.githubusercontent.com/86546911/176582939-cc64d7e4-4770-4330-9a71-166fe3710c90.png)


- Sau khi save config thì chúng ta rebuild lại linux kernel cho LicheePi Nano
```shell
make ARCH=arm CROSS_COMPILE=../toolchain/gcc-linaro-7.4.1-2019.02-x86_64_arm-linux-gnueabi/bin/arm-linux-gnueabi- -j8
```

### 7. Setup PPP cho LicheePi Nano

Boot LicheePi Nano lên và truy cập console

- Test uart1 trên LicheePi Nano bằng lệnh sau, nếu output lệnh báo error thì uart1 chưa được enable
```shell
cat /dev/ttyS1
```

#### Configuring ppp

- Tạo file rnet
```shell
vim /etc/ppp/peers/rnet
```

- Thêm nội dùng sau vào file rnet
```shell
connect "/usr/sbin/chat -v -f /etc/chatscripts/gprs -T internet.telekom"

/dev/ttyUSB2

115200

noipdefault

usepeerdns

defaultroute

persist

noauth

nocrtscts

local
```


- Save file rnet và exit, tiếp theo chúng ta edit file sau
```shell
vim /etc/chatscripts/gprs
```

- Sữa nội dung file gprs như sau
```shell
ABORT   BUSY
ABORT   VOICE
ABORT   "NO CARRIER"
ABORT   "NO DIALTONE"
ABORT   "NO DIAL TONE"
ABORT   "NO ANSWER"
ABORT   "DELAYED"
ABORT   "ERROR"

ABORT   "+CGATT: 0"

""  AT
TIMEOUT 12
OK  ATH
OK  ATE1

OK  AT+CGDCONT=1,"IP","\T","",0,0
OK  ATD*99#
TIMEOUT 22
CONNECT ""
```

Lúc này PPP đã được config xong


### 8. Test connection

- Start PPP
```shell
pon rnet
```

- Kiểm tra log hệ thống và interface mạng ppp0 có up thành công không
```shell
tail -n 30 /var/log/syslog
ifconfig
```

- Test tốc độ mạng 4G LTE qua PPP protocol
```shell
iperf3 -c iperf.biznetnetworks.com
```


