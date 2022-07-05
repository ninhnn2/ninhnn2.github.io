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

Trong source chính poky của Yocto đã có sẳn một recipe tên là PPP, có chứa tất cả các công thức để tạo ra
tools PPP trên bản image cho LicheePi Nano. Nhưng hiện tại chúng ta cần thêm một file config tên là rnet.
Vì vậy mình cần sử dụng một file .bbappend file để thêm file rnet vào image yocto.

### 3. Thêm file sử dụng .bbappend

Tạo một cấu trúc thư mục và file như sau trong meta-f1c100s


```shell
├── recipes-connectivity
│   └── ppp
│       ├── files
│       │   └── rnet
│       └── ppp_%.bbappend
```




- Nội dùng file rnet

```js
#imis/internet is the apn for idea connection
connect "/usr/sbin/chat -v -f /etc/chatscripts/gprs -T internet.telekom"

# For SIM7600E use /dev/ttyUSB2 as the communication port
# For SIM800 use /dev/ttySC1 as the communication port
/dev/ttyS1

# Baudrate
115200

# Assumes that your IP address is allocated dynamically by the ISP.
noipdefault

# Try to get the name server addresses from the ISP.
usepeerdns

# Use this connection as the default route to the internet.
defaultroute

# Makes PPPD "dial again" when the connection is lost.
persist

# Do not ask the remote to authenticate.
noauth

# No hardware flow control on the serial link with GSM Modem
nocrtscts

# No modem control lines with GSM Modem
local
```

- Nội dung file ppp_%.bbappend
```js
FILESEXTRAPATHS_prepend := "${THISDIR}/files:"

SRC_URI += "file://rnet"

do_install_append() {
    install -m 0644 ${WORKDIR}/rnet ${D}${sysconfdir}/ppp/peers
}
```


