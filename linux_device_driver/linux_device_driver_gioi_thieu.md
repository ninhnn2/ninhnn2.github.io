---
sort: 1
---

# LINUX DEVICE DRIVER - GIỚI THIỆU

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

Kernel modules là các đoạn mã có thể được loaded and unloaded vào kernel. Chúng mở rộng chức năng của kernel mà không cần khởi động lại hệ thống.

Custom code có thể được thêm vào kernel linux thông qua hai phương pháp:

- Cách cơ bản là thêm code vào mã nguồn kernel và biên dịch lại kernel.

- Một cách hiệu quả hơn để làm điều này là thêm code vào kernel trong khi nó đang chạy. Quá trình này được gọi là load modules,
trong đó module tham chiếu đến code mà chúng ta muốn thêm vào hạt nhân.

Vì chúng ta đang tải các custom code này lúc runtime và chúng không phải là một phần của official Linux kernel, chúng được gọi là
loadable kernel modules (LKM), khác với “base kernel”. Base Kernel thường nằm trong thư mục /boot và luôn được load khi chúng ta 
khởi động thiết bị, trong khi đó các LKM sẽ được load sau khi base kernel được load. Tuy nhiên, LKM này là một phần rất quan trọng
trong kernel của chúng ta và chúng giao tiếp với base kernel để hoàn thành các chức năng của chúng.

LKM có thể thực hiện nhiều nhiệm vụ khác nhau, nhưng về cơ bản, chúng có ba loại chính:


- Device drivers

- Filesystem drivers

- System calls

### Linux Device drivers

Linux device driver được thiết kế cho một phần cứng cụ thể. Kernel sử dụng chúng để giao tiếp với phần cứng đó mà không
cần biết chi tiết về cách hoạt động của nó.

### Filesystem drivers

Filesystem drivers diễn giải nội dung của hệ thống tệp (thường là nội dung của ổ đĩa) dưới dạng tệp và thư mục, v.v.
Có rất nhiều cách khác nhau để lưu trữ tệp và thư mục, cũng như trên ổ đĩa, trên máy chủ mạng và theo những cách khác.
Đối với mỗi cách, bạn cần một Filesystem drivers. Example: có một filesystem drivers cho loại hệ thống tệp ext2 được sử 
dụng hầu hết trên các ổ đĩa Linux. Có một cho hệ thống tệp MS-DOS và một cho NFS.

### System calls

Các chương trình không gian người dùng sử dụng lời gọi hệ thống để nhận các dịch vụ từ hạt nhân. Ví dụ: có các lệnh gọi
hệ thống để đọc một tệp, để tạo một quy trình mới và để tắt hệ thống. Hầu hết các lệnh gọi hệ thống là không thể thiếu
đối với hệ thống và rất chuẩn, vì vậy luôn được tích hợp vào hạt nhân cơ sở (không có tùy chọn LKM).

Nhưng bạn có thể phát minh ra một lệnh gọi hệ thống của riêng mình và cài đặt nó như một LKM. Hoặc bạn có thể quyết định
rằng bạn không thích cách Linux thực hiện điều gì đó và ghi đè một lệnh gọi hệ thống hiện có bằng một LKM của riêng bạn.

### Ưu điểm của LKM

- Một lợi thế chính mà chúng có là chúng ta không cần phải tiếp tục xây dựng lại hạt nhân mỗi khi chúng ta thêm một 
thiết bị mới hoặc nếu chúng ta nâng cấp một thiết bị cũ. Điều này giúp tiết kiệm thời gian và cũng giúp giữ cho hạt 
nhân cơ sở của chúng ta không bị lỗi.

- Các LKM rất linh hoạt, theo nghĩa là chúng có thể được load và unload chỉ bằng một dòng lệnh. Điều này giúp tiết kiệm
bộ nhớ vì chúng ta chỉ tải LKM khi chúng ta cần chúng.

### Khác biệt giữa Kernel Modules and User Programs

- Kernel module có không gian địa chỉ riêng biệt. Một module chạy trong kernel space. Một ứng dụng chạy trong user space.
- Phần mềm hệ thống được bảo vệ khỏi các user program. Kernel space và user space có không gian địa chỉ bộ nhớ riêng.

