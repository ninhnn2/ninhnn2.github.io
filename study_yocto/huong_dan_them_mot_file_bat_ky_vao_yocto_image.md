---
sort: 4
---

# HƯỚNG DẪN THÊM MỘT FILE BẤT KỲ VÀO LICHEEPI NANO YOCTO IMAGE


### 1. Giới thiệu

Khi đúc một bản yocto image cho LicheePi Nano, sẽ có trường hợp chúng ta cần chỉnh sửa hoặc thêm
các file config vào bản image được tạo ra từ yocto để giúp quá trình phát triển được nhanh hơn.
Bài viết này sẽ hướng dẫn mọi người thêm một file config cho tools ppp trên LicheePi Nano.

### 2. Bitbake .bbappend files

Trong Yocto có khái niệm file tên là bbappend, nó giúp chúng ta mở rộng recipe đã có sẳn thay
vì thay thế recipe hiện tại.

Note:
  Khái niệm recipe là các file có định dạng .bb, có thể hiểu nôm na là file công thức tạo phần mềm,
có có chứa các thông tin về link github của một tools nào đó kèm theo cách để configure và compile chúng.




