# Fanning — Embedded Linux Engineer

Chào mừng đến với blog của tôi — nơi chia sẻ kiến thức và kinh nghiệm thực chiến về **lập trình nhúng**: Linux kernel, device driver, U-Boot, Yocto / Buildroot / OpenWrt, Android BSP và IoT — và gần đây là **AI cho kỹ sư nhúng**: chạy một mô hình ngôn ngữ 28,9 triệu tham số trên con chip ESP32-S3 giá 8 đô.

## Chuyên mục

<div class="home-cards">
  <a class="home-card" href="/study_ai/">
    <i class="fa fa-graduation-cap" aria-hidden="true"></i>
    <span class="card-title">AI cho kỹ sư nhúng</span>
    <span class="desc">Từ vector tới LLM 28.9M tham số chạy trên ESP32-S3 — toán nền, transformer, quantization</span>
  </a>
  <a class="home-card" href="/linux_device_driver/">
    <i class="fa fa-linux" aria-hidden="true"></i>
    <span class="card-title">Linux Device Driver</span>
    <span class="desc">NanoPi NEO Core — biên dịch kernel, U-Boot, device tree, reserved memory</span>
  </a>
  <a class="home-card" href="/android/">
    <i class="fa fa-android" aria-hidden="true"></i>
    <span class="card-title">Android BSP</span>
    <span class="desc">Tinker Board 2S — build Android, root, GPIO, remote screen</span>
  </a>
  <a class="home-card" href="/study_yocto/">
    <i class="fa fa-cubes" aria-hidden="true"></i>
    <span class="card-title">Yocto</span>
    <span class="desc">Meta layer, build image cho LicheePi Nano, tối ưu boot time</span>
  </a>
  <a class="home-card" href="/study_licheepinano/">
    <i class="fa fa-microchip" aria-hidden="true"></i>
    <span class="card-title">LicheePi Nano</span>
    <span class="desc">Allwinner F1C100s — build system, GPIO, NOR flash</span>
  </a>
  <a class="home-card" href="/study_iot/">
    <i class="fa fa-wifi" aria-hidden="true"></i>
    <span class="card-title">IoT</span>
    <span class="desc">Web server OpenResty / Flask, systemd, 4G LTE</span>
  </a>
</div>

## Kỹ năng chính

- **Ngôn ngữ**: Embedded C/C++, ASM; kiến trúc lập trình event-driven.
- **MCU — STM32**: RTOS, FOTA, bootloader; bare-metal BCM2835, AM335x.
- **Zigbee**: gateway, router, end device tùy biến trên CC253x, JN516x.
- **Embedded Linux**: Yocto, Buildroot, OpenWrt — IoT gateway, Qt HMI; cross-compile ứng dụng và build Linux distro from scratch.
- **SoC platforms**: i.MX7, AM335x, Allwinner (H3, H6, V3S, F1C100s), Rockchip (RK3399, RK3308).
- **Linux kernel & driver**: GPIO, I2C, SPI.

## Dự án

### Sản phẩm thương mại — [Smart Audio](https://epcb.vn/products/thiet-bi-am-thanh-va-giam-sat-am-ly-nha-yen-nesthouse-audio)

Thiết bị IoT điều khiển âm thanh và giám sát âm ly nhà yến:

- SoC MT7628 — 64 MB DRAM, 32 MB NOR flash, chạy OpenWrt
- Phát đồng thời 4 USB sound card
- RS485 gateway

![Smart Audio](https://user-images.githubusercontent.com/86546911/170808668-38c71286-4edb-4b3a-9446-c7092cc978e0.jpeg)

### Hobby — Yocto HMI với Allwinner F1C100s

<div class="video-embed">
  <iframe src="https://www.youtube.com/embed/XeEEIfbIYdg" title="Yocto HMI with Allwinner F1C100s" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
</div>

### Arduino Zigbee Shield

![Arduino Zigbee Shield](https://user-images.githubusercontent.com/86546911/173174115-d857a134-ecfc-4e16-bbdf-e5098cc04d06.jpeg)
