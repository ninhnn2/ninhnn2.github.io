---
sort: 2
---

# HƯỚNG DẪN BUILD YOCTO CHO BOARD LICHEEPI NANO


#### Cài đặt môi trường development cho Ubuntu 20.04
Sau đây là các list package mà mình thường install trong quá trình development

```shell
sudo apt-get install git cmake vim autoconf -y
sudo apt-get install python-minimal -y
sudo apt-get install gawk wget git-core diffstat unzip texinfo gcc-multilib build-essential chrpath socat libsdl1.2-dev xterm -y
sudo apt-get install libcurl-ocaml-dev libmosquitto-dev libmosquittopp-dev libusb-1.0-0-dev libssl-ocaml-dev -y
sudo apt-get install bison flex swig libtool curl -y
sudo apt-get install uuid-dev libacl1-dev liblzo2-dev libzstd-dev lib32z1 device-tree-compiler minicom -y
sudo apt-get install libncurses5-dev libncursesw5-dev -y
sudo apt-get install cpio python2 python2.7 -y
```


#### Lấy source và tiến hành build yocto cho board LicheePi Nano



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






