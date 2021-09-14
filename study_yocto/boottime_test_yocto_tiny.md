---
sort: 2
---

# TEST BOOT TIME YOCTO-TINY TRÊN BOARD LICHEEPI NANO

#### 1. Vì sao cần quan tâm đến boottime của hệ hống Linux

Một số ứng dụng có các yêu cầu cụ thể về thời gian khởi động của hệ thống. Thường thì hệ thống không cần phải sẵn sàng ngay lập tức cho tất cả các tác vụ của nó, nhưng nó phải sẵn sàng cho một số tác vụ quan trọng (ví dụ: nhận lệnh qua Ethernet hoặc hiển thị giao diện người dùng).


#### 2. Video test bản image được build với Yocto tiny, buysbox, musl (c library)

Ở đây mình sử dụng tools grabserial để đo thời gian boottime của board LicheePi Nano. Như trên video thì board LicheePi Nano mất khoản gần 14s để boot vào màn hình đăng nhập, thời gian cũng khá là dài. Ở các bài viết sau mình sẽ test các bước để giảm thời gian boottime xuống nhất có thể. Qua đó các bạn có thể thử áp dụng với project của chính mình.

<iframe width="560" height="315" src="https://www.youtube.com/embed/WwwpbGi_7Vg" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>

#### 3. Cài đặt grabserial
```shell
user# sudo apt-get install grabserial
```

#### 4. Cách sử dụng grabserial

Grabserial sẽ sử dụng log từ cổng console của board LicheePi Nano để tính thời gian bootime. Nên để test, đầu tiên các bạn cắm console board LicheePi Nano vào máy tính rồi chạy lệnh dưới đây.

```shell
user# grabserial -d /dev/ttyUSB0 -t
```



