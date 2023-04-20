---
sort: 6
---

# NANOPI NEO CORE - LINUX RESERVED MEMORY PART 2: Linux Platform Device Driver


### I. Linux Platform Device Driver

Chúng ta đều biết về các thiết bị Plug and Play. Chúng được kernel xử lý ngay khi chúng được cắm vào. Chúng có thể là USB hoặc PCI Express, hoặc bất kỳ thiết bị có thể tự động phát hiện nào khác. Tuy nhiên, còn tồn tại các loại thiết bị khác, không thể tháo rời được và kernel cần phải biết trước khi được quản lý. Các loại thiết bị này bao gồm I2C, UART, SPI và các thiết bị khác không được kết nối với các bus có khả năng liệt kê được.

Đây là một số bus vật lý thực tế mà bạn có thể đã biết: USB, I2S, I2C, UART, SPI, PCI, SATA, và nhiều hơn thế nữa. Các bus như vậy là các thiết bị phần cứng được gọi là controllers. Vì chúng là một phần của SoC, nên chúng không thể được gỡ bỏ, không thể tự động phát hiện và còn được gọi là platform devices.

- Người ta thường nói rằng các platform device là các thiết bị tích hợp trên chip (nhúng trong SoC). Trong thực tế, điều này chỉ đúng một phần, vì chúng được cấu hình cứng vào chip và không thể tháo rời. Tuy nhiên, các thiết bị được kết nối với I2C hoặc SPI không phải là thiết bị tích hợp trên chip, nhưng cũng là các platform device vì chúng không khảo sát được. Tương tự, có thể có các thiết bị PCI hoặc USB tích hợp trên chip, nhưng chúng không phải là các platform device vì chúng có thể được phát hiện khi cắm vào hệ thống.

*Example:*
- Với USB hoặc PCI chúng ta có thể test bằng cmd "dmesg -Hw" trên terminal linux. Khi cắm thiết bị USB vào một PC Linux hay một embedded linux computer các bạn sẽ thấy hệ thống Linux phát hiện thiết bị được cắm vào như hình dưới đây:

![this screenshot](/images/usb_log.png)

Nói cách khác, trong Linux driver, các platform device không nhất thiết phải là các thiết bị tích hợp trên chip. Một số thiết bị được kết nối thông qua I2C hoặc SPI cũng có thể được coi là các platform device do chúng không thể được tự động phát hiện. Tuy nhiên, các thiết bị PCI hoặc USB tích hợp trên chip thường không được coi là các platform device vì chúng có thể được khám phá.`


*Đây là hai bước cần thiết khi làm việc với các thiết bị platform trong Linux driver:*
- Đăng ký một platform driver (với tên độc nhất) sẽ quản lý các thiết bị của bạn.
- Đăng ký thiết bị platform của bạn với cùng tên với driver và tài nguyên của chúng, để cho kernel biết rằng thiết bị của bạn đã có sẵn.


