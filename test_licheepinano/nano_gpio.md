---
sort: 3
---

# LICHEE PI NANO GPIO LIBRARY

### Ví dụ điều khiển gpio trên LicheePi Nano
Ví dụ này sử dụng device driver “/dev/mem”, giúp chúng ta truy cập vào không gian địa chỉ vật lý, ở đây mình sẽ truy cập vào vùng nhớ vật lý điều khiển GPIO trên board LicheePi Nano.

#### Hổ trợ chức năng cơ bản:
Điều khiển gpio output/input (E2-E7)
Các gpio khác dành cho chức năng uart, i2c và spi hiện tại chưa hổ trợ với thư viện này.

#### Tải thư viện:
Trong repo có sẳn compiler được tạo ra trong quá trình build buildroot.

```shell
# Clone repo về máy tính
git clone https://github.com/ninhnn2/licheepi_nano_gpio.git

cd licheepi_nano_gpio/

# Biên dịch thư viện fagpio, sau khi biên dịch sẽ tạo ra file thư viện libfagpio.so.
make

# Copy thư viện libfagpio và file header fagpio.h vào thư mục blink
cp libfagpio.so fagpio.h  examples/

# Đi tới example blink led
cd examples/blink/

# Biên dịch blink app và copy lên LicheePi Nano
make

# Run blink app
./blink
```

### Kết quả test gpio

![gpio](https://user-images.githubusercontent.com/41134638/131280433-b473e640-51d3-4ea8-a563-22d0e42955bf.png)

