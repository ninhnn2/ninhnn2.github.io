---
sort: 2
---

# NANO PI NEO CORE LINUX DEVICE DRIVER

### Nên chọn board máy tính nhúng nào để bắt đầu học lập trình nhúng Linux

Chúng ta nên chọn các loại board mà có nhiều tài liệu để học tập, nhất là datasheet phải đầy đủ
thông tin về phần cứng như các board dưới đây:

- BeagleBone Black: board này quá kinh điển rồi, nhiều tài liệu, chip xịn của TI, nhiều ví dụ cụ thể
- Raspberry Pi    : Datasheet của Raspberry Pi thì hơi nghèo nàn, nhưng đổi lại cộng đồng support lớn
và rất nhiều ví dụ cụ thể để học.

Còn mình thì do mình có sẳn board Nano Pi Neo Core nên mình dùng nó để học lập trình luôn.

Kèm theo đó Nano Pi Neo Core có các ưu điểm và nhược điểm mà mọi người có thể quan tâm:

#### Ưu điểm

+ Giá khá rẻ khoản 24$ một board
+ Module Nano Pi Neo Core sử dụng chip Allwinner H3 quad core.
+ Hỗ trợ eMMC 8GB.
+ FriendlyElec sản xuất module Nano Pi Neo Core được đánh chữ "LTS" để đảm bảo sẽ sản xuất lâu dài dòng module này.
+ Module dạng chân cắm, bạn chỉ cần cắm nguồn cổng micro usb là chạy được.
+ Module có thể được custom để làm sản phẩm Gateway IoT giá rẻ, bạn chỉ việc thiết kế baseboarrd và cắm module lên.
+ Theo ý kiến của mình thì FriendlyElec support kernel/u-boot và rootfs rất tốt.
+ Có hệ thống build rom từ hãng FriendlyElec, tuy đơn giản nhưng dư sài để tự phát triển Gateway IoT.

#### Nhược điểm

+ Không có jack ethernet và usb sẵn, cần có baseboard mới có thể sử dụng ethernet.
+ Dùng làm sản phẩm nhìn hơi thiếu chuyên nghiệp.
+ Dùng làm mass product khá tốn kém không tối ưu chi phí sản xuất.
+ Đường duy nhất để bạn copy file lên board nếu không có baseboard là dùng cổng USB OTG có sẳn trên board.


![this screenshot](/images/nano-pi-neo-core-pinout.png)


### Các resource được sử dụng để dùng với NanoPi Neo Core
Do nhiều khi nhà sản xuất sẽ update vài thứ mới trên repo và khiến bài viết bị sai lệch hoặc cần chỉnh sửa
nên mình sẽ cậ nhật các repo riêng để cho mọi người có thể giảm thiểu lỗi không cần thiết nhất.

#### Bản cài đặt rom cho NanoPi Neo Core
```shell
wget https://mega.nz/file/1mQCjYiY#8N8O_pnkttY5xUtTb_5ktZo_WfqhptVAu6eWvzAuH-I
```

#### Toolchain để biên dịch Linux kernel U-boot và application cho NanoPi Neo Core
```shell
wget https://mega.nz/file/Qm41iIwI#W5OfHqUd4RL8BA-GFiztY0DXbBujFDyTtm7mJK3X1es
```

#### U-boot source cho NanoPi Neo Core
```shell
git clone https://github.com/ninhnn2/u-boot.git -b sunxi-v2017.x --depth 1
```


#### Linux kernel source cho NanoPi Neo Core
```shell
git clone https://github.com/ninhnn2/linux.git -b sunxi-4.14.y --depth 1
```

### Kết
Bài này giới thiệu các bạn module NanoPi Neo Core và các resource cần chuẩn bị để bắt đầu quá trình tự học embedded linux system.


