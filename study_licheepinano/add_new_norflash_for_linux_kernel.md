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

#### 1. Download source linux kernel hổ trợ LicheePi Nano.

```shell
git clone https://github.com/ninhnn2/linux-5.4.77.git
```

#### 2. Thêm JEDEC id vào driver norflash trong Linux kernel source.

Tại source linux kernel đi tới thư mục

```shell
cd drivers/mtd/spi-nor
```

Ở đây mình biết norflash cần đọc của hãng winbond nên chúng ta sẽ xem file chứa các
thông tin norflash của winbond

```shell
vim winbond.c
```
Ta sẽ thấy các norflash được định nghĩa trong một mảng struct sau

```shell
static const struct flash_info winbond_parts[] = {
	/* Winbond -- w25x "blocks" are 64K, "sectors" are 4KiB */
	{ "w25x05", INFO(0xef3010, 0, 64 * 1024,  1,  SECT_4K) },
	{ "w25x10", INFO(0xef3011, 0, 64 * 1024,  2,  SECT_4K) },
	{ "w25x20", INFO(0xef3012, 0, 64 * 1024,  4,  SECT_4K) },
	{ "w25x40", INFO(0xef3013, 0, 64 * 1024,  8,  SECT_4K) },
	{ "w25x80", INFO(0xef3014, 0, 64 * 1024,  16, SECT_4K) },
	{ "w25x16", INFO(0xef3015, 0, 64 * 1024,  32, SECT_4K) },
	{ "w25q16dw", INFO(0xef6015, 0, 64 * 1024,  32,
			   SECT_4K | SPI_NOR_DUAL_READ | SPI_NOR_QUAD_READ |
			   SPI_NOR_HAS_LOCK | SPI_NOR_HAS_TB) },
	{ "w25x32", INFO(0xef3016, 0, 64 * 1024,  64, SECT_4K) },
	{ "w25q16jv-im/jm", INFO(0xef7015, 0, 64 * 1024,  32,
				 SECT_4K | SPI_NOR_DUAL_READ |
				 SPI_NOR_QUAD_READ | SPI_NOR_HAS_LOCK |
				 SPI_NOR_HAS_TB) },
	{ "w25q20cl", INFO(0xef4012, 0, 64 * 1024,  4, SECT_4K) },
	{ "w25q20bw", INFO(0xef5012, 0, 64 * 1024,  4, SECT_4K) },
	{ "w25q20ew", INFO(0xef6012, 0, 64 * 1024,  4, SECT_4K) },
	{ "w25q32", INFO(0xef4016, 0, 64 * 1024,  64, SECT_4K) },
	{ "w25q32dw", INFO(0xef6016, 0, 64 * 1024,  64,
			   SECT_4K | SPI_NOR_DUAL_READ | SPI_NOR_QUAD_READ |
			   SPI_NOR_HAS_LOCK | SPI_NOR_HAS_TB)
			   OTP_INFO(256, 3, 0x1000, 0x1000)
	},

	{ "w25q32jv", INFO(0xef7016, 0, 64 * 1024,  64,
			   SECT_4K | SPI_NOR_DUAL_READ | SPI_NOR_QUAD_READ |
			   SPI_NOR_HAS_LOCK | SPI_NOR_HAS_TB)
	},
	{ "w25q32jwm", INFO(0xef8016, 0, 64 * 1024,  64,
			    SECT_4K | SPI_NOR_DUAL_READ | SPI_NOR_QUAD_READ |
			    SPI_NOR_HAS_LOCK | SPI_NOR_HAS_TB)
			    OTP_INFO(256, 3, 0x1000, 0x1000) },
	{ "w25q64jwm", INFO(0xef8017, 0, 64 * 1024, 128,
			    SECT_4K | SPI_NOR_DUAL_READ | SPI_NOR_QUAD_READ |
			    SPI_NOR_HAS_LOCK | SPI_NOR_HAS_TB) },
	{ "w25q128jwm", INFO(0xef8018, 0, 64 * 1024, 256,
			    SECT_4K | SPI_NOR_DUAL_READ | SPI_NOR_QUAD_READ |
			    SPI_NOR_HAS_LOCK | SPI_NOR_HAS_TB) },
	{ "w25q256jwm", INFO(0xef8019, 0, 64 * 1024, 512,
			    SECT_4K | SPI_NOR_DUAL_READ | SPI_NOR_QUAD_READ |
			    SPI_NOR_HAS_LOCK | SPI_NOR_HAS_TB) },
	{ "w25x64", INFO(0xef3017, 0, 64 * 1024, 128, SECT_4K) },
	{ "w25q64", INFO(0xef4017, 0, 64 * 1024, 128,
			 SECT_4K | SPI_NOR_DUAL_READ | SPI_NOR_QUAD_READ) },
	{ "w25q64dw", INFO(0xef6017, 0, 64 * 1024, 128,
			   SECT_4K | SPI_NOR_DUAL_READ | SPI_NOR_QUAD_READ |
			   SPI_NOR_HAS_LOCK | SPI_NOR_HAS_TB) },
	{ "w25q64jvm", INFO(0xef7017, 0, 64 * 1024, 128, SECT_4K) },
	{ "w25q128fw", INFO(0xef6018, 0, 64 * 1024, 256,
			    SECT_4K | SPI_NOR_DUAL_READ | SPI_NOR_QUAD_READ |
			    SPI_NOR_HAS_LOCK | SPI_NOR_HAS_TB) },
	{ "w25q128jv", INFO(0xef7018, 0, 64 * 1024, 256,
			    SECT_4K | SPI_NOR_DUAL_READ | SPI_NOR_QUAD_READ |
			    SPI_NOR_HAS_LOCK | SPI_NOR_HAS_TB) },
	{ "w25q80", INFO(0xef5014, 0, 64 * 1024,  16, SECT_4K) },
	{ "w25q80bl", INFO(0xef4014, 0, 64 * 1024,  16, SECT_4K) },
	{ "w25q128", INFO(0xef4018, 0, 64 * 1024, 256, SECT_4K) },
	{ "w25q256", INFO(0xef4019, 0, 64 * 1024, 512,
			  SECT_4K | SPI_NOR_DUAL_READ | SPI_NOR_QUAD_READ)
	  .fixups = &w25q256_fixups },
	{ "w25q256jvm", INFO(0xef7019, 0, 64 * 1024, 512,
			     SECT_4K | SPI_NOR_DUAL_READ | SPI_NOR_QUAD_READ) },
	{ "w25q256jw", INFO(0xef6019, 0, 64 * 1024, 512,
			     SECT_4K | SPI_NOR_DUAL_READ | SPI_NOR_QUAD_READ) },
	{ "w25m512jv", INFO(0xef7119, 0, 64 * 1024, 1024,
			    SECT_4K | SPI_NOR_QUAD_READ | SPI_NOR_DUAL_READ) },
	{ "w25q512jvq", INFO(0xef4020, 0, 64 * 1024, 1024,
			     SECT_4K | SPI_NOR_DUAL_READ | SPI_NOR_QUAD_READ) },
};
```











