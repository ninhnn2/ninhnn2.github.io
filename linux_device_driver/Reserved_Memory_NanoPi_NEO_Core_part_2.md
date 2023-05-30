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

#### Custom device tree node để matching với NanoPi Neo Core platform driver
Như trong bài viết trước chúng ta đã khai báo reserved-memory child node để reserved một vùng nhớ 64MB trên Ram.

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
- "no-map" dùng để báo cho kernel không ánh xạ vùng nhớ này để sử dụng.
- Chúng ta cần một vài chỉnh sửa như dưới đây:

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

** Và tại file device tree "sun8i-h3-nanopi.dtsi" chúng ta thêm một node driver sử dụng child node "nodename" đã khai báo phía trên **

** Taọ node foo tham chiếu tới memorychildnode **



![this screenshot](/images/nanopineo_driver1.png)

```shell
	foo {
		compatible = "vendor,bar";
 	 	memory-region = <&nodename>;
	};
```

**Devie node foo**: 
Device node foo tham chiếu tới reserved-memory child node "nodename".
Khi hệ thống khởi động, driver sẽ được tự động gọi để khởi tạo device foo và sử dụng reserved memory.

**memory-region**
Là một thuộc tính (property) đặc biệt được sử dụng để chỉ định khu vực bộ nhớ (memory region) cho một phần tử cụ thể trong Device Tree

**compatible = "vendor,bar"**:
 "compatible" là một thuộc tính quan trọng trong device tree của Linux, nó được sử dụng để xác định các thiết bị phần cứng và driver tương thích với nhau. Thuộc tính "compatible" chứa một chuỗi đặc tả về tên hãng sản xuất và mô hình của thiết bị. Chuỗi này có định dạng "<hãng sản xuất>,<mô hình>" và được khuyến khích phải đặt chính xác để tránh xung đột với các thiết bị khác.

#### Viết một platform driver cơ bản và sử dụng vùng nhớ reserved-memory


##### Makefile để biên dịch driver

```shell
obj-m += platform_device_driver.o

all:
	make ARCH=arm CROSS_COMPILE=/opt/FriendlyARM/toolchain/4.9.3/bin/arm-linux- -C /home/fanning/workspace/work/nanopineo/linux/fanning/lib/modules/4.14.111-ninhnn/build  M=$(PWD) modules

clean: 
	make ARCH=arm CROSS_COMPILE=/opt/FriendlyARM/toolchain/4.9.3/bin/arm-linux- -C /home/fanning/workspace/work/nanopineo/linux/fanning/lib/modules/4.14.111-ninhnn/build  M=$(PWD) clean
```

- Dòng "obj-m += platform_device_driver.o" được sử dụng trong Makefile để chỉ định cho hệ thống biên dịch kernel (kbuild) biết rằng có một module kernel được xây dựng từ tệp nguồn "platform_device_driver.c" và tên của module được đặt là "platform_device_driver"
- Dòng "/home/fanning/workspace/work/nanopineo/linux/fanning/lib/modules/4.14.111-ninhnn/build" đường dẫn đến source compile linux kernel modules.

#### File source driver "platform_device_driver.c"

```shell
#include <linux/module.h>
#include <linux/init.h>
#include <linux/mod_devicetable.h>
#include <linux/property.h>
#include <linux/platform_device.h>
#include <linux/of_device.h>
#include <linux/of_address.h>
#include <linux/sizes.h>

/* Meta Information */
MODULE_LICENSE("GPL");
MODULE_AUTHOR("Johannes 4 GNU/Linux");
MODULE_DESCRIPTION("A simple LKM using reserved-memory and write value to it");

/* Declate the probe and remove functions */
static int dt_probe(struct platform_device *pdev);
static int dt_remove(struct platform_device *pdev);

static struct of_device_id my_driver_ids[] = {
	{
		.compatible = "vendor,bar",
	}, { /* sentinel */ }
};

static struct platform_driver my_driver = {
	.probe = dt_probe,
	.remove = dt_remove,
	.driver = {
		.name = "nodename",
		.of_match_table = my_driver_ids,
	},
};

MODULE_DEVICE_TABLE(of, my_driver_ids);
/**
 * @brief This function is called on loading the driver 
 */
static int dt_probe(struct platform_device *pdev) {
	printk("dt_probe - Now I am in the probe function!\n");

	int ret = 0;
	unsigned long PhyAddr;
	size_t PhyMemSize;
	struct device *dev = &pdev->dev;
	struct device_node *DeviceNode;
  	struct resource NodeResource;

	/* Check for device properties */
	if(!device_property_present(dev, "memory-region")) {
		printk("dt_probe - Error! Device property 'label' not found!\n");
		return -1;
	}

	  /* Get reserved memory region from Device-tree */
  	DeviceNode = of_parse_phandle(dev->of_node, "memory-region", 0);
  	if (!DeviceNode) {
    	dev_err(dev, "No %s specified\n", "memory-region");
    	return 0;
  	}

	ret = of_address_to_resource(DeviceNode, 0, &NodeResource);
  	if (ret) {
    	dev_err(dev, "No memory address assigned to the region\n");
		return 0;
  	}
    
  	PhyAddr = NodeResource.start;
	PhyMemSize = resource_size(&NodeResource);

	dev_info(dev, "PhyAddr    : 0x%8X\n", PhyAddr);
	dev_info(dev, "PhyMemSize : 0x%8X\n", PhyMemSize);

	char* VirtualPtr = (char*)ioremap(PhyAddr, PhyMemSize);
	char* *VirtualPtrData = VirtualPtr;

	int index = 0;

	if (VirtualPtr == NULL) {
		printk("Virtual addr is error\n");
	} else {
		for(index = 0; index < 1024; index++ ) {
			*VirtualPtrData++ = 49;
		}
		VirtualPtrData = VirtualPtr;

		for(index = 0; index < 1024; index++ ) {
			//printk("%d: ", *p_tmp++);
		}
		printk("\n");
	}
	return 0;
}

/**
 * @brief This function is called on unloading the driver 
 */
static int dt_remove(struct platform_device *pdev) {
	printk("dt_probe - Now I am in the remove function\n");
	return 0;
}

/**
 * @brief This function is called, when the module is loaded into the kernel
 */
static int __init my_init(void) {
	printk("dt_probe - Loading the driver...\n");
	if(platform_driver_register(&my_driver)) {
		printk("dt_probe - Error! Could not load driver\n");
		return -1;
	}
	return 0;
}

/**
 * @brief This function is called, when the module is removed from the kernel
 */
static void __exit my_exit(void) {
	printk("dt_probe - Unload driver");
	platform_driver_unregister(&my_driver);
}

module_init(my_init);
module_exit(my_exit);

```


