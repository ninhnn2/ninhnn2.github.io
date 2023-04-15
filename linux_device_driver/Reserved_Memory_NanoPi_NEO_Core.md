---
sort: 5
---

# NANOPI NEO CORE - LINUX RESERVED MEMORY


### I. Reserved Memory là gì ?

#### 1. Định nghĩa chung:
- Reserved Memory là phần bộ nhớ được trích ra từ RAM hệ thống nhằm phục vụ cho phần cứng máy tính.
- Reserved Memory cung cấp RAM cho một số phần cứng như GPU tích hợp. Vì card onboard không có bộ nhớ của bản thân nó nên nó sẽ lấy bộ nhớ hệ thống (RAM) của hệ thống để bù vào.
- Card âm thanh, card lan hay mấy thứ tương tự cũng có thể cắn bớt dung lượng bộ nhớ.

#### 2. Định nghĩa trong hệ thống embedded linux:
- Reserved-Memory dự trữ các vùng bộ nhớ để sử dụng đặc biệt, loại trừ nó khỏi việc sử dụng bởi Linux Kernel và chỉ cho phép các Linux device driver tùy chỉnh sử dụng. Tính năng này được hiện
thực bởi reserved-memory framework và cũng giống với DMA-API và CMA trong kernel.


#### 3. Khai báo sử dụng Reserved Memory

Để sử dụng Reserved Memory chúng ta chỉ cần khai báo trong device tree. Hầu hết các driver được support trên mainline kernel đều có doc trong source Linux kernel, chúng ta có thể tìm kiếm các
doc để sử dụng

Đường dẫn doc hướng dẫn binding driver với devie tree:

```shell
Documentation/devicetree/bindings/reserved-memory/reserved-memory.txt
```


```shell
reserved-memory {
	#address-cells = <1>;
	#size-cells = <1>;
	ranges;
	/* global autoconfigured region for contiguous allocations */
	linux,cma {
		compatible = "shared-dma-pool";
		reusable;
		size = <0x4000000>;
		alignment = <0x2000>;
		linux,cma-default;
	};
	display_reserved: framebuffer@78000000 {
		reg = <0x78000000 0x800000>;
	};
	multimedia_reserved: multimedia@77000000 {
		compatible = "acme,multimedia-memory";
		reg = <0x77000000 0x4000000>;
	};
};
```



Phần device-tree dưới đây cũng khai báo sử dụng "reserved-memory" nhưng dùng cho CMA memory pool
và không chỉ định vùng nhớ này ở địa chỉ đặc biệt nào trên RAM cả.

Khi parser device-tree thì vùng nhớ sẽ random vị trí trên RAM nhưng
vẫn đảm bảo một vùng nhớ liên tục.


```shell
linux,cma {
	compatible = "shared-dma-pool";  // string dùng để match với linux driver
	reusable;
	size = <0x4000000>;              // Khai báo 64MB memory để sử dụng
	alignment = <0x2000>;            // alignment 8KB
	linux,cma-default;
};
```

Ta phân tích tiếp đoạn device-tree dưới đây

```shell
display_reserved: framebuffer@78000000 {
	reg = <0x78000000 0x800000>;
};
```

Khai báo sử dụng "reserved-memory" với địa chỉ bắt đầu "0x78000000" với size là "0x800000"
Địa chỉ "0x78000000" là địa chỉ trên RAM, và việc chọn địa chỉ phải phù hợp với hệ thống embedded linux của các bạn.
Size vùng nhớ "0x800000" là kích thước tùy chọn phụ thuộc vào kích thước RAM và nhu cầu của
driver sử dụng.
Tránh tình trạng cấp dư quá nhiều làm giảm RAM của hệ thống và khiến hệ thống giảm hiệu xuất nhé.


#### 4. Khai báo sử dụng Reserved Memory NanoPi NEO Core

Okay, lý thuyết đủ rồi. Giờ làm sao tạo vùng nhớ "Reserved Memory" cho NanoPi NEO Core ?

Trước khi tạo vùng nhớ chúng ta khảo sát con NanoPi NEO Core


![this screenshot](/images/memory-nanopi-neo-core-1.png)


Có thể thấy RAM đang là 491MB, nếu chúng ta tạo "Reserved Memory" thành công thì dung
lượng RAM này sẽ giảm đi vì đã cắt một phần để cấp cho "Reserved Memory".

