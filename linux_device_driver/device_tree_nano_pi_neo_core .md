---
sort: 4
---

# NANOPI NEO CORE DEVICE TREE


### 1. Mở source linux kernel để dạo xem device tree của NanoPi NEO Core


- Chúng ta thấy device tree được sử dụng cho NanoPi NEO Core được định nghĩa với tên "sun8i-h3-nanopi-neo-core.dts"
- Trong device tree cũng có "#include" như trong c, cơ bản nó cũng cần include các file device tree khác để có thể lấy các 
device tree node nằm ở các file khác. Việc phân tách như thế này nhằm dễ dàng custom cho các board khác nhau nhưng lại dùng 
chung một loại chip.
- File "sun8i-h3-nanopi-neo-core.dts" gọi chung là file định nghĩa board
- Orange Pi, Mango Pi, Panana Pi vân vân đều dùng chip Allwinner H3, chỉ khác một vài ngoại vi thôi. Để phân biệt giữa các
board khác nhau thì ta chỉ việc tạo thêm các file device tree với tên board cần build, xong chỉ cần thêm bớt ngoại vi cho phù
hợp. Nói thì đơn giản thế nhưng cũng cần có ít kiến thức về device tree.
- Thường mỗi loại board  thì có developer khác nhau support hoặc công ty nào đó support, nên chúng ta cũng cần làm quen cách
implement của từng developer hay công ty support board đó.
- File device tree "sun8i-h3-nanopi-neo-core.dts" include file "sun8i-h3-nanopi.dtsi".

![this screenshot](/images/nanopi-neo-core-device-tree-1.png)



- File "sun8i-h3-nanopi.dtsi" được gọi chung là file định nghĩa SoC (tức là định nghĩa cho một  loại cpu cụ thể như Allwinner H3...)
- Nó có nhiều define chi tiết trong đây và thường mặc định là trạng thái disable, các file device tree định nghĩa board sẽ include file
này và enable ngoại vi cần sử  dụng.
- File này vẫn tiếp tục include file "sun8i-h3.dtsi", có nghĩa là bên công ty sản xuất NanoPi NEO Core đã tạo riêng một file "sun8i-h3-nanopi.dtsi" để kế thừa file "sun8i-h3.dtsi" và về sau họ có thêm board NanoPi nào khác thì họ cứ tạo thêm file device tree định nghĩa board
và include tới  file "sun8i-h3-nanopi.dtsi".

![this screenshot](/images/nanopi-neo-core-device-tree-2.png)




- File này định nghĩa rất nhiều về SoC Allwinner H3
- Các board support chip H3 đều phải include file này.
![this screenshot](/images/nanopi-neo-core-device-tree-3.png)
