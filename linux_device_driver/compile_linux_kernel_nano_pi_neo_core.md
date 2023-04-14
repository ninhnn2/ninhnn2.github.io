---
sort: 3
---

# COMPILE LINUX KERNEL CHO NANO PI NEO CORE

Trước khi update custom linux kernel cho bất cứ board embedded linux nào thì chúng ta nên
khảo sát và xem bản rom hiện tại được cấu trúc như thế nào. Xác định phiên bản rom hiện tại
dựa trên Debian/Ubuntu/Yocto hay buildroot và sdcard layout nó như thế nào.

### Khảo sát sdcard layout

Dùng gparted để xem thẻ nhớ layout phân vùng

![this screenshot](/images/sdcard-layout-nano-pi-nao-core.png)


Ta sẽ thấy 3 phân vùng được tạo ra trên thẻ nhớ của mình và có 24M không được "xử dụng":
+ boot
+ rootfs
+ userdata


boot: phân vùng này chứa device tree, zImage, boot.src
=> chính nó zImage là linux kernel cho board NanoPi Neo Core
=> "sun8i-h3-nanopi-neo-core.dtb" còn đây là device tree được load at boot.


#### Install toolchain for compiling
```
wget https://download1085.mediafire.com/n6ua5zi7hqugDjABFbeV9kWJCJLtgM_M4x1qe08suMdK0W7MwEel7qUBSpwPPrU5RQAoCNY_astwAjQ-U9mrapLPuXDv/27ddz8zqgydcuig/arm-cortexa9-linux-gnueabihf-4.9.3-20160512.tar.xz

unxz ./arm-cortexa9-linux-gnueabihf-4.9.3-20160512.tar.xz

sudo mkdir -p /opt/FriendlyARM/toolchain

sudo tar -xvf ./arm-cortexa9-linux-gnueabihf-4.9.3-20160512.tar -C /opt/FriendlyARM/toolchain/


```

#### Nano Pi Neo Core Linux Kernel source

```shell
git clone https://github.com/ninhnn2/linux.git -b sunxi-4.14.y --depth 1
```

