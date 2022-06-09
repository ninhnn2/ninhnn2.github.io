---
sort: 3
---

# HƯỚNG DẪN ADD MỘT LAYER BSP VÀO YOCTO LICHEEPI NANO


#### 1. BSP layer trong Yocto là gì ?

Những thay đổi cần thiết để hỗ trợ một một platform phần cứng hoặc một thiết bị , được lưu giữ trên một
layer Yocto riêng biệt, được gọi là BSP layer. Sự tách biệt này là tốt nhất cho các bản 
cập nhật phần mềm trong tương lai và các bản vá hệ thống cho thiết bị. BSP layer có thể hổ trợ bất kể số 
lượng thiết bị và tính năng mới nào được dành riêng cho platform trên thiết bị đó.

#### 2. Làm thế nào để tạo một BSP layer

Theo quy ước, layer Yocto bắt đầu bằng "meta", viết tắt của siêu dữ liệu. Layer BSP có thể
sau đó thêm một từ khóa "bsp", và cuối cùng là một tên duy nhất. Còn ở bài viết này mình sử dụng tên layer
là "meta-gpio". Layer "meta-gpio" này sẽ hổ trợ build thư viện fagpio và install vào rootfile system cho
licheepi nano (f1c100s).

#### 3. Có vài cách để tạo một layer mới
- Tạo bằng tay, bạn cần biết chính xác mình cần làm những gì để hạn chế lỗi.
- Copy một layer sample có sẳn trong poky (Yocto) tên là "meta-skeleton".
- Dùng công cụ "bitbake-layers" để tạo (mình đang dùng phiên bản Yocto Zues, công cụ sẽ khác nếu các bạn
sử dụng phiên bản Yocto cũ hơn).

#### 4. Tạo layer bằng công cụ bitbake-layers
- cd
- cd yocto/poky
- source oe-init-build-env build-f1c100s
- bitbake-layers create-layer ../meta-gpio
- bitbake-layers add-layer ../meta-gpio




