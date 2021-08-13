---
sort: 1
---

# Licheepi Nano


### Giới thiệu

Licheepi Nano là một bo mạch phát triển sử dụng linux có kích thước bằng thẻ SD với nhân là bộ vi xử lý ARM9 Allwinner F1C100s.

![image](https://user-images.githubusercontent.com/86546911/129333579-babb44fe-cbc0-4816-8a2a-40249187a8e3.png)


### Thông số kỹ thuật chính

- Chip xử lý SoC- Allwinner F1C100s ARM926EJS tốc độ xung nhịp lên tới 900MHz.
- RAM – 32MB DDR tích hợp.
- Bộ nhớ – Micro SD card, hoặc 16M SPI flash ( không hàn theo kit).
- Hiển thị: 40-pin RGB LCD FPC, hỗ trợ độ phân giải 272×480, 480×800, 1024×600 hoặc tùy chỉnh, cảm ứng điện dung hoặc điện trở.
- Giải mã video – H.264 / MPEG 720p.
- Dòng tiêu thụ – 54mA (chế độ chờ) với Linux OS, 250mA cho màn hình hiển thị.
- Dải nhiệt độ – Bảo quản: -40~125°C; Hoạt động: -20 to 70°C.


### Một số ứng dụng cụ thể với Licheepi Nano
- Các ứng dụng IoT sử dụng nhiều ngoại vi và giao thức truyền thông phức tạp trên cùng một project (mqtt, snmp, http…).
- Các ứng dụng giao diện tương tác giữa người và máy tính cần đẹp và logic phức tạp.
- Các ứng dụng yêu cầu phải chạy nhiều tính năng mà MCU không thể thực hiện.
- Các ứng dụng cần source mã nguồn mở của Linux để giảm thời gian phát triển sản phẩm.
- Làm máy nghe nhạc với nhiều tính năng và cân bằng giữa kích thước, hiệu xuất và dễ sử dụng.
- Dành cho người mới, kỹ sư phần mềm, kỹ sư phần cứng custom phục vụ cho việc học tập và nghiên cứu.

### Console serial trên Licheepi nano

| Licheepi Nano | Serial   |
| ------------- | -------- |
|      E0       |   RX     |
|      E1       |   TX     |

### Cài hệ điều hành cho bo mạch Licheepi Nano


Licheepi Nano có hỗ trợ chạy hệ điều hành trên thẻ nhớ và norflash (8MB, 16MB, 32MB, ...), để dễ tiếp cận cho các bạn mới làm quen thì chúng ta sẽ chạy bo mạch bằng thẻ nhớ.

#### 1. Thiết bị cần chuẩn bị.
  - Một đầu đọc thẻ nhớ USB.
  - Thẻ nhớ micro sdcard có dung lượng 2GB trở lên.
  - Một máy tính cài hệ điều hành Ubuntu.


#### 2. Download bản rom cho Licheepi Nano
- [`Licheepi Nano rom link`](https://mega.nz/file/Myp20YxZ#7GH6VL6gQFb6ywQPv-gALdYCResSTUQDG2RmtdAWigw)


#### 3. Format thẻ nhớ với gparted
- Install gparted
```shell
sudo apt-get install gparted
```
- Run gparted
```shell
sudo gparted
```
![image](https://user-images.githubusercontent.com/86546911/129354373-c5bae32d-75bb-44bc-a98f-0c3bd1828fe2.png)

- Chọn ổ đĩa thẻ nhớ “/dev/sdb” có bộ nhớ 16GB.
- Chúng ta cần unmount các phân vùng của thẻ nhớ bằng cách nhấp phải tại phân vùng và chọn unmount.
- Tiếp theo xóa hết tất cả phân vùng và tạo lại với 1 phân vùng duy nhất với định dạng ext4, thao tác này sẽ đảm bảo không có lỗi vặt khi flash rom vào thẻ nhớ.


![image](https://user-images.githubusercontent.com/86546911/129354395-a90aa3a3-c8e6-4462-b6d9-7576c9a434ae.png)

- Sau khi format thẻ nhớ xong, chúng ta giữ nguyên và tiến hành flash rom vào thẻ nhớ bằng dd tool.

```shell
       sudo dd bs=4M if=lichee-nano-normal-size .img of=/dev/sdb conv=fsync
```

- Flash xong chúng ta cắm thẻ vào Licheepi Nano và xem kết quả.

