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

Các bạn để ý thì không có u-boot ở đâu ha ?????

Để biết u-boot ở đâu thì các bạn xem link này: https://linux-sunxi.org/Bootable_SD_card
- Hầu hết các dòng chip của Allwinner Hxxxx đều ghi u-boot binary vào section của sdcard luôn
nên các bạn mới thấy 24MB không được sử dụng tính từ sector 0 của thẻ nhớ.
- u-boot cho Allwinner thường build ra file binary có tên là "u-boot-sunxi-with-spl.bin" và được ghi đè trên sector của thẻ nhớ bằng lệnh sau:


Clear vùng nhớ có kích thước 1MB trên thẻ nhớ
```shell
dd if=/dev/zero of=${card} bs=1M count=1
```

8KB đầu là của partition table nên chúng ta ghi u-boot từ vị trí sau 8KB trở đi thôi
```shell
dd if=/dev/zero of=${card} bs=1k count=1023 seek=1
```


#### Nano Pi Neo Core Linux Kernel source
```shell
git clone https://github.com/ninhnn2/linux.git -b sunxi-4.14.y --depth 1
```
