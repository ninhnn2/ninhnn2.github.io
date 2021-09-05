---
sort: 3
---
# LẬP TRÌNH GPIO TRÊN KIT LICHEEPI NANO

### Ví dụ điều khiển gpio trên LicheePi Nano
Bài viết này sử dụng device driver “/dev/mem” trong linux kernel giúp chúng ta truy cập vào không gian địa chỉ vật lý

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
cp libfagpio.so fagpio.h  examples/blink/

# Đi tới example blink led
cd examples/blink/

# Biên dịch blink app và copy lên LicheePi Nano
make
```
#### Copy blink app và thư viện lên LicheePi Nano
Lưu ý

- Nếu các bạn dùng rom được tạo ra từ licheepi nano sdk thì đã có sẳn thư viện libfagpio, còn không các bạn phải copy file libfagpio.so cùng với app blink lên board.

- Với bản rom dành cho norflash, các bạn copy thư viện và blink app lên thư mục "/rom/work"

#### Run app

```shell
LD_LIBRARY_PATH=./ ./blink
```

#### Kết quả test gpio

![gpio](https://user-images.githubusercontent.com/41134638/131280433-b473e640-51d3-4ea8-a563-22d0e42955bf.png)

