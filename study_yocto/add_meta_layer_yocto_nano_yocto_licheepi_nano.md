---
sort: 3
---

# HƯỚNG DẪN ADD META LAYER VÀO YOCTO


#### 1. Tạo một custom BSP layer

Những thay đổi cần thiết để hỗ trợ một một platfrom phần cứng, được lưu giữ trên một
layer Yocto riêng biệt, được gọi là BSP layer. Sự tách biệt này là tốt nhất cho các bản 
cập nhật trong tương lai và các bản vá cho hệ thống. Layer BSP có thể hỗ trợ bất kỳ số lượng
máy mới nào và bất kỳ máy mới nào tính năng phần mềm được liên kết với chính phần cứng.

#### 2. Lấy source và tiến hành build yocto cho board LicheePi Nano




