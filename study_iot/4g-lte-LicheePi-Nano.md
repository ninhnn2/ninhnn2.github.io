---
sort: 2
---

# SIMA7670C/SIM7600CE 4G LTE IOT VỚI LICHEEPI NANO

### 1. Ứng dụng 4G LTE với board LicheePi Nano

4G LTE được ứng dụng để điều khiển thu thâp thông tin ở khoảng cách xa và không có wifi
hoặc ethernet.Thiết bị sử dụng 4G có thể là một microcontroller (ESP, STM32...) hoặc một
gateway chạy linux. Nếu như ứng dụng của chúng ta chỉ sử dụng một loại protocol đơn giản
thì chỉ cần sử dụng một con MCU + module SIM7600CE, còn nếu ứng dụng bắt buộc phải sữ dụng
nhiều protocol cùng lúc thì một gateway chạy linux được ưu tiên lựa chọn.

### 2. LicheePi Nano pinout

![image](https://user-images.githubusercontent.com/86546911/176376622-2e869c43-8eb7-49d3-8511-4aeacdd89cd7.png)


Sử dụng uart1 LicheePi Nano để giao tiếp với module SIM A7670C

| Licheepi Nano | Uart 1   |
| ------------- | -------- |
|      A2       |   RX     |
|      A3       |   TX     |



### 3. Module SIM A7670C pinout

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


### 8. Test network

```shell
iperf3 -c iperf.biznetnetworks.com
```


