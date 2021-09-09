---
sort: 2
---

# HƯỚNG DẪN BUILD YOCTO CHO BOARD LICHEEPI NANO

```shell
user# cd ~
user# mkdir yocto
user# cd yocto
user# git clone -b zeus git://git.yoctoproject.org/poky.git
user# cd poky
user# git clone -b zeus https://github.com/openembedded/meta-openembedded.git
user# git clone -b zeus https://github.com/meta-qt5/meta-qt5.git
user# git clone -b zeus https://github.com/ninhnn2/meta-f1c100s.git
user# source oe-init-build-env build-f1c100s
user# cp ../meta-f1c100s/conf/example/zeus/local.conf ./conf/
user# cp ../meta-f1c100s/conf/example/zeus/bblayers.conf ./conf/
user# bitbake qt5-image
```