**Giải thích từng đoạn code trong driver**

```shell
static struct of_device_id my_driver_ids[] = {
	{
		.compatible = "vendor,bar",
	},{ /* sentinel */ }
};
```

Đoạn mã trên định nghĩa một mảng các đối tượng of_device_id dùng để khai báo các đặc điểm (compatible) của thiết bị mà driver này hỗ trợ.

- struct of_device_id là một cấu trúc trong Linux kernel dùng để khai báo thông tin của các thiết bị trong device tree.
- my_driver_ids là tên của mảng chứa các đối tượng of_device_id.
- Mỗi phần tử trong mảng chứa một cấu trúc of_device_id.
- Trong trường hợp này, cấu trúc of_device_id chỉ có một trường là compatible.
- Trường compatible được sử dụng để xác định sự tương thích của driver với các thiết bị trong device tree.
- Trong ví dụ trên, compatible được đặt là "vendor,bar" để chỉ định rằng driver này tương thích với thiết bị có compatible string là "vendor,bar".


```shell
static struct platform_driver my_driver = {
	.probe = dt_probe,
	.remove = dt_remove,
	.driver = {
		.name = "foo",
		.of_match_table = my_driver_ids,
	},
};
```


Khai báo một struct platform_driver có tên là my_driver.

- Nó chỉ định các hàm probe và remove của driver lần lượt là dt_probe và dt_remove.
- Trường .driver của my_driver là một struct device_driver cung cấp thông tin về driver.
- Trường .name được đặt là "foo", đây là tên của driver.
- Trường .of_match_table được sử dụng để chỉ định bảng khớp (match table) của driver với các phần tử trong Device Tree
và ở đây bản "match table" đã được chúng ta khai báo bên trên (my_driver_ids)


```shell
static int dt_probe(struct platform_device *pdev) {
	
	...
	return 0;
}
```
- Hàm dt_probe là một hàm callback được đăng ký trong struct platform_driver để xử lý sự kiện "probe" khi một thiết bị tương thích được tìm thấy và khớp với driver này. Ở platform driver, khi chúng ta insmod driver vào hệ thống thì lúc này kernel sẽ
tìm kiếm các từ khóa "compatible" hoặc "of_match_table" parser các dữ liệu trong các thuộc tính này và đem đi duyệt so sánh với device tree được lưu trữ trong bộ nhớ, nếu match nó sẽ gắn kết thiết bị với driver và bắt đầu gọi hàm probe.
- Tại hàm probe chúng ta sẽ parser các thông tin device đã match với device tree và lấy các thông tin cần thiết:
	- "device_property_present(dev, "memory-region")" kiểm tra thuộc tính "memory-region" có tồn tại ở device tree node hay không.
	- "of_parse_phandle" trích xuất node phân cấp có chứa thuộc tính "memory-region".
	- "of_address_to_resource(node, 0, &res)" địa chỉ node trích xuất được từ "of_parse_phandle" và ánh xạ nó thành cấu trúc
	"struct resource res".
	- "paddr = res.start" lấy phần tử đầu tiên trong cấu trúc resource, ở đây ta sẽ có được địa chỉ vật lý khai báo trong child node reserved-memory "0x50000000" là địa chỉ bắt đầu của vùng nhớ reserved-memory.
	- "mem_size = resource_size(&res)" lấy kích thước vùng nhớ "reserved-memory" size 0x4000000.



















