---
sort: 3
---

# HƯỚNG DẪN THÊM MỘT META SOFTWARE LAYER VÀO LICHEEPI NANO YOCTO IMAGE


#### 1. Meta software layer trong Yocto là gì ?

Các tools, thư viện, các bản vá lỗi cho hệ thống filesystem, được lưu giữ trên một layer Yocto riêng biệt,
được gọi là sofware layer. Một layer sẽ bao gồm một hoặc nhiểu recipe, mỗi recipe sẽ có các thuộc tính
như fetch, configure, compile, install, deploy dùng để biên dịch một package (thư viện, tools...). Trong
bài viết này, chúng ta sẽ tạo một meta layer chứa recipe có chức năng biên dịch thư viện gpio cho board 
LicheePi Nano.


#### 2. Làm thế nào để tạo một meta software layer

Theo quy ước, layer Yocto bắt đầu bằng "meta", viết tắt của siêu dữ liệu và cuối cùng là một tên duy nhất.
Còn ở bài viết này mình sử dụng tên layer là "meta-gpio". Layer "meta-gpio" này sẽ hổ trợ build thư viện 
gpio và install vào rootfs yocto LicheePi Nano (f1c100s).

#### 3. Các cách để tạo một software layer
- Tự tạo bằng tay, với phương pháp này bạn cần biết chính xác mình cần làm những gì để hạn chế lỗi.
- Copy một layer sample có sẳn trong poky (Yocto) tên là "meta-skeleton".
- Dùng công cụ "bitbake-layers" để tạo (mình đang dùng phiên bản Yocto Zeus, công cụ sẽ khác nếu các bạn
sử dụng phiên bản Yocto cũ hơn).

#### 4. Tạo software layer bằng công cụ bitbake-layers
- Đi tới thư mục Home

```shell
$ cd
```
- Đi đến thư mục Yocto poky

```shell
$ cd yocto/poky
```

- Khởi tạo môi trường để sử dụng Yocto

```shell
$ source oe-init-build-env build-f1c100s
```

- Tạo một meta layer mới tại thư mục "~/yocto/poky"

```shell
$ bitbake-layers create-layer ../meta-gpio
```

- Add đường dẫn meta layer mới "~/yocto/poky/meta-gpio" vào file config bblayers.conf

```shell
$ bitbake-layers add-layer ../meta-gpio
```

Lúc này tại thư mục poky sẽ có một thư mục "meta-gpio" mới được tạo và đường dẫn tới layer này sẽ được add vào 
file "bblayers.conf". Trong "meta-gpio" sẽ có một sample recipe tên là example, bitbake sẽ sử dụng cái 
tên này để tìm kiếm và chạy các lệnh trong recipe này


Dưới đây là file bblayers.conf của mình

```shell
# POKY_BBLAYERS_CONF_VERSION is increased each time build/conf/bblayers.conf
# changes incompatibly
POKY_BBLAYERS_CONF_VERSION = "2"

BBPATH = "${TOPDIR}"
BBFILES ?= ""

BBLAYERS ?= " \
  ${TOPDIR}/../meta \
  ${TOPDIR}/../meta-poky \
  ${TOPDIR}/../meta-yocto-bsp \
  ${TOPDIR}/../meta-openembedded/meta-oe \
  ${TOPDIR}/../meta-openembedded/meta-networking \
  ${TOPDIR}/../meta-openembedded/meta-python \
  ${TOPDIR}/../meta-qt5 \
  ${TOPDIR}/../meta-f1c100s \
  /home/fanning/yocto/poky/meta-gpio \
"
```

#### 4 Cấu trúc một sofware layer

Sau khi add một layer bằng bitbake-layers, thì bitbake sẽ tạo ra cho chúng ta một recipe tên là example
và mình đã đổi tên thành gpio.

Tại thư mục gpio, tạo thư mục tên là files, thư mục này chứa source file code mà chúng ta cần biên dịch.

```shell
├── conf
│   └── layer.conf
├── COPYING.MIT
├── README
└── recipes-fgpio
    └── fgpio
        ├── fgpio_1.0.bb
        └── files
            ├── fgpio.c
            └── fgpio.h
```

#### 5. Nội dung recipe file gpio_1.0.bb 

SRC_URI = "file://gpio.c" : Khai báo vị trí source file gpio.c

do_compile() : Hàm này sẽ được thực thi khi bitbake biên dịch package gpio (EX: bitbake -c compile gpio)

do_install() : Hàm này sẽ được thực thi khi bitbake install package gpio (EX: bitbake -c install gpio)


```shell
DESCRIPTION = "Simple fgpio example"
SECTION = "examples"
LICENSE = "MIT"
LIC_FILES_CHKSUM = "file://${COMMON_LICENSE_DIR}/MIT;md5=0835ade698e0bcf8506ecda2f7b4f302"

SRC_URI = "file://fgpio.c \
           file://fgpio.h \ 
"

S = "${WORKDIR}"

PACKAGES = "${PN}"
FILES_${PN} += "${libdir}/*"
FILES_${PN} += "${includedir}/*"

do_compile() {
        ${CC} -c -Wall -Werror -fpic fgpio.c
        ${CC} -shared -o libfgpio.so fgpio.o
}

do_install() {
        install -d ${D}${libdir}
        install -d ${D}${includedir}
        install -m 0755 libfgpio.so ${D}${libdir}
        install -m 644 fgpio.h ${D}${includedir}/fgpio.h
}

```

#### 6. Biên dịch recipe trong meta software layer

```shell
$ bitbake fgpio
```

Với lệnh trên, bitbake sẽ tìm recipe gpio và thực thi chạy các hàm trong recipe đó bao gồm
+ Get source từ internet (do_fetch() )
+ Configure package vừa download (do_configure() )
+ Compile package (do_package() )
+ Install package vào rootfs (do_install() )

Bitback sẽ biên dịch recipe fgpio,nhưng hiện tại bản rom yocto cho LicheePi Nano yocto vẫn 
chưa có thư viện fgpio. Chúng ta cần add tên recipe "fgpio" vào file local.conf.

Đường dẫn file local.conf trên máy mình như sau

```shell
/home/fanning/yocto/poky/build-f1c100s/conf/local.conf
```
Thêm recipe vào local.conf

```shell
IMAGE_INSTALL_append += " \
    fgpio \
"
```

Sau đó chúng ta chỉ cần build lại image cho LicheePi Nano với lệnh sau
```shell
bitbake core-image-minimal
```

Như vậy, sau khi ta flash image này vào thẻ nhớ và boot LicheePi Nano
thư viện fgpio sẽ có sẳn trên hệ thống rootfs.


#### 7. Chương trình C cơ bản sử dụng thư viện fgpio

Tạo file app.c với nội dung sau

```shell
#include <stdio.h>
#include "fgpio.h"

int main(void) {

        fagpio_setup();

        pinMode(3, 0);            // Set GPIOE3 output
        pinMode(4, 0);            
        pinMode(5, 0);            

        while(1) {

                digitalWrite(3, 1);     // Set high GPIOE3
                digitalWrite(4, 1);
                digitalWrite(5, 1);

                usleep(118);

                digitalWrite(3, 0);     // Set low GPIOE3
                digitalWrite(4, 0);
                digitalWrite(5, 0);

                usleep(118);
        }

        fagpio_free();

        return 0;
}

```

Copy file này lên LicheePi Nano và biên dịch với lệnh sau

```shell
gcc -g -o app app.c -lfgpio
```

Chạy app sau khi biên dịch

```shell
./app
```

