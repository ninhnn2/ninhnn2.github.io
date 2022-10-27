---
sort: 4
---

# CHẠY ỨNG DỤNG LÚC KHỞI DỘNG VỚI SYSTEMD

Trong quá trình phát triển các ứng dụng trên Linux hoặc Gateway IoT, chúng ta thường sẽ gặp trường hợp
cần chạy ứng dụng lúc khởi động.
Thông thường chúng ta sẽ sử dụng các tools như crontab, nhưng nhược điểm của nó là phải chờ ít nhất 
1 phút sau khi đăng nhập. Vì thế, trong bài viết ngày mình sẽ hướng dẫn các bạn sử dụng systemd để chạy
ứng dụng lúc khởi động với ưu điểm là nhanh và dễ quản lý bởi hệ thống systemd service của Linux.

## Deploy oneshot systemd service

### Lấy source
- git clone https://github.com/ninhnn2/systemd_service_start_at_boot.git

Trong repo này chứ các file sau:
```shell
├── deploy.sh
├── foo.service
├── README.md
├── setup-foo.sh
└── teardown-foo.sh
```
foo.service
- Chọn type cho systemd là oneshot
- Khi service được chạy sẽ thực thi lệnh chạy script "setup-foo.sh", chúng ta có thể implement
các lệnh cần thực thi trong script này hay chạy một ứng dụng nào đó.

```shell
[Unit]
Description=Setup foo
#After=network.target

[Service]
Type=oneshot
ExecStart=/opt/foo/setup-foo.sh
RemainAfterExit=true
ExecStop=/opt/foo/teardown-foo.sh
StandardOutput=journal

[Install]
WantedBy=multi-user.target
```

### Install systemd service

Đi tới thư mục source
```shell
cd systemd_service_start_at_boot/
```

Cấp quyền thực thi cho script
```shell
sudo chmod +x ./ deploy.sh
```

Chạy script deploy để install systemd service vào hệ thống
```shell
sudo ./deploy.sh
```




