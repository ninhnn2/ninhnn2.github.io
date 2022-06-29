---
sort: 2
---

# SIMA7670C/SIM7600CE 4G LTE IOT VỚI LICHEEPI NANO

#### 1. Ứng dụng 4G LTE với board LicheePi Nano

4G LTE được ứng dụng để điều khiển thu thâp thông tin ở khoảng cách xa và không có wifi
hoặc ethernet.Thiết bị sử dụng 4G có thể là một microcontroller (ESP, STM32...) hoặc một
gateway chạy linux. Nếu như ứng dụng của chúng ta chỉ sử dụng một loại protocol đơn giản
thì chỉ cần sử dụng một con MCU + module SIM7600CE, còn nếu ứng dụng bắt buộc phải sữ dụng
nhiều protocol cùng lúc thì một gateway chạy linux được ưu tiên lựa chọn.

#### 2. LicheePi Nano pinout

![image](https://user-images.githubusercontent.com/86546911/176376622-2e869c43-8eb7-49d3-8511-4aeacdd89cd7.png)


Sử dụng uart1 LichPi Nano để giao tiếp với module SIM A7670C

| Licheepi Nano | Uart 1   |
| ------------- | -------- |
|      A2       |   RX     |
|      A3       |   TX     |



#### 3. Module SIM A7670C pinout







#### 4. Sơ đồ đấu dây





