---
sort: 3
---
# LẬP TRÌNH GPIO TRÊN KIT LICHEEPI NANO

### Ví dụ điều khiển gpio trên LicheePi Nano
Thư viện gpio này sử dụng device driver “/dev/mem” trong linux kernel giúp chúng ta truy cập vào không gian địa chỉ vật lý.

#### Hổ trợ chức năng cơ bản:
Điều khiển gpio output/input (E2-E7)
Các gpio khác dành cho chức năng uart, i2c và spi hiện tại chưa hổ trợ với thư viện này.

#### Tải thư viện:
Trong repo có sẳn compiler được tạo ra trong quá trình build buildroot. Thư mục thư viện và examples đều có các Makefile khai báo trình biên dịch.

```shell
git clone https://github.com/ninhnn2/licheepi_nano_gpio.git

cd licheepi_nano_gpio/

# Biên dịch thư viện fagpio, sau khi biên dịch sẽ tạo ra file thư viện libfagpio.so.
make

# Copy thư viện libfagpio và file header fagpio.h vào thư mục blink
cp libfagpio.so fagpio.h  examples/blink/

# Biên dịch example blink app
cd examples/blink/
make -j8
```

#### blink app
```shell
#include <stdio.h>
#include "fagpio.h"         // include thư viện fagpio

int main(void) {

	fagpio_setup();           // hàm khởi tạo cho phép truy cập vùng nhớ vật lý

	pinMode(3, 0);            // Set GPIOE3 output
	pinMode(4, 0);            
	pinMode(5, 0);            

	while(1) {

		digitalWrite(3, 1);     // Set high GPIOE3
		digitalWrite(4, 1);
		digitalWrite(5, 1);

		usleep(118);

		digitalWrite(3, 0);     // Set lơ GPIOE3
		digitalWrite(4, 0);
		digitalWrite(5, 0);

		usleep(118);
	}

	fagpio_free();

	return 0;
}
```

#### Copy blink app và thư viện lên LicheePi Nano
Lưu ý

- Nếu các bạn dùng rom được tạo ra từ licheepi nano sdk thì đã có sẳn thư viện libfagpio, còn không các bạn phải copy file libfagpio.so cùng với app blink lên board.

- Với bản rom dành cho norflash, các bạn copy thư viện và blink app lên thư mục "/rom/work"

#### Run app
LD_LIBRARY_PATH=./: khai báo đường dẫn thư viện fagpio là vị trí hiện tại cùng thư mục với blink app

```shell
LD_LIBRARY_PATH=./ ./blink
```

#### Kết quả test gpio

![gpio](https://user-images.githubusercontent.com/41134638/131280433-b473e640-51d3-4ea8-a563-22d0e42955bf.png)

