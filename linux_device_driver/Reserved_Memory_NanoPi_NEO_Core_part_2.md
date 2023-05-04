---
sort: 6
---

# NANOPI NEO CORE - LINUX RESERVED MEMORY PART 2: LINUX PLATFROM DEVICE DRIVER


### I. Linux Platform Device Driver

Chúng ta đều biết về các thiết bị Plug and Play. Chúng được kernel xử lý ngay khi chúng được cắm vào. Chúng có thể là USB hoặc PCI Express, hoặc bất kỳ thiết bị có thể tự động phát hiện nào khác. Tuy nhiên, còn tồn tại các loại thiết bị khác, không thể tháo rời và kernel cần phải biết trước khi được quản lý. Các loại thiết bị này bao gồm I2C, UART, SPI và các thiết bị khác không được kết nối với các bus có khả năng được phát hiện.

Đây là một số bus vật lý thực tế mà bạn có thể đã biết: USB, I2S, I2C, UART, SPI, PCI, SATA, và nhiều hơn thế nữa. Các bus như vậy là các thiết bị phần cứng được gọi là controllers. Vì chúng là một phần của SoC, nên chúng không thể được gỡ bỏ, không thể tự động phát hiện và còn được gọi là platform devices.

- Người ta thường nói rằng các platform device là các thiết bị tích hợp trên chip (nhúng trong SoC). Trong thực tế, điều này chỉ đúng một phần, vì chúng được cấu hình cứng vào chip và không thể tháo rời. Tuy nhiên, các thiết bị được kết nối với I2C hoặc SPI không phải là thiết bị tích hợp trên chip, nhưng cũng là các platform device vì chúng không thể được tự động phát hiện. Tương tự, có thể có các thiết bị PCI hoặc USB tích hợp trên chip, nhưng chúng không phải là các platform device vì chúng có thể được phát hiện khi cắm vào hệ thống.

**Example:**
- Với USB hoặc PCI chúng ta có thể test bằng cmd "dmesg -Hw" trên terminal linux. Khi cắm thiết bị USB vào một PC Linux hay một embedded linux computer các bạn sẽ thấy hệ thống Linux phát hiện thiết bị được cắm vào như hình dưới đây:

![this screenshot](/images/usb_log.png)

Nói cách khác, trong Linux driver, các platform device không nhất thiết phải là các thiết bị tích hợp trên chip. Một số thiết bị được kết nối thông qua I2C hoặc SPI cũng có thể được coi là các platform device. Tuy nhiên, các thiết bị PCI hoặc USB tích hợp trên chip thường không được coi là các platform device vì chúng có thể được phát hiện.

**Đây là hai bước cần thiết khi làm việc với các platform device trong Linux driver:**
- Đăng ký một platform driver (với tên độc nhất) sẽ quản lý các thiết bị của bạn.
- Đăng ký platform device của bạn với cùng tên với driver và tài nguyên của chúng, để cho kernel biết rằng thiết bị của bạn đã có sẵn.

### II. Matching device tree with reserved-memory platform driver

#### Khai báo driver trong device tree
Như trong bài viết trước chúng ta đã khai báo reserved-memory child node để reserved một vùng nhớ 64MB

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

		bar: bar@0x50000000 {
			no-map;
			reg = <0x50000000 0x4000000>;
		};

	};
```

- Việc khai báo child node "bar: bar@0x50000000" báo cho kernel không đụng gì tới vùng nhớ này nhưng không giúp chúng ta có thể matching
với platform driver.
- Chúng ta cần một vài chỉnh sữa như dưới đây:

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

		nodename: bar@0x50000000 {
      			compatible = "vendor,bar";
			no-map;
			reg = <0x50000000 0x4000000>;
		};

	};

```

- Chuyển bar thành nodename khác với "bar@0x50000000" mặc dù để nguyên thì vẫn không lỗi.

**compatible = "vendor,bar"**
"compatible" là một thuộc tính quan trọng trong device tree của Linux, nó được sử dụng để xác định các thiết bị phần cứng và phần mềm tương thích với nhau. Thuộc tính "compatible" chứa một chuỗi đặc tả về tên hãng sản xuất và mô hình của thiết bị. Chuỗi này có định dạng "<hãng sản xuất>,<mô hình>" và được khuyến khích phải đặt chính xác để tránh xung đột namespace và giúp hệ điều hành quyết định cách thức hoạt động trên thiết bị.

Các giá trị của "compatible" được sử dụng để so khớp với các driver hoặc phần mềm tương thích với thiết bị đó, và được sử dụng để đảm bảo rằng các thiết bị sẽ hoạt động đúng cách với hệ thống Linux. Khi một driver được load vào hệ thống, kernel sẽ kiểm tra các thuộc tính "compatible" của các device tree node và chọn driver phù hợp để điều khiển thiết bị đó.


















