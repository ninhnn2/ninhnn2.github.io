---
sort: 4
---

# LINUX DEVICE DRIVER

### Giới Thiệu Linux

Linux là một hệ điều hành (OS) mã nguồn mở miễn phí dựa trên UNIX được tạo ra vào năm 1991 bởi Linus Torvalds.
Người dùng có thể sửa đổi và tạo các biến thể của mã nguồn, được gọi là bản phân phối linux, được dùng cho máy tính
và các thiết bị khác.

### Kiến trúc của Linux

Linux chủ yếu được chia thành User Space & Kernel Space. Hai thành phần này tương tác thông qua System Call - là giao diện
được xác định trước và hoàn thiện cho các ứng dụng Nhân Linux dành cho không gian người dùng. Hình ảnh dưới đây sẽ cung cấp
cho bạn các thông tin cơ bản.

![kernel-space-vs-user-space](https://user-images.githubusercontent.com/86546911/188902721-686bd2f9-8055-42d3-86bf-a837a25fa670.png)

#### Kernal space

Kernal space là nơi hạt nhân (tức là lõi của hệ điều hành) thực thi (tức là chạy) và cung cấp các dịch vụ của nó.

#### User space

User space là nơi các ứng dụng người dùng được thực thi.

### Linux Kernel Modules

Kernel modules là các đoạn mã có thể được loaded and unloaded vào kernel theo yêu cầu. Chúng mở rộng chức năng của kernel mà không cần
khởi động lại hệ thống.

Mã tùy chỉnh có thể được thêm vào hạt nhân Linux thông qua hai phương pháp.

- Cách cơ bản là thêm code vào mã nguồn kernel và biên dịch lại kernel.

- Một cách hiệu quả hơn để làm điều này là thêm code vào kernel trong khi nó đang chạy. Quá trình này được gọi là load modules,
trong đó modules tham chiếu đến code mà chúng ta muốn thêm vào hạt nhân.





