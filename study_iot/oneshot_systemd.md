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
Nội dung file foo.service
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


- cd systemd_service_start_at_boot/

- sudo chmod 777 ./ deploy.sh

- sudo ./deploy.sh























