---
sort: 6
image: /assets/images/og-study-ai.jpg
---

# AI cho kỹ sư nhúng

Chuyên mục này là một giáo trình AI viết riêng cho người đã làm firmware — không
phải bản dịch của một khoá data science, cũng không phải hướng dẫn dùng ChatGPT.

## Học AI gì ở đây

Mục tiêu duy nhất: **hiểu một mô hình ngôn ngữ (LLM) tới mức đọc được từng dòng của
nó, rồi tự tay chạy được nó trên phần cứng có 512KB SRAM.**

Cụ thể là học đủ ba tầng, theo đúng thứ tự một kỹ sư nhúng cần:

| Tầng | Nội dung | Vì sao cần |
|---|---|---|
| **Toán nền** | vector, ma trận, gradient, backpropagation | không có tầng này thì mọi tầng trên chỉ là gọi thư viện |
| **Kiến trúc** | embedding, attention, transformer, KV cache, sampling | để biết thời gian chạy đi đâu, chứ không chỉ biết gọi `model.generate()` |
| **Triển khai** | quantization, memory hierarchy, roofline, TensorRT / ONNX / TIDL | phần mà kỹ sư nhúng có lợi thế hơn hẳn dân ML thuần |

Điểm khác biệt so với phần lớn tài liệu AI tiếng Việt: **mọi khái niệm đều được neo
vào code chạy được và số đo thật**, không dừng ở công thức. Nói `RMSNorm` thì chỉ ra
đúng dòng trong `model.py`; nói "ma trận nhân tốn bao lâu" thì có lệnh để bạn tự đo
trên chính CPU của mình; nói "model 28.9M vừa 16MB flash" thì có file `model.bin` để
bạn `hexdump`.

## Học AI gì thì KHÔNG có ở đây

Nói rõ ngay từ đầu để bạn khỏi mất thời gian:

- **Không** dạy prompt engineering hay cách dùng API của các mô hình thương mại.
- **Không** dạy data science, pandas, thống kê, hay quy trình phân tích dữ liệu.
- **Không** dạy train mô hình nền tảng quy mô lớn — chuyện đó cần hàng nghìn GPU.
- **Không** dạy computer vision như một chuyên ngành riêng (chỉ chạm khi nói VLA cho
  robot ở chương cuối).

Đổi lại, thứ bạn nhận được là năng lực hiếm: **đứng giữa hai thế giới AI và embedded
mà dịch qua lại được** — nhìn một tensor PyTorch và biết nó nằm ở byte offset nào
trong flash, nhìn một vòng `for` trong C và biết nó đang tính lớp nào của mạng.

## Bãi thực hành

Toàn bộ giáo trình bám vào một repo mã nguồn mở:
[**PLE TinyLM**](https://github.com/ninhnn2/machineai) — một mô hình ngôn ngữ
**28,9 triệu tham số chạy trên ESP32-S3**, con chip giá khoảng 8 đô, tốc độ ~9,5
token/giây, không cần mạng, không gửi gì lên server.

Điều làm repo này thành bãi tập tốt là **cùng một file `model.bin` chạy trên ba kiến
trúc khác hẳn nhau**:

```
src/model.py (PyTorch)  ──export──>  model.bin  ──┬──> ESP32-S3   (Xtensa LX7, C thuần, không OS)
                                                  ├──> CPU        (x86-64 / ARM / Apple Silicon)
                                                  └──> Jetson     (CUDA)
```

Cùng một thuật toán, ba nút thắt hiệu năng khác nhau. So sánh đó chính là bài học —
và nó chỉ hiện ra khi bạn tự đo, không ai kể lại thay được.

## Yêu cầu đầu vào

Bạn cần biết C và quen với tư duy nhúng (con trỏ, bộ nhớ, fixed-point, DMA). Không
cần biết Python nâng cao, **không cần biết gì về AI**, và **không cần GPU** — 8 trên
10 chương chạy được trên laptop, kể cả MacBook Apple Silicon (dùng MPS) hay một máy
x86-64 chỉ có CPU.

## Lộ trình

| # | Bài | Trạng thái |
|---|---|---|
| 1 | [Vector — dữ liệu trong AI](01-vector.html) | đã đăng |
| 2 | [Weight — kiến thức của mô hình](02-weight.html) | đã đăng |
| 3 | Matrix Multiplication — phép toán ăn 90% thời gian | đang viết |
| 4 | Gradient — mô hình học bằng cách nào | đang viết |
| 5 | Backpropagation | đang viết |
| 6 | Transformer thật — ráp 5 viên gạch đầu tiên | đang viết |
| 7 | KV Cache và Token Sampling | đang viết |
| 8 | Quantization — từ Q15 bạn đã biết tới int4 | đang viết |
| 9 | Runtime: TensorRT, ONNX Runtime, TIDL | đang viết |
| 10 | VLA — mô hình ngôn ngữ cho robot | đang viết |

Bản đầy đủ của giáo trình (kể cả các chương chưa đăng ở đây) nằm trong
[`docs/`](https://github.com/ninhnn2/machineai/tree/main/docs) của repo.

{% include list.liquid all=true %}
