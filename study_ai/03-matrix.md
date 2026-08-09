---
sort: 3
image: /assets/images/og-study-ai-v2.jpg
---

# 3. Matrix Multiplication: phép toán quan trọng nhất trong AI

> Bài 3 trong loạt [AI cho kỹ sư nhúng](/study_ai/). Code trích trong bài thuộc repo
> [PLE TinyLM](https://github.com/ninhnn2/machineai) của
> [Viacheslav Sierbov (slvDev)](https://x.com/slvDev), giấy phép MIT. Bảng số ở mục
> Thực hành là đo trên máy thật, chạy lại được bằng một lệnh.

Nếu phải xoá 95% code của mọi framework AI (PyTorch, TensorRT, TIDL...) và chỉ giữ
lại một phép toán, bạn giữ lại **GEMM** (General Matrix Multiply). Trong repo này,
~90% thời gian mỗi token trên ESP32 nằm ở `matvec_q`/`matvec_q8`,
[`llm.h:115-198`](https://github.com/ninhnn2/machineai/blob/main/firmware/common/llm.h#L115), tức chính là GEMM, chỉ thu hẹp
về trường hợp một vector (batch=1). Chương này đi từ dot product một dòng lên tới
tại sao Jetson của bạn có "Tensor Core" và DSP TI có "MAC array".

## 3.1 Dot Product: viên gạch đầu tiên

Đã nói ở chương 1 (§1.3): `dot(a,b) = Σ aᵢbᵢ`. Trong C, đây là vòng lặp bạn viết
hàng trăm lần rồi:

```c
float dot(const float *a, const float *b, int n) {
    float acc = 0.f;
    for (int i = 0; i < n; i++) acc += a[i] * b[i];
    return acc;
}
```

Đây **chính xác** là thân vòng lặp trong `matvec_q_range`
([`llm.h:126-142`](https://github.com/ninhnn2/machineai/blob/main/firmware/common/llm.h#L126-L142)), chỉ khác `a[i]` được gỡ
ra từ nibble int4 và nhân với 1 scale sau khi cộng dồn. Mọi tối ưu ở chương này đều
xoay quanh việc làm nhanh hơn **đúng vòng lặp trên**.

## 3.2 Matrix × Vector (matvec)

```
y = W x           W: [rows, cols]   x: [cols]   y: [rows]
y[r] = dot(W[r, :], x)      -- MỖI HÀNG của W là một dot product với x
```

```c
void matvec(const float *W, const float *x, float *y, int rows, int cols) {
    for (int r = 0; r < rows; r++)
        y[r] = dot(&W[r * cols], x, cols);   // hàng r độc lập hoàn toàn với hàng khác
}
```

**Quan sát quan trọng nhất của cả chương:** các hàng **độc lập nhau**, hàng `r`
không cần biết gì về hàng `r+1`. Đây là lý do:
- có thể **chia hàng cho nhiều luồng/lõi** ([§3.9](#39-cache-optimization), bậc L4);
- có thể **chia hàng cho nhiều core LX7 của ESP32**, đúng thứ repo này làm với
  output head ([`RESULTS.md`](https://github.com/ninhnn2/machineai/blob/main/RESULTS.md), bước "head chạy 2 core");
- có thể **chia hàng cho nhiều warp GPU**, mỗi warp một hàng, xem
  [`docs/11 §11.3`](https://github.com/ninhnn2/machineai/blob/main/docs/11-toi-uu-nvidia.md).

Đây là kiểu song song **"embarrassingly parallel"**, không cần đồng bộ hoá giữa các
đơn vị tính, phần thưởng gần như tuyến tính theo số lõi cho tới khi bị chặn bởi thứ
khác (băng thông, xem [§3.7](#37-complexity)).

## 3.3 Matrix × Matrix

```
C = A B          A: [m, k]   B: [k, n]   C: [m, n]
C[i,j] = dot(A[i, :], B[:, j])
```

Matrix×Matrix chỉ là Matrix×Vector lặp lại `n` lần, mỗi cột của `B` là một vector
đầu vào riêng. Nhưng nó **không phải** `n` lần matvec độc lập về mặt hiệu năng: cùng
một hàng `A[i,:]` được **dùng lại** cho mọi cột `j`. Đây là chỗ khai sinh ra khái
niệm *arithmetic intensity*, xem [§3.7](#37-complexity), và là lý do GPU thực sự
toả sáng ở matmul (nhiều việc tái sử dụng dữ liệu) chứ không phải matvec (gần như
không tái sử dụng được gì, mỗi phần tử `W` chỉ dùng đúng 1 lần).

**Vì sao chuyện này quan trọng với bạn ngay bây giờ:** LLM decode (sinh từng token
một, đúng cách repo này chạy) là **matvec**, không phải matmul, batch=1. LLM prefill
(nạp cả prompt cùng lúc) mới là matmul thật. Đo được trên board thật
([`docs/09`](https://github.com/ninhnn2/machineai/blob/main/docs/09-so-do-phan-cung.md), Phát hiện 7): cùng phép GEMM, M=1 (decode)
chỉ đạt **0.8% năng lực tensor core**, M=512 (prefill) đạt đỉnh. Cùng công thức toán,
hiệu năng khác nhau hơn 100 lần, vì matvec không có gì để dùng lại.

## 3.4 Linear Layer

```python
# PyTorch
y = self.qkv(x)      # nn.Linear(D, 3D, bias=False) -- bên trong CHÍNH LÀ:  y = W x
```

`nn.Linear` không phải phép toán mới, nó là **tên gọi** cho matvec/matmul khi dùng
trong ngữ cảnh "một lớp mạng nơ-ron". `GEMM` là tên gọi khi dùng trong ngữ cảnh
"thư viện toán tuyến tính" (BLAS). Ba cái tên, một phép toán:

```
nn.Linear (PyTorch)  ==  GEMM (BLAS/cuBLAS)  ==  matvec_q (llm.h, repo này)
```

## 3.5 Convolution: im2col

CNN không nằm trong repo này (đây là model text-only), nhưng bạn sẽ gặp nó ngay khi
làm việc với camera/vision trên embedded (VLA, chương 10). Mẹo kinh điển: **biến
convolution thành matmul** bằng cách "trải" mỗi cửa sổ trượt thành một cột:

```
Convolution: mỗi vị trí output = dot(kernel, cửa sổ ảnh tương ứng)
im2col      : xếp MỌI cửa sổ thành các CỘT của một ma trận lớn
            → Conv2D(kernel, image)  =  matmul(kernel_phẳng, image_im2col)
```

Lý do làm vậy dù tốn thêm bộ nhớ (mỗi pixel bị lặp lại nhiều lần trong ma trận
im2col): **để tận dụng thư viện GEMM đã được tối ưu cực sâu** (cuBLAS, oneDNN, TIDL
TIDL-RT) thay vì viết vòng lặp convolution tay. Đánh đổi bộ nhớ lấy tốc độ, đúng
kiểu đánh đổi bạn đã quen từ lookup table trong DSP.

## 3.6 Attention: QKᵀ là matmul

Đây là chỗ nối thẳng chương 1 (dot product, projection) với transformer thật
(chương 6). Từ [`model.py:104`](https://github.com/ninhnn2/machineai/blob/main/src/model.py#L104):

```python
o = F.scaled_dot_product_attention(q, k, v, is_causal=True)
```

Bên trong, đúng như bản C viết tường minh ở
[`llm.h:329-342`](https://github.com/ninhnn2/machineai/blob/main/firmware/common/llm.h#L329-L342):

```
scores = (Q · Kᵀ) / √d_head        -- MỖI phần tử scores[i,j] = dot(q_i, k_j)
weights = softmax(scores)          -- chuẩn hoá thành xác suất
output  = weights · V              -- lại một phép matmul
```

Hai phép matmul (`Q·Kᵀ` và `weights·V`) là toàn bộ "trí thông minh" của attention.
`Q·Kᵀ` chính là **§1.3 nhân với chính nó ở quy mô lớn**: mỗi cặp token tính một dot
product để hỏi "token này liên quan tới token kia bao nhiêu". Đây cũng là lý do
attention tốn `O(T²)`, chương tiếp.

## 3.7 Complexity: FLOPs và Arithmetic Intensity

**FLOPs** (phép toán dấu phẩy động) đếm số phép nhân + cộng. Một matvec `[rows,cols]`:

```
FLOPs = 2 × rows × cols        (nhân rồi cộng, mỗi phần tử ma trận dùng đúng 1 lần)
```

| Phép toán | Độ phức tạp | Vì sao |
|---|---|---|
| matvec `[R,C]` | `O(R·C)` | mỗi phần tử ma trận 1 lần |
| matmul `[M,K]×[K,N]` | `O(M·K·N)` |, bậc 3, tăng rất nhanh theo kích thước |
| attention, 1 lớp | `O(T²·D)` | mọi cặp token (T) đều tính 1 dot product `D` chiều |

`O(T²)` là lý do context dài đắt: gấp đôi độ dài chuỗi → **gấp 4 lần** tính toán
attention (không phải gấp đôi). Đây là động lực chính sau các kỹ thuật giảm chi phí
attention (KV cache, chương 7, FlashAttention, [`docs/07`](https://github.com/ninhnn2/machineai/blob/main/docs/07-kv-cache-engine.md)).

**Arithmetic Intensity (AI)**, đại lượng quan trọng hơn cả FLOPs, quyết định bạn
đang bị chặn bởi *tính toán* hay bởi *bộ nhớ*:

```
AI = FLOPs thực hiện / byte đọc từ bộ nhớ
```

Với matvec (decode LLM), mỗi phần tử weight dùng **đúng 1 lần** rồi bỏ → AI cực
thấp → gần như luôn **memory-bound** (đang chờ bộ nhớ, không chờ ALU). Đây là chủ đề
trung tâm của [`docs/03-roofline.md`](https://github.com/ninhnn2/machineai/blob/main/docs/03-roofline.md), nếu chưa đọc, đọc ngay
sau chương này, nó là nền tảng quyết định mọi lựa chọn tối ưu phần cứng.

## 3.8 Hardware: ai thực hiện GEMM, và bằng cách nào

| Tầng | Tên gọi | Ở đâu | Ghi chú cho dân embedded |
|---|---|---|---|
| Thư viện chuẩn CPU | **BLAS** (OpenBLAS, MKL) | mọi CPU | tương đương "thư viện DSP tối ưu tay" (CMSIS-DSP) nhưng cho matmul |
| Thư viện chuẩn GPU | **cuBLAS** | NVIDIA GPU | BLAS viết lại cho hàng nghìn lõi song song |
| Đơn vị phần cứng CPU | **SIMD** (AVX2, NEON) | mọi CPU hiện đại | 1 lệnh xử lý 4-16 phần tử cùng lúc, bạn đã dùng cho FIR |
| Đơn vị phần cứng GPU | **Tensor Core** | NVIDIA Volta+ (kể cả Orin Nano) | mạch cứng chuyên nhân ma trận nhỏ (4×4 hoặc 16×16), không phải ALU thông thường |
| Đơn vị phần cứng DSP | **MAC array** | TI C66x/C7x, mọi DSP | *chính là* Tensor Core, tên gọi trước khi ngành AI mượn ý tưởng |
| Đơn vị phần cứng NPU | **Matrix Engine** | TI MMA (AM68A), Hexagon Tensor Accelerator... | MAC array chuyên biệt hoá thêm cho int8/int4 |

**Sự thật ít ai nói:** Tensor Core, NPU Matrix Engine, và DSP MAC array **là cùng
một ý tưởng phần cứng**: một mảng nhân-cộng (multiply-accumulate) chạy song song,
chuyên cho đúng một việc, GEMM, thay vì ALU đa năng phải giải mã lệnh từng bước.
Dân DSP phát minh MAC array trước ngành AI hàng chục năm cho FIR/FFT; ngành AI phát
hiện lại đúng ý tưởng đó ở quy mô lớn hơn.

**Kiểm chứng bằng số đo thật, ngay trên repo này:**

```
docs/09-so-do-phan-cung.md, Phát hiện 6, Orin Nano Super, đo thật:
  FP32 CUDA core (ALU thường)     :  1.88 TFLOP/s
  FP16 Tensor Core (cuBLAS)       : 11.66 TFLOP/s     <- nhanh hơn 6.2x, CÙNG SILICON
  INT8 Tensor Core (cuBLAS)       : 15.26 TOPS
```

Cùng một chip, chuyển từ ALU thường sang mạch MAC chuyên dụng cho GEMM: **6.2 lần**.
Đây chính xác là lý do TI bán riêng "AI accelerator" thay vì chỉ tăng xung DSP.

**Vì sao model của repo này KHÔNG dùng được Tensor Core.** Tensor Core chỉ có việc
làm khi ma trận đủ lớn (thường ≥16×16), tức khi có **matmul thật** (prefill, batch
lớn). Decode ở batch=1 là matvec, đúng bản CUDA của repo (`llm_cuda.cuh`) toàn dùng
CUDA core (ALU thường) fp32, không đụng Tensor Core, vì không có gì để nó nhân.

## 3.9 Cache Optimization: blocking, tiling, SIMD, prefetch

Bốn kỹ thuật này áp dụng y hệt cho cache CPU, SRAM MCU, và shared memory GPU,
chỉ đổi tên tầng bộ nhớ.

| Kỹ thuật | Ý tưởng | Ở repo này |
|---|---|---|
| **Cache blocking/Tiling** | chia ma trận lớn thành khối nhỏ **vừa cache**, xử lý xong 1 khối trước khi rời nó | `k_matvec_q4` trên GPU, 1 warp giữ hết 1 hàng trong register, không quay lại đọc từ VRAM ([`docs/11 §11.3`](https://github.com/ninhnn2/machineai/blob/main/docs/11-toi-uu-nvidia.md)) |
| **SIMD** | 1 lệnh xử lý nhiều phần tử, bạn đã dùng cho FIR | `matvec_ladder.c` bậc L3, xem Thực hành dưới |
| **Prefetch** | nạp trước dữ liệu sẽ cần, che độ trễ bộ nhớ | GPU: nhiều thread bay song song để che latency DRAM ([`docs/09` Phát hiện 4](https://github.com/ninhnn2/machineai/blob/main/docs/09-so-do-phan-cung.md)) |
| **Unpack-once** | gỡ dữ liệu nén (nibble int4) **một lần**, giữ lại bản đã gỡ, thay vì gỡ lại mỗi lần đọc | bậc L2 dưới đây, bậc thắng đậm nhất |

### Thực hành: đo cả 5 bậc trên chính CPU của bạn

Không cần GPU. Chạy được ngay:

```bash
make -C samples/cpu run
```

Kết quả đo **thật, trên máy dùng để viết tài liệu này** (x86, AVX2, 32 luồng):

```
bậc                        ms      GB/s     so L0     ghi chú
------------------------------------------------------------------------
L0 int4 + fp32           0.8761       0.3     1.00x   llm.h matvec_q -- mốc
L1 int4 + int8act        0.8050       0.3     1.09x
L2 int8 staged            0.1216      4.3     7.21x   gỡ nibble 1 LẦN (unpack-once)
L3 + SIMD                 0.0671      7.8    13.06x   AVX2
L4 + đa luồng             0.0315     16.6    27.77x   chia theo hàng (§3.2)
```

**Đọc kết quả như một kỹ sư, không như một cuộc đua:**
- **L2 thắng đậm nhất (7.2×) mà lại đọc gấp đôi byte** so với L0 (int8 thay vì
  int4). Vì sao vẫn nhanh hơn? Ở L0/L1, chi phí giải nén nibble mỗi lần đọc lớn
  hơn chi phí đọc thêm byte, máy đang **compute-bound**, không phải memory-bound
  (§3.7). Đổi dung lượng lấy tốc độ chỉ đáng khi đang compute-bound.
- **L3 (SIMD tay) chỉ được thêm 1.8×** sau khi đã unpack-once, vì phần lớn việc
  "khó" (giải nén) đã bị loại ở L2. Bài học: sửa đúng vấn đề (compute hay
  bandwidth) trước, viết SIMD sau. Viết SIMD trước khi biết mình compute-bound hay
  memory-bound là phí công.
- **L4 gần tuyến tính** (27.77 / 13.06 ≈ 2.1× dù không dùng đúng 2.1× số luồng) vì
  matvec là "embarrassingly parallel" (§3.2), không có phần chia sẻ trạng thái giữa
  các hàng.

```bash
make -C samples/cpu scaling      # tách lợi ích SIMD khỏi lợi ích đa luồng
```

### Cùng lệnh đó trên Apple Silicon, và một kết quả ngược đời

Đo trên MacBook Pro M3 với `model.bin` commit sẵn trong repo:

```
 SIMD: NEON+dotprod   luồng: 8   head [4096 x 128]

bậc                        ms      GB/s     so L0
------------------------------------------------------------------------
L0 int4 + fp32           0.3040       0.9     1.00x
L1 int4 + int8act        0.1920       1.4     1.58x
L2 int8 staged           0.0235      22.3    12.94x
L3 + SIMD                0.0135      38.9    22.57x
L4 + đa luồng            0.0210      25.0    14.51x    <- CHẬM HƠN L3
```

**Trước hết, đừng so hai bảng với nhau.** Bảng x86 ở trên đo trên output head của
model 28.9M, kích thước `[32768 x 96]`. Bảng này đo trên `model.bin` commit trong
repo, head chỉ `[4096 x 128]`, nhỏ hơn 8 lần. Cùng một chương trình, hai lượng công
việc khác nhau, nên chỉ đọc được **hình dạng** của mỗi thang, không đọc được ai
nhanh hơn ai.

Điều đáng học nằm ở bậc L4: **thêm luồng làm chậm đi**. Chương trình tự đo chi phí
mở một vùng song song rỗng trên chính máy đang chạy và in ra:

```
overhead OMP  0.0133 ms   so với  công việc thật  0.0135 ms
```

Chi phí mở vùng song song gần bằng toàn bộ công việc cần làm. Song song có một giá
cố định phải trả trước, và ở đây cái giá đó nuốt trọn phần lợi.

Đây cũng chính là hiện tượng đã gặp trên GPU ở
[`docs/11`](https://github.com/ninhnn2/machineai/blob/main/docs/11-toi-uu-nvidia.md): model nhỏ tới mức chi phí khởi động kernel
chiếm 50% thời gian mỗi token. Hai phần cứng khác hẳn nhau, cùng một nguyên nhân, và
nguyên nhân đó không phải "code chậm" mà là **việc quá nhỏ so với chi phí điều
phối**.

Chương trình còn quét kích thước batch để chỉ ra điểm hoà vốn:

```
     B 1 luồng ms   8 luồng ms   so sánh
     1     0.0146      0.0195     0.75x   1 luồng thắng
     2     0.0286      0.0227     1.26x   đa luồng thắng
     8     0.1160      0.0542     2.14x
   256     3.8438      0.9165     4.19x
```

Điểm hoà vốn nằm ở khoảng 13,7 microgiây công việc mỗi lần gọi. Dưới ngưỡng đó,
đừng song song hoá.


Trên ARM (điện thoại, Jetson CPU, hầu hết MCU AI), kết quả **khác hẳn**, bậc L3 hay
được **0%** vì trình biên dịch đã tự động vector hoá vòng lặp scalar, và không có gì
để hand-SIMD mua thêm. Đây là bài học chuyển giao quan trọng nhất của cả chương:
**đừng đoán, đo trên đúng silicon bạn deploy**, xem
[`docs/05-kien-truc-phan-cung.md`](https://github.com/ninhnn2/machineai/blob/main/docs/05-kien-truc-phan-cung.md) để có bảng đối
chiếu x86 vs ARM đầy đủ.

## Bài tập

1. Tính bằng tay FLOPs của output head cấu hình deploy (`V=32768, D=96`). So với
   FLOPs của một lớp FFN (`gate/up [F=66,D=96]`, `down [D,F]`). Cái nào tốn nhiều
   FLOPs hơn? Cái nào tốn nhiều **thời gian đo được** hơn (xem
   [`docs/08-nhat-ky-toi-uu.md`](https://github.com/ninhnn2/machineai/blob/main/docs/08-nhat-ky-toi-uu.md))? Nếu hai câu trả lời khác
   nhau, giải thích bằng khái niệm arithmetic intensity.
2. Chạy `make -C samples/cpu run` trên máy ARM nếu có (Raspberry Pi, điện thoại qua
   Termux, Jetson CPU). So bậc L3 với kết quả x86 ở trên.
3. Trong `llm.h`, tìm dòng code thực hiện chính xác `Q·Kᵀ`. Đối chiếu với công thức
   ở §3.6, biến nào trong code ứng với `Q`, `K`, `scores`?
4. TI TDA4VM có "MMA" (Matrix Multiply Accelerator) trong tài liệu C7x DSP. Tra
   datasheet, tìm TOPS của nó ở INT8. So với bảng ở §3.8, thứ hạng tương đối giữa
   ALU thường / SIMD / MAC array trên chip đó có giống bảng Orin Nano không?

→ Tiếp: [04-gradient.md](https://github.com/ninhnn2/machineai/blob/main/docs/begin_0/04-gradient.md), weight (chương 2) học được nhờ đại lượng
nào, và vì sao đại lượng đó lại chính là đạo hàm bạn học ở giải tích.

---

*Bài viết thuộc loạt [AI cho kỹ sư nhúng](/study_ai/). Góp ý: mở issue tại
[github.com/ninhnn2/machineai](https://github.com/ninhnn2/machineai/issues).*
