---
sort: 2
---

# LINUX DEVICE DRIVER - NANO PI NEO CORE

### Nên chọn board máy tính nhúng nào để bắt đầu học lập trình nhúng Linux

Chúng ta nên chọn các loại board mà có nhiều tài liệu để học tập, nhất là datasheet phải đầy đủ
thông tin về phần cứng như các board dưới đây:

- BeagleBone Black: board này quá kinh điển rồi, nhiều tài liệu, chip xịn của TI, nhiều ví dụ cụ thể
- Raspberry Pi    : Datasheet của Raspberry Pi thì hơi nghèo nàn, nhưng đổi lại cộng đồng support lớn
và rất nhiều ví dụ cụ thể để học.

Còn mình thì do mình có sẳn board Nano Pi Neo Core nên mình dùng nó để học lập trình luôn.

Kèm theo đó Nano Pi Neo Core có các ưu điểm mà mọi người có thể quan tâm:
+ Module Nano Pi Neo Core sử dụng chip Allwinner H3 bốn core khá mạnh và được thiết kế bởi FriendlyElec.
+ FriendlyElec sản xuất module Nano Pi Neo Core được đánh chữ "LTS" để đảm bảo sẽ sản xuất lâu dài dòng module này.
+ Module dạng chân cắm, bạn chỉ cần cắm nguồn cổng micro usb là chạy được.
+ Module có thể được custom để làm sản phẩm Gateway IoT giá rẻ, bạn chỉ việc thiết kế baseboarrd và cắm module lên.
+ Theo ý kiến của mình thì FriendlyElec support kernel/u-boot và rootfs rất tốt.
+ Có hệ thống build rom từ hãng FriendlyElec, tuy đơn giản nhưng dư sài để tự phát triển Gateway IoT.


Dưới đây là hình ảnh của module

![this screenshot](/images/nanopi-neo-core-lap-trinh-nhung-linux.png)
