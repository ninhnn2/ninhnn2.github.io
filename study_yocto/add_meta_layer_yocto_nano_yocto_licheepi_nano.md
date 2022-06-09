---
sort: 3
---

# HƯỚNG DẪN ADD MỘT META LAYER VÀO YOCTO LICHEEPI NANO


#### 1. Meta layer trong Yocto là gì ?

Những thay đổi cần thiết để hỗ trợ một một platform phần cứng hoặc một thiết bị , được lưu giữ trên một
layer Yocto riêng biệt, được gọi là meta layer. Sự tách biệt này là tốt nhất cho các bản 
cập nhật phần mềm trong tương lai và các bản vá hệ thống cho thiết bị. BSP layer có thể hổ trợ bất kể số 
lượng thiết bị và tính năng mới nào được dành riêng cho platform trên thiết bị đó (licheepi nano).

#### 2. Làm thế nào để tạo một meta layer

Theo quy ước, layer Yocto bắt đầu bằng "meta", viết tắt của siêu dữ liệu và cuối cùng là một tên duy nhất.
Còn ở bài viết này mình sử dụng tên layer là "meta-gpio". Layer "meta-gpio" này sẽ hổ trợ build thư viện 
fagpio và install vào rootfs yocto licheepi nano (f1c100s).

#### 3. Có vài cách để tạo một meta layer
- Tự tạo bằng tay, với phương pháp này bạn cần biết chính xác mình cần làm những gì để hạn chế lỗi.
- Copy một layer sample có sẳn trong poky (Yocto) tên là "meta-skeleton".
- Dùng công cụ "bitbake-layers" để tạo (mình đang dùng phiên bản Yocto Zeus, công cụ sẽ khác nếu các bạn
sử dụng phiên bản Yocto cũ hơn).

#### 4. Tạo meta layer bằng công cụ bitbake-layers
- Đi tới thư mục Home
```shell
# cd
```
- Đi đến thư mục Yocto poky
```shell
# cd yocto/poky
```


- Khởi tạo môi trường để sử dụng Yocto
```shell
# source oe-init-build-env build-f1c100s
```


- Tạo một meta layer mới tại thư mục "~/yocto/poky"
```shell
# bitbake-layers create-layer ../meta-gpio
```

- Add đường dẫn meta layer mới "~/yocto/poky/meta-gpio" vào file config bblayers.conf
```shell
# bitbake-layers add-layer ../meta-gpio
```

Lúc này tại thư mục poky sẽ có một "meta-gpio" mới được tạo và đường dẫn tới layer này sẽ được add vào 
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
