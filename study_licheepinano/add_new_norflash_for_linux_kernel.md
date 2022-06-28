---
sort: 4
---

# THÊM NORFLASH MỚI VÀO LINUX KERNEL LICHEEPI NANO

### Mục đích

Mình có gặp một trường hợp là cần dump 1 firmware camera dùng norflash, khi dùng tools
CH341A + flashrom thì vẫn không nhận biết được norflash đó. Thế mình mới nảy ra ý tưởng
là khò con norflash đó và hàn lên board LicheePi Nano.

Về cơ bản thì khi boot board Licheepi Nano lên thì nó phát hiện được norflash và các ID của
norflash nhưng không biết các thông số như kích thước, erase size, block size là bao nhiêu.

Chỉ có log kernel phun ra như sau

```shell
spi-nor spi0.0: unrecognized JEDEC id bytes: 57 88 99 20
```

Trong trường hợp này chúng ta có 2 bước cần làm như sau:

#### 1. Download source linux kernel hổ trợ LicheeP Nano.

#### 2. Tìm datasheet của norflash cần đọc để biết các thông số cần đọc.

#### 3. Thêm JEDEC id vào driver norflash trong Linux kernel source.




