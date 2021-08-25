---
sort: 1
---

# HƯỚNG DẪN HỌC YOCTO TỪ META-V3S

### 1. Giới thiệu

Yocto chỉ đơn giản là công cụ giúp build các thư viện, tools, linux kernel, u-boot rồi đóng gói thành một bản rom linux yocto. Tài liệu thì rất nhiều các bạn có thể đọc trên trang chủ yoctoproject.org.

### 2. Tạo board support package layer cho một embeded linux board.

Khí mới biết đến Yocto thì mình thường chỉ xem hướng dẫn của người khác trên mạng để build Yocto cho raspberry và beanglebone black. Mình tìm đến Yocto vì khi ấy đang học viết ứng dụng có giao diện cho board beglebone black mà không tài nào biên dịch được Qt Creator version 5 cho beglebone black. Thấy trên mạng có hướng dẫn build yocto có sẳn Qt5 nên đã mày mò làm theo.

#### Thường trên mạng sẽ có các hướng dẫn build yocto cho một board nào đó như sau:

```shell
user# cd ~
user# mkdir yocto
user# cd yocto
user# git clone -b zeus git://git.yoctoproject.org/poky.git
user# cd poky
user# git clone -b zeus https://github.com/openembedded/meta-openembedded.git
user# git clone -b zeus https://github.com/meta-qt5/meta-qt5.git
user# git clone -b zeus https://github.com/ninhnn2/meta-v3s.git
user# source oe-init-build-env build-v3s
user# cp ../meta-v3s/conf/example/zeus/local.conf ./conf/
user# cp ../meta-v3s/conf/example/zeus/bblayers.conf ./conf/
user# bitbake qt5-image
```

Chỉ đơn giản vậy thôi bạn đã có thể build yocto cho board licheepi zero hoặc board linux nào đó dùng cpu Allwinner V3S.

Dưới đây mình xin giải thích thêm về các câu lệnh bên trên nhé

#### user# git clone -b zeus git://git.yoctoproject.org/poky.git

- Đây là repo công cụ chính của Yocto, nó bao gồm tools bitbake dùng để chạy các file có đuôi .bb trong source các source meta-xxx nào đó và các .bb file dùng để tạo ra các tools và config cần thiết nhất để chạy được một bản minimal linux yocto.


#### user# git clone -b zeus https://github.com/openembedded/meta-openembedded.git

- Một layer meta chứa rất nhiều tools, thư viện cần thiết cho linux, nó hầu như có tất cả những thứ chúng ta cần.

#### user# git clone -b zeus https://github.com/meta-qt5/meta-qt5.git

- Chính nó, một layer mà mình cần khi còn là sinh viên. Layer này giúp chúng ta biên dịch Qt5 và install nó vào rom linux yocto.

#### user# source oe-init-build-env build-v3s

- Đơn giản là lệnh chạy để khởi tạo các biến môi trường cho quá trình build yocto. Nó sẽ tạo ra một thư mục tên là build-v3s, trong thư mục  build-v3s lại có thư mục conf. Trong thư mục conf có 2 file quan trọng nhất khi chúng ta build yocto đó là “local.conf” và bblayers.conf.

- local.conf: File này giúp chúng ta define machine (board) nào mà mình muốn sử dụng. Thêm các tools, package, lib, init system nào mình muốn thêm vào bản rom linux yocto.

- bblayers.conf: File này để khai báo đường dẫn layer nào mình muốn sử dụng. Giả sử mình muốn dùng meta-python thì mình phải add đường dẫn meta-python vào file này.

#### user# git clone -b zeus https://github.com/ninhnn2/meta-v3s.git

- Layer này là loại layer board support package, nó định nghĩa riêng cho một board hoặc nhiều board linux (có thể cùng cpu hoặc khác cpu). Ở layer meta-v3s này, mình chỉ hổ board linux dùng chip Allwinner V3S.

- Trong một layer board support package thì quan trọng nhất phải có recipe về linux kernel và u-boot (bootloader) cho cpu mà layer này hổ trợ.

#### user# cp ../meta-v3s/conf/example/zeus/local.conf ./conf/

#### user# cp ../meta-v3s/conf/example/zeus/bblayers.conf ./conf/

- Mình đã chuẩn bị config để biên dịch yocto cho board linux V3S và đã được test build thành công với branch zeus trên ubuntu 20.04 LTS. Nên hai lệnh trên chỉ là copy config có sẳn của mình.

#### user# bitbake qt5-image

- Tiến hành build image “qt5-image” có sẳn Qt 5 để sử dụng cho board V3S.

-  qt5-image: cũng là một bb file nhưng đặc biệt cái là trong đây mình có thể khai báo các tools hay thư viện mình muốn bỏ vào rom yocto linux như file local.conf luôn. Khác nhau thế nào hồi sau sẽ rõ nhé.


