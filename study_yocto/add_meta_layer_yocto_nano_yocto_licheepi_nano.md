---
sort: 3
---

# HƯỚNG DẪN THÊM MỘT SOFTWARE LAYER VÀO LICHEEPI NANO IMAGE


#### 1. Meta software layer trong Yocto là gì ?

Các tools, thư viện, các bản vá lỗi cho hệ thống filesystem, được lưu giữ trên một layer Yocto riêng biệt,
được gọi là sofware layer. Một layer sẽ bao gồm một hoặc nhiểu recipe, mỗi recipe sẽ có các thuộc tính
như fetch, configure, compile, install, deploy dùng để biên dịch một package (thư viện, tools...). Trong
bài viết này, chúng ta sẽ tạo một meta layer chứa recipe có chức năng biên dịch thư viện gpio cho board 
licheepi nano.


#### 2. Làm thế nào để tạo một meta software layer

Theo quy ước, layer Yocto bắt đầu bằng "meta", viết tắt của siêu dữ liệu và cuối cùng là một tên duy nhất.
Còn ở bài viết này mình sử dụng tên layer là "meta-gpio". Layer "meta-gpio" này sẽ hổ trợ build thư viện 
fagpio và install vào rootfs yocto licheepi nano (f1c100s).

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

#### 4. Biên dịch một package trong meta software layer

```shell
$ bitbake gpio
```

#### 5. Sample nội dung recipe

```shell
DESCRIPTION = "Simple gpio example"
SECTION = "examples"
LICENSE = "MIT"
LIC_FILES_CHKSUM = "file://${COMMON_LICENSE_DIR}/MIT;md5=0835ade698e0bcf8506ecda2f7b4f302"

SRC_URI = "file://gpio.c"

S = "${WORKDIR}"

do_compile() {
        ${CC} -o gpio gpio.c
}

do_install() {
        install -d ${D}${bindir}
        install -m 0755 gpio ${D}${bindir}
}

```
















