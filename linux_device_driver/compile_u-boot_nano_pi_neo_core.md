---
sort: 5
---

# NANOPI NEO CORE U-BOOT COMPILE

Trước khi update custom linux kernel cho bất cứ board embedded linux nào thì chúng ta nên
khảo sát và xem bản rom hiện tại được cấu trúc như thế nào. Xác định phiên bản rom hiện tại
dựa trên Debian/Ubuntu/Yocto hay buildroot và sdcard layout nó như thế nào.


### Partition boot trên sdcard

boot: phân vùng này chứa device tree, zImage, boot.src và không thấy u-boot binary nằm đâu cả.

Để biết u-boot ở đâu thì các bạn xem link này: https://linux-sunxi.org/Bootable_SD_card

Sau khi đọc bài viết thì các bạn chắc đã hình dung được. Hầu hết các dòng chip của Allwinner H3/5/6 đều ghi u-boot binary vào section của sdcard
luôn.

u-boot cho Allwinner thường build ra file binary có tên là "u-boot-sunxi-with-spl.bin" và được ghi đè trên sector của thẻ nhớ bằng lệnh sau:


Clear vùng nhớ có kích thước 1MB trên thẻ nhớ
```shell
dd if=/dev/zero of=${card} bs=1M count=1
```

8KB đầu là của partition table nên chúng ta ghi u-boot từ vị trí sau 8KB trở đi thôi
```shell
dd if=/dev/zero of=${card} bs=1k count=1023 seek=1
```
