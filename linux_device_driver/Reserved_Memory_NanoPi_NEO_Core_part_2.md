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

![this screenshot](/images/nanopineo_driver1.png)

```shell
	foo {
		compatible = "vendor,bar";
 	 	memory-region = <&nodename>;
	};
```

**Devie node foo**: 
 Device node foo sẽ được liên kết với reserved-memory được khai báo trong child node "nodename".
Khi hệ thống khởi động, driver sẽ được tự động gọi để khởi tạo device foo và sử dụng reserved memory.

**compatible = "vendor,bar"**:
 "compatible" là một thuộc tính quan trọng trong device tree của Linux, nó được sử dụng để xác định các thiết bị phần cứng và driver tương thích với nhau. Thuộc tính "compatible" chứa một chuỗi đặc tả về tên hãng sản xuất và mô hình của thiết bị. Chuỗi này có định dạng "<hãng sản xuất>,<mô hình>" và được khuyến khích phải đặt chính xác để tránh xung đột với các thiết bị khác.

Các giá trị của "compatible" được sử dụng để so khớp với các driver hoặc phần mềm tương thích với thiết bị đó, và được sử dụng để đảm bảo rằng các thiết bị sẽ hoạt động đúng cách với hệ thống Linux. Khi một driver được load vào hệ thống, kernel sẽ kiểm tra các thuộc tính "compatible" của các device tree node và chọn driver phù hợp để điều khiển thiết bị đó.

#### Viết một platform driver cơ bản và sử dụng vùng nhớ reserved-memory

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
MODULE_AUTHOR("NinhNN 4 GNU/Linux");
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

	struct device *dev = &pdev->dev;
	const char *label;
	int my_value, ret;

	struct device_node *node;
  	struct resource res;
	struct resource *ress;
  	unsigned long paddr, vaddr;
	size_t mem_size;
	void *mem_va;
  	int rc = 0;

	/* Check for device properties */
	if(!device_property_present(dev, "memory-region")) {
		printk("dt_probe - Error! Device property 'label' not found!\n");
		return -1;
	}

	  /* Get reserved memory region from Device-tree */
  	node = of_parse_phandle(dev->of_node, "memory-region", 0);
  	if (!node) {
    	dev_err(dev, "No %s specified\n", "memory-region");
    	return 0;
  	}

	rc = of_address_to_resource(node, 0, &res);
  	if (rc) {
    	dev_err(dev, "No memory address assigned to the region\n");
		return 0;
  	}
    
  	paddr = res.start;
	mem_size = resource_size(&res);
	dev_info(dev, "memsize: %d\n", mem_size);

	char* p_malloc = (char*)ioremap(paddr, mem_size);
	char* *p_tmp = p_malloc;
	int i = 0;
	if (p_malloc == NULL) {
		printk("Virtual addr is error\n");
	} else {
		for(i = 0; i < 2048; i++ ) {
			*p_tmp++ = 49;
		}
		p_tmp = p_malloc;

		for(i = 0; i < 1024; i++ ) {
			printk("%x: ", *p_tmp++);
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



```shell
static struct of_device_id my_driver_ids[] = {
	{
		.compatible = "vendor,bar",
	}, { /* sentinel */ }
};
```

Đoạn mã trên định nghĩa một mảng các đối tượng of_device_id dùng để khai báo các đặc điểm (compatible) của thiết bị mà driver này hỗ trợ.

- struct of_device_id là một cấu trúc trong Linux kernel dùng để khai báo thông tin của các thiết bị trong device tree.
my_driver_ids là tên của mảng chứa các đối tượng of_device_id.
- Mỗi phần tử trong mảng chứa một cấu trúc of_device_id.
- Trong trường hợp này, cấu trúc of_device_id chỉ có một trường là compatible.
- Trường compatible được sử dụng để xác định sự tương thích của driver với các thiết bị trong device tree.
- Trong ví dụ trên, compatible được đặt là "vendor,bar" để chỉ định rằng driver này tương thích với thiết bị có compatible string là "vendor,bar".
- Dòng cuối cùng { /* sentinel */ } là một phần tử kết thúc mảng, đánh dấu kết thúc danh sách các đặc điểm.













#### Makefile để biên dịch driver

```shell
obj-m += platform_device_driver.o

all:
	make ARCH=arm CROSS_COMPILE=/opt/FriendlyARM/toolchain/4.9.3/bin/arm-linux- -C /home/fanning/workspace/work/nanopineo/linux/fanning/lib/modules/4.14.111-ninhnn/build  M=$(PWD) modules

clean: 
	make ARCH=arm CROSS_COMPILE=/opt/FriendlyARM/toolchain/4.9.3/bin/arm-linux- -C /home/fanning/workspace/work/nanopineo/linux/fanning/lib/modules/4.14.111-ninhnn/build  M=$(PWD) clean
```

- Dòng "obj-m += platform_device_driver.o" được sử dụng trong Makefile để chỉ định cho hệ thống biên dịch kernel (kbuild) biết rằng có một module kernel được xây dựng từ tệp nguồn "platform_device_driver.c" và tên của module được đặt là "platform_device_driver"
- Dòng "/home/fanning/workspace/work/nanopineo/linux/fanning/lib/modules/4.14.111-ninhnn/build" đường dẫn đến source compile linux kernel modules.


