##### Kiểm tra địa chỉ RAM để sử dụng cho "Reserved Memory" cho NanoPi NEO Core

Các bạn truy cập con NanoPi NEO Core và check với command sau
```shell
sudo cat /proc/iomem
```

Output lệnh như dưới đây
```shell
01000000-010fffff : /soc/clock@1000000
01100000-011fffff : /soc/mixer@1100000
01c02000-01c02fff : /soc/dma-controller@01c02000
01c0c000-01c0cfff : /soc/lcd-controller@1c0c000
01c0f000-01c0ffff : /soc/mmc@01c0f000
01c11000-01c11fff : /soc/mmc@01c11000
01c14000-01c143ff : /soc/eeprom@01c14000
01c19000-01c193ff : /soc/usb@01c19000
  01c19000-01c193ff : /soc/usb@01c19000
01c19400-01c1942b : phy_ctrl
01c1a000-01c1a0ff : /soc/usb@01c1a000
01c1a400-01c1a4ff : /soc/usb@01c1a400
01c1a800-01c1a803 : pmu0
01c1b000-01c1b0ff : /soc/usb@01c1b000
01c1b400-01c1b4ff : /soc/usb@01c1b400
01c1b800-01c1b803 : pmu1
01c1c000-01c1c0ff : /soc/usb@01c1c000
01c1c400-01c1c4ff : /soc/usb@01c1c400
01c1c800-01c1c803 : pmu2
01c1d000-01c1d0ff : /soc/usb@01c1d000
01c1d400-01c1d4ff : /soc/usb@01c1d400
01c1d800-01c1d803 : pmu3
01c20000-01c203ff : /soc/clock@01c20000
01c20800-01c20bff : /soc/pinctrl@01c20800
01c20c00-01c20c9f : /soc/timer@01c20c00
01c20ca0-01c20cbf : /soc/watchdog@01c20ca0
01c22800-01c22bff : /soc/i2s@1c22800
01c22c00-01c22fff : /soc/codec@01c22c00
01c25000-01c253ff : /soc/ths@01c25000
01c28000-01c2801f : serial
01c28400-01c2841f : serial
01c28800-01c2881f : serial
01c28c00-01c28c1f : serial
01c2ac00-01c2afff : /soc/i2c@01c2ac00
01c2b000-01c2b3ff : /soc/i2c@01c2b000
01c2b400-01c2b7ff : /soc/i2c@01c2b400
01c30000-01c3ffff : /soc/ethernet@1c30000
01c68000-01c68fff : /soc/spi@01c68000
01ee0000-01eeffff : /soc/hdmi@1ee0000
01ef0000-01efffff : /soc/hdmi@1ee0000
01f00000-01f00053 : /soc/rtc@01f00000
01f01400-01f014ff : /soc/clock@1f01400
01f015c0-01f015c3 : /soc/codec-analog@01f015c0
01f02c00-01f02fff : /soc/pinctrl@01f02c00
40000000-5fffffff : System RAM
  40008000-40ffffff : Kernel code
  41200000-412b662f : Kernel data
```

Ta nhìn vào đó và thấy dòng "40000000-5fffffff : System RAM" vậy mình cứ chọn đại cái
địa chỉ "Reserved Memory" là 0x50000000 xem thế nào.



Mở source Linux Kernel của NanoPi NEO Core và truy cập cấp file device-tree "sun8i-h3.dtsi"
Các bạn sẽ thấy có phần khai báo sẳn "reserved-memory" sử dụng cho CMA pool. Các bạn xem đoạn
device-tree đó dưới đây

```shell
reserved-memory {                                 
	#address-cells = <1>;
	#size-cells = <1>;
	ranges;
	cma: linux,cma {
		compatible = "shared-dma-pool";
		reusable;
		size = <0x4000000>;
		alignment = <0x2000>;
		linux,cma-default;
	};
};
```


Ta sẽ thêm vùng nhớ "reserved-memory" tự tạo như dưới đây

```shell
	reserved-memory {
		#address-cells = <1>;
		#size-cells = <1>;
		ranges;

		cma: linux,cma {
			compatible = "shared-dma-pool";
			reusable;
			size = <0x4000000>;
			alignment = <0x2000>;
			linux,cma-default;
		};

		bar: bar@0x40000000 {
			no-map;
			reg = <0x50000000 0x4000000>;
		};
	};
```

Đoạn "reg = <0x50000000 0x4000000>;" khai báo địa chỉ cụ thể để đặt vùng "reserved-memory" với
kích thước 64MB.


