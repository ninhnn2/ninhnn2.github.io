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


Khai báo sử dụng "reserved-memory" với địa chỉ bắt đầu "0x78000000" với size là "0x800000"

```shell
		display_reserved: framebuffer@78000000 {
			reg = <0x78000000 0x800000>;
		};
```




