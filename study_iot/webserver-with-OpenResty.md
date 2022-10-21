---
sort: 3
---

# XÂY DỰNG WEB SERVER CHO GATEWAY


OpenResty là một máy chủ web mở rộng Nginx bằng cách gói nó với nhiều mô-đun Nginx hữu ích và thư viện Lua. OpenResty vượt trội trong việc mở rộng
các ứng dụng và dịch vụ web. Ví dụ: một mô-đun mà nó bao gồm cho phép bạn viết mã Lua sẽ thực thi trực tiếp trong Nginx worker, cho phép các ứng 
dụng chạy với hiệu suất cao.


Trong hướng dẫn này, bạn sẽ cài đặt OpenResty từ source code; các gói ứng dụng được tạo sẵn cho một số bản phân phối linux có thể đã lỗi thời.
Bạn cũng sẽ khám phá một số ứng dụng mẫu đơn giản với các tính năng độc đáo của OpenResty.

#### Để làm theo hướng dẫn này, bạn sẽ cần:

Một máy tính dùng Ubuntu 20 hoặc một board máy tính nhúng sử dụng phiên bản Linux tương đương với Ubuntu 20.

Lưu ý: Không nên cài đặt Nginx. Nginx đã được tích hợp sẳn trong OpenResty, nếu bạn tự cài sẽ dễ gây xung đột.

## 1. Cài đặt OpenResty trên Linux distro

Lấy source code
```shell
wget https://openresty.org/download/openresty-1.21.4.1.tar.gz
```

Giải nén source vào /opt
```shell
sudo tar -xvf openresty-1.21.4.1.tar.gz -C /opt
```

Đi đến thư mục source openresty
```shell
cd /opt/openresty-1.21.4.1
```

Config openresty để biên dịch
```shell
./configure --with-cc-opt="-I/usr/include/openssl -I/usr/include" --with-ld-opt="-L/usr/include/openssl -L/usr/include" -j8 --prefix=/opt/openresty-1.21.4.1 --with-pcre-jit --with-ipv6
```

Biên dịch source code
```shell
make -j8
```
Install tools và thư viện đã được biên dịch
```shell
sudo make install
```

## 2. Tạo một ứng dụng đơn giản để thử nghiệm OpenResty
Tạo các thư mục chứa application
```shell
mkdir ~/app
cd ~/app
mkdir logs/ conf/
```

### Tạo file cấu hình Nginx

Nội dung file ~/app/conf/nginx.conf
```shell
worker_processes  1;
error_log logs/error.log;
events {
    worker_connections 1024;
}
http {
    server {
        listen 8080;
        location / {
            default_type text/html;
            content_by_lua '
                ngx.say("<p>hello, world</p>")
            ';
        }
    }
}
```

### Chạy sample web app
Để chạy sample web app chúng ta cần add đường dẫn file binary nginx đã được biên dịch trong OpenResty

```shell
PATH=/opt/openresty-1.21.4.1/nginx/sbin:$PATH
export PATH
nginx -p `pwd`/ -c ~/web/conf/nginx.conf
```
#### Test chạy web app với curl
```shell
curl http://localhost:8080/
```
Kết quả output phải là:
```shell
<p>hello, world</p>
```

## 3. Lapis

### Lapis là gì ?
Lapis là một framework để xây dựng các ứng dụng web sử dụng MoonScript hoặc Lua chạy bên trong một 
phiên bản tùy chỉnh của Nginx có tên là OpenResty.

### Cài đặt Lapis
```shell
apt-get install luarocks
luarocks install moonscript
luarocks install lapis
luarocks install --server=http://rocks.moonscript.org/manifests/leafo lapis
```

### Tạo một sample để test chạy
```shell
mkdir lapistest
cd lapistest
lapis new --lua
lapis server
```

### Lapis hỗ trợ tạo một sample ứng dụng tự động
```shell
mkdir lapistest
cd lapistest
lapis new --lua
lapis server
```

### Test application với curl
```shell
curl http://localhost:8080
```

Bạn sẽ thấy output như sau
```shell
Welcome to Lapis 1.4.3
```























