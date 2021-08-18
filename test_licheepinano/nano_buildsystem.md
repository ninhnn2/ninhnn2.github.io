---
sort: 2
---

# LICHEE PI NANO BUILD SYSTEM

### Bốn thành phần của Embedded Linux

Mọi dự án đều bắt đầu từ việc tìm kiếm, tùy chỉnh và triển khai 4 yếu tố sau: toolchain, bootloader, kernel, root filesystem.

[`Toolchain`](./): Trình biên dịch và các công cụ cần thiết để tạo mã code cho thiết bị target.

[`Bootloader`](./): Chương trình khởi tạo board và load Linux Kernel.

[`Kernel`](./): Là trái tim của hệ thống, quản lý tài nguyên hệ thống và giao tiếp với phần cứng.

[`Root filesystem`](./): Chứa các thư viện và chương trình được chạy sau khi kernel đã hoàn thành quá trình khởi tạo.

Tất nhiên, còn có một yếu tố thứ năm, không được đề cập ở đây. Đó là tập hợp các chương trình dành riêng cho ứng dụng nhúng của bạn giúp thiết bị làm bất cứ điều gì mà nó phải làm, có thể là cân tự động, thu thập dữ liệu cảm biến, điều khiển robot, điều khiển máy bay không người lái.
Trên đây là các khái niệm cơ bản nhất cho mỗi embeded linux project, các bài viết chuyên sâu về từng yếu tố sẽ được cập nhật vào các bài sau. Ở bài viết này chúng ta tập trung vào việc dùng build system để tạo một bản rom chạy trên board Lichee Pi Nano.

### Get source Lichee Pi Nano build system

```shell
git clone https://github.com/ninhnn2/licheepi_nano_sdk.git

cd licheepi_nano_sdk/

sudo ./build.sh pull_all

sudo ./build.sh nano_tf
```



