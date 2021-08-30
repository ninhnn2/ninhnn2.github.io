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

# Biên dịch thư viện fagpio
make

# Đi tới example blink led
cd examples/blink/

# Biên dịch blink app
make
```

