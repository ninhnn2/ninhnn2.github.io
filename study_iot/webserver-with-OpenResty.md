---
sort: 3
---

# XÂY DỰNG WEB SERVER CHO GATEWAY


OpenResty là một máy chủ web mở rộng Nginx bằng cách gói nó với nhiều mô-đun Nginx hữu ích và thư viện Lua. OpenResty vượt trội trong việc mở rộng
các ứng dụng và dịch vụ web. Ví dụ: một mô-đun mà nó bao gồm cho phép bạn viết mã Lua sẽ thực thi trực tiếp trong Nginx worker, cho phép các ứng 
dụng chạy với hiệu suất cao.


Trong hướng dẫn này, bạn sẽ cài đặt OpenResty từ source code; các gói ứng dụng được tạo sẵn cho một số bản phân phối linux có thể đã lỗi thời.
Bạn cũng sẽ khám phá một số ứng dụng mẫu đơn giản với các tính năng độc đáo của OpenResty.


Điều kiện sử dụng

Để làm theo hướng dẫn này, bạn sẽ cần:

Một máy tính dùng Ubuntu 20 hoặc một board máy tính nhúng sử dụng phiên bản Linux tương đương với Ubuntu 20.

Lưu ý: Không nên cài đặt Nginx. Nginx đã được tích hợp sẳn trong OpenResty, nếu bạn tự cài sẽ dễ gây xung đột.

## 1. Tải source code OpenResty

```shell

- wget https://openresty.org/download/openresty-1.21.4.1.tar.gz

- tar -xvf openresty-1.21.4.1.tar.gz -C /opt

- cd /opt/openresty-1.21.4.1

- ./configure --with-cc-opt="-I/usr/include/openssl -I/usr/include" --with-ld-opt="-L/usr/include/openssl -L/usr/include" -j8 --prefix=/opt/openresty-1.21.4.1 --with-pcre-jit –with-ipv6

- make -j8

- sudo mke install


```


