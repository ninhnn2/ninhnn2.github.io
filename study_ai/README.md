---
sort: 6
image: /assets/images/og-study-ai-v2.jpg
---

# AI cho kỹ sư nhúng

Mình bắt đầu học AI từ một vị trí khá khác với nhiều người: đã quen với C, firmware,
buffer, DMA, fixed-point và đọc memory map, nhưng lại không thực sự hiểu bên trong
một model AI đang làm gì.

Vì vậy mình gom lại những gì mình học được trong series này.

Mình bắt đầu từ những thứ rất cơ bản (**vector, matrix, tích vô hướng**) rồi đi dần
đến **embedding, Transformer, attention, quantization và runtime**. Mục tiêu cuối
cùng không phải là biết gọi một API để chạy model, mà là có thể mở code lên và hiểu:

> **dữ liệu đang ở đâu, phép toán nào đang được thực hiện, và tại sao nó tốn từng ấy
> thời gian và bộ nhớ.**

Cuối cùng, mình muốn đưa một LLM thực sự lên phần cứng chỉ có **512KB SRAM**.

## Mình đang học những gì?

Series đi qua ba lớp, nhưng mình không cố tách chúng thành những môn riêng biệt.

**Đầu tiên là toán.**

Vector, matrix, tích vô hướng, gradient, backpropagation.

Phần này giờ có loạt bài riêng, viết cho người chỉ cần biết toán tới lớp 9:
[**Toán cho AI nhúng**](/study_ai/toan/). Bảy bài, mỗi phép toán đi từ công thức
tới ví dụ tính tay, rồi tới vòng `for` trong C, rồi tới phần cứng. Mỗi bài có một
hình hình học vẽ đúng tỉ lệ từ chính model đã train.

Đây là những thứ tưởng khá xa AI, nhưng khi nhìn từ góc độ embedded thì lại có rất
nhiều thứ quen thuộc: mảng số, phép nhân-cộng, convolution, accumulation...

**Sau đó là model.**

Embedding, attention, Transformer, KV cache, sampling.

Đây là lúc những phép toán ở phần trước bắt đầu ghép thành một model hoàn chỉnh.
Thay vì chỉ biết `model.generate()`, mình muốn hiểu từng khối bên trong đang làm gì.

**Cuối cùng là runtime.**

Quantization, memory hierarchy, performance, ONNX Runtime, TensorRT, TIDL...

Đây là phần mình thấy kinh nghiệm embedded bắt đầu phát huy tác dụng rõ nhất: model
nằm ở đâu, dữ liệu đi qua memory thế nào, bottleneck nằm ở compute hay bandwidth, và
một model lớn đến mức nào thì còn có thể nhét lên thiết bị.

Mình cố giữ một nguyên tắc xuyên suốt:

> **Nếu có thể chỉ vào code và đo được thì mình sẽ không chỉ nói bằng công thức.**

Nói về `RMSNorm` thì mở đúng dòng code đang thực hiện nó. Nói về memory thì xem trực
tiếp `model.bin`. Nói một phép toán mất bao lâu thì chạy benchmark thay vì đoán.

## Không chỉ riêng ESP32

ESP32-S3 là con chip của repo mình học theo (xem mục dưới), và nó là một cái mốc
tốt vì nhỏ tới mức mọi thứ lãng phí đều lộ ra ngay. Nhưng thứ mình thật sự muốn hiểu
là **một model gặp một loại silicon thì chuyện gì xảy ra**, và chuyện đó lặp lại gần
như y hệt trên mọi nền:

| Silicon | Đơn vị tăng tốc | Runtime | Ở series này |
|---|---|---|---|
| **ESP32-S3** (Xtensa LX7) | không có, chỉ SIMD hẹp | C thuần, tự viết | mốc chính, chạy thật |
| **CPU** x86-64 / ARM / Apple Silicon | AVX2, NEON | C thuần + OpenMP | benchmark chạy được ngay trên máy bạn |
| **NVIDIA** Jetson, GPU rời | Tensor Core | CUDA, TensorRT | runtime thật trong repo, và chương 9 |
| **TI** TDA4VM, AM68A, AM69A | **C7x DSP + MMA** | TIDL qua ONNX Runtime EP | chương 9, ánh xạ từng khái niệm sang TensorRT |
| **Qualcomm** Snapdragon | **Hexagon Tensor Accelerator** | QNN, SNPE | mới nhắc ở chương 3, như một biến thể của cùng một MAC array |

Điều mình thấy thú vị nhất khi đọc chéo: xem tài liệu TIDL của TI sau khi đã hiểu
TensorRT thì gần như không có gì mới. Cùng một bài toán (cắt đồ thị thành subgraph,
calibrate INT8, op nào không nuốt được thì rơi về CPU), chỉ khác tên gọi và khác nhà
sản xuất. Hiểu một cái là đọc được cái còn lại, và đó mới là thứ đáng học chứ không
phải thuộc lòng API của một hãng.

