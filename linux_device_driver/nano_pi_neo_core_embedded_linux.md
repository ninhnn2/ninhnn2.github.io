---
sort: 2
---

# NANOPI NEO CORE - EMBEDDED LINUX

### 1. Nên chọn board máy tính nhúng nào để bắt đầu học lập trình nhúng Linux

Chúng ta nên chọn các loại board mà có nhiều tài liệu và example để học tập, nhất là datasheet phải đầy đủ
thông tin về phần cứng. Có hai board các bạn có thể dùng dưới đây

- BeagleBone Black: board này quá kinh điển rồi, nhiều tài liệu, chip xịn của TI, nhiều ví dụ cụ thể
- Raspberry Pi    : Datasheet của Raspberry Pi thì hơi nghèo nàn, nhưng đổi lại cộng đồng support lớn
và rất nhiều ví dụ cụ thể để học. Có điều boot process của Raspberry hơi khác người xíu là GPU nó chạy trước rồi mới
chạy CPU @@.

Còn mình có sẳn board NanoPi NEO Core nên mình dùng nó để vọc luôn. NanoPi NEO Core có các ưu điểm và nhược điểm, mình sẽ
liệt kê bên dưới để các bạn tham khảo.

### 2. Ưu điểm

+ Giá khá rẻ khoản 24$ một board
+ Module Nano Pi Neo Core sử dụng chip Allwinner H3 quad core.
+ Hỗ trợ eMMC 8GB.
+ FriendlyElec sản xuất module NanoPi NEO Core được đánh chữ "LTS" để đảm bảo sẽ sản xuất lâu dài dòng module này.
+ Module dạng chân cắm, bạn chỉ cần cắm nguồn cổng micro usb là chạy được.
+ Module có thể được custom để làm sản phẩm Gateway IoT giá rẻ, bạn chỉ việc thiết kế baseboarrd và cắm module lên.
+ Theo ý kiến của mình thì FriendlyElec support kernel/u-boot và rootfs rất tốt.
+ Có hệ thống build rom từ hãng FriendlyElec, tuy đơn giản nhưng dư sài để tự phát triển Gateway IoT.

### 3. Nhược điểm

+ Không có jack ethernet và usb, cần có baseboard mới có thể sử dụng ethernet usb.
+ Dùng làm sản phẩm nhìn hơi thiếu chuyên nghiệp.
+ Dùng làm mass product khá tốn kém không tối ưu chi phí sản xuất.
+ Đường duy nhất để bạn copy file lên board nếu không có baseboard là dùng cổng USB OTG có sẳn trên board.


![this screenshot](/images/nano-pi-neo-core-pinout.png)


### 4. Các resource được sử dụng để dùng với NanoPi NEO Core
Do nhiều khi nhà sản xuất sẽ update vài thứ mới trên repo và khiến bài viết bị sai lệch hoặc cần chỉnh sửa
nên mình sẽ cập nhật các repo riêng để cho mọi người có thể giảm thiểu lỗi không cần thiết nhất.

#### Bản cài đặt rom cho NanoPi Neo Core
```shell
wget https://download1979.mediafire.com/t4561sj2lltgp0EwPBbku3vwzTcrIsJzS-uJyQHlA9IHw-jSjKLVs3sLuDQywPWni15BGzsfd3hGlkBSTR63z8A5yNmu/t3takdwm49bzkik/h3_sd_friendlycore-focal_4.14_armhf_20210618.img.zip
```

#### Toolchain để biên dịch Linux kernel U-boot và application cho NanoPi NEO Core
```shell
wget https://download1085.mediafire.com/n6ua5zi7hqugDjABFbeV9kWJCJLtgM_M4x1qe08suMdK0W7MwEel7qUBSpwPPrU5RQAoCNY_astwAjQ-U9mrapLPuXDv/27ddz8zqgydcuig/arm-cortexa9-linux-gnueabihf-4.9.3-20160512.tar.xz
```

#### U-boot source cho NanoPi NEO Core
```shell
git clone https://github.com/ninhnn2/u-boot.git -b sunxi-v2017.x --depth 1
```


#### Linux kernel source cho NanoPi NEO Core
```shell
git clone https://github.com/ninhnn2/linux.git -b sunxi-4.14.y --depth 1
```

### Kết
Bài này giới thiệu các bạn module NanoPi NEO Core và các resource cần chuẩn bị để bắt đầu quá trình tự học embedded linux system.


