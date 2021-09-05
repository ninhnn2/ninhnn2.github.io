---
sort: 2
---

# TỰ TẠO LINUX DISTROS CHO LICHEEPI NANO VỚI BUILDROOT

### Bốn thành phần của Embedded Linux

Mọi dự án đều bắt đầu từ việc tìm kiếm, tùy chỉnh và triển khai 4 yếu tố sau: toolchain, bootloader, kernel, root filesystem.

[`Toolchain`](./): Trình biên dịch và các công cụ cần thiết để tạo mã code cho thiết bị target.

[`Bootloader`](./): Chương trình khởi tạo board và load Linux Kernel.

[`Kernel`](./): Là trái tim của hệ thống, quản lý tài nguyên hệ thống và giao tiếp với phần cứng.

[`Root filesystem`](./): Chứa các thư viện và chương trình được chạy sau khi kernel đã hoàn thành quá trình khởi tạo.

Tất nhiên, còn có một yếu tố thứ năm, không được đề cập ở đây. Đó là tập hợp các chương trình dành riêng cho ứng dụng nhúng của bạn giúp thiết bị làm bất cứ điều gì mà nó phải làm, có thể là cân tự động, thu thập dữ liệu cảm biến, điều khiển robot, điều khiển máy bay không người lái.
Trên đây là các khái niệm cơ bản nhất cho mỗi embeded linux project, các bài viết chuyên sâu về từng yếu tố sẽ được cập nhật vào các bài sau. Ở bài viết này chúng ta tập trung vào việc dùng build system để tạo một bản rom chạy trên board LicheePi Nano.

### LicheePi Nano Build System

#### Bao gồm các shell script và config cho U-boot, Linux Kernel và Buildroot.

- U-boot: Bootloader hổ trợ LicheePi Nano

- Linux kernel: Nhân Linux hổ trợ cpu Allwinner F1C100s trên board LicheePi Nano, ở đây mình dùng version 5.4.70.

- Buildroot: Công cụ tạo ra root filesystem, thêm/bớt các ứng dụng tùy theo yêu cầu của project.

#### Tiến hành build rom cho LicheePi Nano

```shell
git clone https://github.com/ninhnn2/licheepi_nano_sdk.git

cd licheepi_nano_sdk/

# Download toolchain, u-boot, linux kernel, buildroot
sudo ./build.sh pull_all

# Bắt đầu quá trình config và tạo ra bản rom chạy trên sdcard cho Lichee Pi Nano
sudo ./build.sh nano_tf
```

Sau khi quá trình build hoàn tất, rom sẽ được tạo ra tại output/image/lichee-nano-normal-size.img. Chúng ta chỉ việc dùng tools dd để flash rom vào sdcard.

```shell
sudo dd bs=4M if=output/image/lichee-nano-normal-size.img of=/dev/sdx conv=fsync
```

User/Pasword: root/000