##### Rebuild Linux Kernel NanoPi NEO Core

```shell
sudo make ARCH=arm CROSS_COMPILE=/opt/FriendlyARM/toolchain/4.9.3/bin/arm-linux- -j8
```

##### Copy device-tree đã thay đổi lên NanoPi NEO Core

```shell
scp ./arch/arm/boot/dts/sun8i-h3-nanopi-neo-core.dtb pi@192.168.1.11:/home/pi/
ssh pi@192.168.1.11
sudo cp sun8i-h3-nanopi-neo-core.dtb /boot/
sudo reboot
```


##### Sau khi NanoPi NEO Core restart chúng ta check lại các thông số nhé

![this screenshot](/images/memory-nanopi-neo-core-2.png)

Các bạn sẽ thấy RAM hệ thống đã giảm đúng 64MB như chúng ta đã nói ở trước.



Tiếp theo kiểm tra các địa chỉ vùng nhớ

```shell
01000000-010fffff : /soc/clock@1000000
01100000-011fffff : /soc/mixer@1100000
01c02000-01c02fff : /soc/dma-controller@01c02000
01c0c000-01c0cfff : /soc/lcd-controller@1c0c000
01c0f000-01c0ffff : /soc/mmc@01c0f000
01c11000-01c11fff : /soc/mmc@01c11000
01c14000-01c143ff : /soc/eeprom@01c14000
01c19000-01c193ff : /soc/usb@01c19000
  01c19000-01c193ff : /soc/usb@01c19000
01c19400-01c1942b : phy_ctrl
01c1a000-01c1a0ff : /soc/usb@01c1a000
01c1a400-01c1a4ff : /soc/usb@01c1a400
01c1a800-01c1a803 : pmu0
01c1b000-01c1b0ff : /soc/usb@01c1b000
01c1b400-01c1b4ff : /soc/usb@01c1b400
01c1b800-01c1b803 : pmu1
01c1c000-01c1c0ff : /soc/usb@01c1c000
01c1c400-01c1c4ff : /soc/usb@01c1c400
01c1c800-01c1c803 : pmu2
01c1d000-01c1d0ff : /soc/usb@01c1d000
01c1d400-01c1d4ff : /soc/usb@01c1d400
01c1d800-01c1d803 : pmu3
01c20000-01c203ff : /soc/clock@01c20000
01c20800-01c20bff : /soc/pinctrl@01c20800
01c20c00-01c20c9f : /soc/timer@01c20c00
01c20ca0-01c20cbf : /soc/watchdog@01c20ca0
01c22800-01c22bff : /soc/i2s@1c22800
01c22c00-01c22fff : /soc/codec@01c22c00
01c25000-01c253ff : /soc/ths@01c25000
01c28000-01c2801f : serial
01c28400-01c2841f : serial
01c28800-01c2881f : serial
01c28c00-01c28c1f : serial
01c2ac00-01c2afff : /soc/i2c@01c2ac00
01c2b000-01c2b3ff : /soc/i2c@01c2b000
01c2b400-01c2b7ff : /soc/i2c@01c2b400
01c30000-01c3ffff : /soc/ethernet@1c30000
01c68000-01c68fff : /soc/spi@01c68000
01ee0000-01eeffff : /soc/hdmi@1ee0000
01ef0000-01efffff : /soc/hdmi@1ee0000
01f00000-01f00053 : /soc/rtc@01f00000
01f01400-01f014ff : /soc/clock@1f01400
01f015c0-01f015c3 : /soc/codec-analog@01f015c0
01f02c00-01f02fff : /soc/pinctrl@01f02c00
40000000-4fffffff : System RAM
  40008000-40ffffff : Kernel code
  41200000-412b662f : Kernel data
54000000-5fffffff : System RAM
```

Lúc này vùng nhớ "System RAM" bị chia đôi rồi:
- Vùng 1 địa chỉ từ 40000000-4fffffff
- Vùng 2 địa chỉ từ 54000000-5fffffff

Vùng địa chỉ từ 50000000 đến 53ffffff đã dùng để làm "reserved-memory"


#### 5. Tổng kết

Thế là chúng ta đã tạo thành công vùng nhớ "reserved-memory" trên RAM cho board NanoPi NEO Core
Bài viết tiếp theo sẽ implement một linux driver để match với vùng nhớ trên device-tree và trao đổi dữ liệu với user space application.


