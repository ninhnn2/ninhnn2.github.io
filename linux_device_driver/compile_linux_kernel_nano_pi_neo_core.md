---
sort: 3
---

# NANOPI NEO CORE LINUX KERNEL COMPILE

### 1. Giới thiệu
Trước khi update custom linux kernel cho bất cứ board embedded linux nào thì chúng ta nên
khảo sát và xem bản rom hiện tại được cấu trúc như thế nào. Xác định phiên bản rom hiện tại
dựa trên Debian/Ubuntu/Yocto hay buildroot và sdcard layout nó như thế nào.

### 2. Khảo sát sdcard layout NanoPi NEO Core

Dùng gparted để xem thẻ nhớ layout phân vùng

![this screenshot](/images/sdcard-layout-nano-pi-nao-core.png)


Ta sẽ thấy 3 phân vùng được tạo ra trên thẻ nhớ của mình và có 24M không được "xử dụng":
+ boot
+ rootfs
+ userdata


<strong>boot</strong>: phân vùng này chứa device tree, zImage, boot.src
=> chính nó zImage là linux kernel cho board NanoPi NEO Core
=> "sun8i-h3-nanopi-neo-core.dtb" còn đây là device tree được load at boot.

<strong>rootfs</strong>: phân vùng này chứa rootfs, các file thư viện, file config...

<strong>userdata</strong>: thường có phân vùng này xuất hiện thì khả năng bản rom này được custom
nhằm bảo vệ hệ thống rootfs chính, khi chúng ta thao tác tạo file chỉnh sữa gì đấy thì thật ra chúng ta đang tạo và chỉnh sữa các file trong vùng "userdata". Ngó trong phân vùng này thấy folder
root và work.


### 3. Install toolchain for compiling
```
wget https://download1085.mediafire.com/n6ua5zi7hqugDjABFbeV9kWJCJLtgM_M4x1qe08suMdK0W7MwEel7qUBSpwPPrU5RQAoCNY_astwAjQ-U9mrapLPuXDv/27ddz8zqgydcuig/arm-cortexa9-linux-gnueabihf-4.9.3-20160512.tar.xz

unxz ./arm-cortexa9-linux-gnueabihf-4.9.3-20160512.tar.xz

sudo mkdir -p /opt/FriendlyARM/toolchain

sudo tar -xvf ./arm-cortexa9-linux-gnueabihf-4.9.3-20160512.tar -C /opt/FriendlyARM/toolchain/
```

### 4. NanoPi NEO Core Linux Kernel source

```shell
git clone https://github.com/ninhnn2/linux.git -b sunxi-4.14.y --depth 1

cd ./linux/
touch .scmversion
make ARCH=arm CROSS_COMPILE=/opt/FriendlyARM/toolchain/4.9.3/bin/arm-linux- sunxi_defconfig
make ARCH=arm CROSS_COMPILE=/opt/FriendlyARM/toolchain/4.9.3/bin/arm-linux- zImage dtbs
```

### 5. Install new kernel to NanoPi NEO Core
- File linux kernel zImage (path:linux/arch/arm/boot/zImage)
- File device tree (path:linux/arch/arm/boot/dts/sun8i-h3-nanopi-neo-core.dtb)

Chúng ta chỉ việc copy 2 file này và replace vào phân vùng "boot" của sdcard và restart lại hệ thống.
