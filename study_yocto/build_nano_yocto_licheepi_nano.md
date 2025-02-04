---
sort: 1
---

# HƯỚNG DẪN BUILD YOCTO CHO BOARD LICHEEPI NANO

#### 1. Giới thiệu về Yocto Project

Dự án Yocto (http://www.yoctoproject.org/) là một trình tạo bản phân phối nhúng Linux
sử dụng một số dự án mã nguồn mở khác. Ở bài viết này, thuật ngữ chung Yocto dùng để chỉ Dự án Yocto.

Bản phân phối Linux là một tập hợp các gói phần mềm bao gồm tools, thư viện, bootloader và nhân hệ điều hành.
Hiện tại có hàng trăm loại Linux distro, điển hình và phổ biến nhất là Ubuntu, Debian, Kali Linux..., nhưng 
hầu hết chúng không được thiết kế để chạy cho các hệ thống nhúng nhỏ nhẹ ( chạy trên Norflash, Nand flash).
Yocto ra đời giúp cho việc tạo một bản phân phối Linux dễ dàng và chuyên nghiệp hơn, có thể custom cho các
thiết bị có Ram từ 128Mb đến hàng trăm GB.

#### 2. Cài đặt môi trường development cho Ubuntu 20.04
Sau đây là các list package mà mình thường install trong quá trình development

```shell
sudo apt-get install git cmake vim autoconf -y
sudo apt-get install python-minimal -y
sudo apt-get install gawk wget git-core diffstat unzip texinfo gcc-multilib build-essential chrpath socat libsdl1.2-dev xterm -y
sudo apt-get install libcurl-ocaml-dev libmosquitto-dev libmosquittopp-dev libusb-1.0-0-dev libssl-ocaml-dev -y
sudo apt-get install bison flex swig libtool curl -y
sudo apt-get install uuid-dev libacl1-dev liblzo2-dev libzstd-dev lib32z1 device-tree-compiler minicom -y
sudo apt-get install libncurses5-dev libncursesw5-dev -y
sudo apt-get install cpio python2 python2.7 python-dev -y
```


#### 3. Lấy source và tiến hành build yocto cho board LicheePi Nano

Ở đây mình sử dụng board licheepi nano vì nó có giá thành rẻ, nhỏ gọn. Hầu hết mọi người 
đều có thể mua và học được. Từ đó các bạn có thể tự tạo cho mình một bản linux distro với
đầy đủ các công cụ mà bạn cần.


```shell
user# cd ~
user# mkdir yocto
user# cd yocto
user# git clone -b zeus git://git.yoctoproject.org/poky.git
user# cd poky

# meta layer hổ trợ hầu hết các tools, thư viện cần thiết cho một distro linux
user# git clone -b zeus https://github.com/openembedded/meta-openembedded.git

# meta layer support compile qt5 và install vào rom cho LicheePi Nano
user# git clone -b zeus https://github.com/meta-qt5/meta-qt5.git

# meta layer hổ trợ cho board LicheePi Nano (Linux kernel, u-boot)
user# git clone -b zeus https://github.com/ninhnn2/meta-f1c100s.git

# Khởi tạo môi môi trường build yocto 
user# source oe-init-build-env build-f1c100s

# copy các config example mình đã chuẩn bị sẵn
user# cp ../meta-f1c100s/conf/sample/bblayers.conf.sample ./conf/bblayers.conf
user# cp ../meta-f1c100s/conf/sample/local.conf.sample ./conf/local.conf

# Tiến hành build
user# bitbake core-image-minimal
```
File image sau khi hoàn thành quá trình build

```shell
tmp/deploy/images/f1c100s/core-image-minimal-f1c100s-20210909112750.rootfs.sunxi-sdimg.img
```

#### 4. Flash image vào sdcard

```shell
cd tmp/deploy/images/f1c100s/
sudo dd bs=4M if=core-image-minimal-f1c100s-20210909112750.rootfs.sunxi-sdimg.img of=/dev/sdx conv=fsync
```

#### 5. Thêm tool và thư viện vào image

Tìm tên một tool hoặc thư viện được hổ trợ bởi layer meta-openembeded các bạn truy cập vào trang này:

https://layers.openembedded.org/layerindex/branch/zeus/recipes/

Thêm tên tool hoặc thư viện vào file local.conf

```shell
user# cd
user# cd yocto/poky/
user# source oe-init-build-env build-f1c100s
user# vim conf/local.conf
```

Giả sử mình muốn thêm thư viện mosquitto để viết app sử dung giao thức mqtt thì chúng ta thêm các dòng sau vào file local.conf

```shell
IMAGE_INSTALL_append += " \
        mosquitto \
"
```
#### 6. Cài đặt resource máy tính để build yocto

Yocto cho phép chúng ta chọn số tác vụ tối đa mà Bitbake và make có thể chạy song song, luồng song song chạy càng nhiều thì build càng nhanh (lưu ý nếu chạy full luồng trên máy thì dễ khiến máy treo nếu bạn còn dùng máy với các phần mềm nặng khác). Thêm 2 dòng sau vào local.conf.

```shell
BB_NUMBER_THREADS ?= "3"
PARALLEL_MAKE ?= "-j 3"
```

#### 7. Set password cho user root và tạo thêm user mới

```shell
EXTRA_IMAGE_FEATURES += "debug-tweaks "
INHERIT += "extrausers"

# Set pasword cho user root là 000
EXTRA_USERS_PARAMS  = "usermod -P 000 root; "
# Thêm 1 user tên là fanning và set pasword là 000
EXTRA_USERS_PARAMS += "useradd -P 000 fanning;"
# Add user fanning vào group sudo (để dùng sudo các bạn cần add thêm recipe tên là sudo như trong bước 2)
EXTRA_USERS_PARAMS += "usermod -a -G sudo fanning;"
```
Sau khi thêm các cài đặt mà chúng ta cần ở image cho board LicheePi Nano, chúng ta save file local.conf và rebuild yocto với lệnh sau.

```shell
user# bitbake core-image-minimal
```