## Những thứ mình không đi theo

Series này không nhằm trở thành một khóa học data science đầy đủ.

Mình không đi vào:

* prompt engineering hay cách sử dụng API của các model thương mại;
* pandas, thống kê và quy trình phân tích dữ liệu;
* training các foundation model quy mô lớn;
* computer vision như một chuyên ngành riêng.

Computer vision chỉ xuất hiện khi cần để nối sang những hướng như VLA và robot.

Thứ mình muốn hiểu nằm ở giao điểm giữa **AI và embedded**: nhìn một tensor PyTorch
và biết nó sẽ trở thành những byte nào trong runtime; nhìn một vòng `for` trong C và
nhận ra nó đang thực hiện phép toán nào của model.

## Repo mình học theo

**PLE TinyLM không phải project của mình.**

Nó là công trình của [**Viacheslav Sierbov (slvDev)**](https://x.com/slvDev), phát
hành theo giấy phép MIT. Toàn bộ phần khó đều là của tác giả gốc: ý tưởng đưa
Per-Layer Embeddings của Gemma xuống một MCU, cách chia weight theo kiểu truy cập để
25 triệu tham số nằm được trong flash, runtime C viết tay cho Xtensa, và những con số
đo trên board thật.

Việc của mình đơn giản hơn nhiều: clone về, đọc, chạy lại, đo lại trên máy mình, rồi
viết xuống những gì hiểu được. Series này là **ghi chép của người đọc code**, không
phải bài giới thiệu của người viết ra nó. Bản mình dùng để nghịch nằm ở
[github.com/ninhnn2/machineai](https://github.com/ninhnn2/machineai).

Vì sao mình chọn học từ repo này: nó là một LLM khoảng **28,9 triệu tham số** chạy
được thật trên **ESP32-S3**, chứ không phải một ví dụ đồ chơi.

Điều mình thích ở repo này là cùng một file `model.bin` đi qua được nhiều tầng phần
cứng khác hẳn nhau:

```text
              src/model.py  (PyTorch)
                     │
                     │ export
                     ▼
                  model.bin
                     │
      ┌──────────────┼──────────────┐
      ▼              ▼              ▼
  ESP32-S3          CPU          Jetson
  Xtensa LX7    x86 / ARM /       CUDA
  C thuần       Apple Silicon
```

Cùng một thuật toán, nhưng đổi phần cứng thì bottleneck cũng đổi theo. Trên ESP32
nghẽn nằm ở băng thông đọc weight; trên Jetson thì model lại nhỏ tới mức chi phí
khởi động kernel mới là thứ chiếm phần lớn thời gian.

Đó là một trong những thứ mình muốn tự kiểm chứng bằng benchmark thay vì chỉ đọc lý
thuyết.

## Nếu bạn đã làm embedded

Bạn sẽ không cần biết trước machine learning để bắt đầu.

Nếu đã quen với C, pointer, buffer, fixed-point, DMA và memory thì càng tốt. Python
chỉ xuất hiện vừa đủ để đọc checkpoint, inspect tensor và chạy một số experiment.

Cũng không cần GPU để bắt đầu. Phần lớn experiment chạy được trên CPU, kể cả Apple
Silicon.

Điểm xuất phát của series chính là **vector**, một thứ nhìn rất đơn giản, nhưng lại
là nền móng của gần như toàn bộ phần còn lại.

## Series

| # | Chủ đề | Trạng thái |
|---|---|---|
| D | [**Demo: Một token được xử lý như thế nào**](demo-token.html) | tương tác, số thật từ checkpoint |
| D2 | [**Demo: nhìn AI học**](demo-learn.html) | tương tác, chain rule tay so với autograd |
| D3 | [**Demo: FP32 tới INT4 tới silicon**](demo-quant.html) | số giải nén từ chính model.bin |
| P | [Dataset: TinyStories có gì bên trong](dataset-tinystories.html) | phụ lục, số đo trên file 315 MB |
| 1 | [Vector: dữ liệu trong AI](01-vector.html) | đã đăng |
| 2 | [Weight: kiến thức của mô hình](02-weight.html) | đã đăng |
| 3 | [Matrix Multiplication: phép toán ăn 90% thời gian](03-matrix.html) | đã đăng |
| 4 | Gradient: mô hình học bằng cách nào | đang viết |
| 5 | Backpropagation | đang viết |
| 6 | Transformer thật: ráp những viên gạch đầu tiên | đang viết |
| 7 | KV Cache và Token Sampling | đang viết |
| 8 | Quantization: từ Q15 bạn đã biết tới int4 | đang viết |
| 9 | Runtime: TensorRT, ONNX Runtime, TIDL | đang viết |
| 10 | VLA: mô hình ngôn ngữ cho robot | đang viết |

Các chương chưa đăng mình cũng giữ trong
[`docs/`](https://github.com/ninhnn2/machineai/tree/main/docs) của repo.

{% include list.liquid all=true %}