- Kernel module có đặc quyền thực thi cao hơn. Code chạy trong kernel space có đặc quyền lớn hơn code chạy trong user space.

- Kernel module không thực thi tuần tự. User program thường thực thi tuần tự và thực hiện một tác vụ duy nhất từ đầu đến cuối.Một kernel module
không thực thi tuần tự. Một kernel module đăng ký để phục vụ các yêu cầu trong tương lai.

- Kernel module sử dụng các tệp tiêu đề khác nhau. Kernel module yêu cầu một tập hợp các tệp tiêu đề khác với các user program yêu cầu.

### Khác biệt giữa Kernel Drivers and Kernel Modules

- Kernel module là một đoạn code đã được biên dịch và có thể được chèn vào kernel lúc runtime bằng các lệnh insmod hoặc modprobe.

- Driver là một đoạn code chạy trong kernel để giao tiếp với một số thiết bị phần cứng. Nó "điều khiển" phần cứng. Hầu hết mọi phần cứng trong
máy tính của bạn đều có một hoặc nhiều driver liên quan.

### Device Driver

Device driver là một dạng ứng dụng phần mềm cụ thể được thiết kế để cho phép tương tác với các thiết bị phần cứng. Nếu không có device driver
được yêu cầu, thiết bị phần cứng tương ứng sẽ không hoạt động.
Device driver thường giao tiếp với phần cứng bằng hệ thống con giao tiếp hoặc bus máy tính mà phần cứng được kết nối. Device driver dành riêng
cho hệ điều hành và phụ thuộc vào phần cứng. Device driver hoạt động như một trình dịch giữa thiết bị phần cứng và các chương trình 
hoặc hệ điều hành sử dụng nó.

### Các loại device driver

Theo cách phân loại truyền thống, có 3 loại device driver:

- Character device
- Block device
- Network device

Trong Linux, mọi thứ đều là file. Linux coi mọi thứ như file ngay cả phần cứng.

#### Character Device

A char file is a hardware file that reads/writes data in character by character fashion. Some classic examples are keyboard, mouse, serial printer. If a user uses a char file for writing data no other user can use the same char file to write data that blocks access to another user. Character files use synchronize Technic to write data. Of you observe char files are used for communication purposes and they can not be mounted.

Character Device là một tệp phần cứng đọc/ghi dữ liệu theo kiểu ký tự. Một số ví dụ điển hình như là bàn phím, chuột, máy in.
Nếu người dùng sử dụng tệp char để ghi dữ liệu thì không có người dùng nào khác có thể sử dụng cùng tệp char đó để ghi dữ liệu.
Các tệp ký tự sử dụng kỹ thuật đồng bộ để ghi dữ liệu. Bạn quan sát thấy các tệp char được sử dụng cho mục đích giao
tiếp và chúng không thể mount.

#### Block Device

Block device là một tệp phần cứng đọc/ghi dữ liệu theo khối thay vì từng ký tự. Loại tệp này rất hữu ích khi chúng ta muốn ghi / đọc dữ liệu hàng loạt.
Tất cả các đĩa của chúng tôi như HDD, USB và CDROM đều là thiết bị khối. Đây là lý do khi chúng tôi định dạng, chúng tôi xem xét kích thước khối.
Việc ghi dữ liệu được thực hiện theo kiểu không đồng bộ và đó là hoạt động sử dụng nhiều CPU. Các tệp thiết bị này được sử dụng để lưu trữ dữ liệu trên phần cứng thực và có thể được gắn kết để chúng tôi có thể truy cập vào dữ liệu chúng tôi đã viết.

#### Network Device

Đối với hệ thống mạng con của Linux, thiết bị mạng là một thực thể gửi và nhận các gói dữ liệu. Đây thường là một thiết bị vật lý như thẻ ethernet.
Mặc dù vậy, một số thiết bị mạng chỉ là phần mềm, chẳng hạn như thiết bị lặp lại được sử dụng để gửi dữ liệu cho chính bạn.

Đây là tất cả những điều cơ bản về linux device driver và Linux. Chúng ta setup ubuntu và Licheepi Nano để phát triển Linux device driver trong hướng dẫn tiếp theo.





