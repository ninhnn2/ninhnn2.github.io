---
sort: 2
---

# 2. Weight — kiến thức của mô hình

> Bài 2 trong loạt [AI cho kỹ sư nhúng](/study_ai/). Bài này giả định bạn đã đọc
> [bài 1 — Vector](/study_ai/01-vector.html): weight chỉ là những vector và ma trận,
> nên mọi thứ nói ở bài 1 vẫn dùng nguyên ở đây.

Nếu vector (chương 1) là **dữ liệu**, weight là **cái biến dữ liệu này thành dữ liệu
khác**. Toàn bộ "trí tuệ" của một model — 28.9 triệu tham số trong repo này — nằm ở
weight. Không có gì khác. Không có luật `if`, không có lookup table thủ công (bảng
PLE cũng là weight, chỉ khác cách *truy cập* — xem [§2.6](#26-weight-trong-transformer)).

## 2.1 Weight là gì

Nhớ lại một buổi làm việc rất cụ thể: bạn thiết kế một bộ lọc FIR. Bạn ngồi chọn
`h[0], h[1], ..., h[N-1]` — bằng Parks-McClellan, bằng cửa sổ Hamming, hoặc chỉnh
tay tới khi đáp ứng tần số đúng ý. Chọn xong, bộ hệ số đó nằm trong firmware và
**cố định mãi mãi**.

Giờ đặt hai công thức cạnh nhau:

```
FIR:  y[n] = Σ h[k] · x[n-k]           h[k] : bạn thiết kế bằng tay, cố định mãi mãi
NN :  y    = Σ w[i] · x[i]     (+ b)   w[i] : khởi tạo ngẫu nhiên, học dần qua triệu bước
```

Cùng một phép toán, không lệch một dấu: tích vô hướng giữa vector hệ số và vector dữ
liệu — đúng cái bạn vừa gặp ở [§1.3](/study_ai/01-vector.html#13-khoảng-cách-giữa-các-vector).
Khác biệt duy nhất nằm ở **ai chọn hệ số**. Bạn chọn `h[k]`; còn `w[i]` thì không ai
chọn cả — gradient descent (chương 4) dò ra chúng bằng cách thử hàng triệu lần trên
dữ liệu.

Đến đây thì định nghĩa chỉ là đặt tên cho thứ vừa nhìn thấy: **weight là hệ số nhân,
học từ dữ liệu thay vì thiết kế bằng tay.**

Và vì phép toán y hệt nhau, hệ quả rất thực dụng: **mọi kỹ năng tối ưu bạn có với
FIR — fixed-point, SIMD, cache blocking — áp dụng thẳng vào weight**, xem chương 3
và 8.

## 2.2 Bias

Thử một trường hợp cụ thể. Lớp Linear tính `y = Wx`. Cho `x = 0` thì `y = 0` — luôn
luôn, bất kể `W` bằng bao nhiêu. Nói cách khác, hàm số này **bắt buộc đi qua gốc toạ
độ**, không có cách nào khác.

Nếu thứ cần biểu diễn lại không đi qua gốc thì sao? Thêm một hằng số vào là xong:

```
y = Wx + b
```

`b` là **hằng số cộng thêm**, không nhân với đầu vào — chính là DC offset trong xử lý
tín hiệu. Nó dịch cả hàm số lên/xuống mà không đổi độ dốc. Tên gọi của nó là **bias**.

**Chi tiết cần biết ngay ở repo này:** hầu hết lớp Linear trong `model.py` khai
`bias=False`:

```python
# model.py:93
self.qkv = nn.Linear(cfg.d_model, 3 * cfg.d_model, bias=False)
```

Đây là thiết kế phổ biến trong LLM hiện đại (Llama, Gemma, Qwen đều bỏ bias ở hầu
hết lớp). Lý do thực dụng: RMSNorm đứng trước mỗi lớp Linear đã chuẩn hoá phân bố
đầu vào quanh 0, nên bias gần như không đóng góp gì cho chất lượng, mà vẫn tốn tham
số và tốn một phép cộng mỗi lần suy luận. Kiểm tra được ngay: mở
[`firmware/common/llm.h`](https://github.com/ninhnn2/machineai/blob/main/firmware/common/llm.h), hàm `matvec_q` không có
tham số bias nào — vì không cần.

## 2.3 Weight được lưu ở đâu

Đây là câu hỏi một kỹ sư embedded hỏi trước tiên, và đúng là câu hỏi **trung tâm của
toàn bộ repo này**. Bảng dưới đối chiếu bộ nhớ bạn đã quen với vai trò của nó trong AI:

| Bộ nhớ | Bạn đã dùng nó để | Ở đây dùng để lưu weight nào | Vì sao |
|---|---:|---|---|
| **SRAM** (nội bộ, nhanh nhất) | biến cục bộ, ngăn xếp, DMA buffer | **core**: attention, FFN, PLE gate — 558K tham số | đọc **mỗi token**, ngẫu nhiên → phải nhanh |
| **PSRAM** (ngoài chip, trung bình) | framebuffer, heap lớn | **stream**: output head (tied embedding) — 3.1M tham số | đọc **tuần tự toàn bộ** mỗi token → cần băng thông, không cần độ trễ thấp |
| **Flash** (chậm nhất, lớn nhất) | firmware, bảng lookup tĩnh | **table**: bảng PLE — 25M tham số | mỗi token chỉ đọc **6 hàng** (~450B) → gần như miễn phí dù chậm |
| **DDR/VRAM** (trên Jetson/PC) | RAM hệ thống | toàn bộ weight, khi model đủ lớn để cần | GB/s quyết định tok/s, xem chương 3 |
| **GPU Memory** | — | weight khi chạy CUDA | băng thông ~100 GB/s trên Jetson Orin Nano (đo thật, xem `docs/09`) |

Ba tầng đầu **chính là ba tầng vật lý thật của ESP32-S3** mà repo này build cho.
Phân loại không dựa trên "nhanh/chậm" mà dựa trên **cách bị đọc** — đây là ý tưởng
quan trọng nhất của toàn bộ codebase, viết thành comment trong
[`src/budget.py:8-21`](https://github.com/ninhnn2/machineai/blob/main/src/budget.py#L8-L21):

```python
"""
  core    dense, random access, every token.
          -> must be SRAM-resident. The genuinely scarce budget.
  stream  dense, but read as one sequential scan per token.
          -> costs BANDWIDTH, not SRAM capacity.
  table   sparse: one row per token.
          -> ideal for memory-mapped flash.

Treating `stream` as if it were `core` is what made large vocabularies look
unaffordable, when in fact they are merely slow.
"""
```

### Thực hành 1 — nhìn 3 tầng trên chính cấu hình bạn chọn

```bash
cd src && uv run python budget.py                 # cấu hình deploy 28.9M mặc định
uv run python budget.py --bits 8                  # thử 8-bit thay vì 4-bit
```

Kết quả (rút gọn):

```
core     558 K  (1.9%)   273 KB @4-bit   → vừa SRAM 320KB
stream  3.15 M  (11%)    output head     → 17.3 ms/token (đo thật trên chip)
table    25 M   (87%)    ple_table       → 0.12 ms/token dù nặng gấp 8 lần
```

**87% số tham số của model gần như miễn phí** vì cách nó bị đọc, không vì nó nhỏ.
Đây là bài học chuyển giao thẳng sang mọi SoC bạn từng làm việc: hỏi "cái này được
đọc theo pattern nào" trước khi hỏi "cái này nặng bao nhiêu byte".

## 2.4 Khởi tạo weight

Trước khi học được gì, weight phải mang một giá trị ban đầu. Thử phương án đơn giản
nhất — cái ai cũng nghĩ tới đầu tiên khi khai một mảng trong C — là cho tất cả bằng
0, rồi lần theo hậu quả:

- mọi neuron trong cùng một lớp nhận cùng đầu vào, nhân cùng hệ số 0, nên cho ra
  **cùng một giá trị**;
- đầu ra giống nhau thì gradient của chúng (chương 4) cũng **giống hệt nhau**;
- gradient giống nhau thì bước cập nhật giống nhau — chúng vẫn bằng nhau sau bước 1,
  sau bước 2, và **mãi mãi về sau**.

Kết cục: một lớp khai 10.000 neuron hoạt động đúng như **một** neuron. Hiện tượng đó
có tên riêng, *symmetry breaking failure*, và nó là lý do weight luôn phải khởi tạo
**ngẫu nhiên**:

```python
# model.py:193-197
def _init(self, m):
    if isinstance(m, nn.Linear):
        nn.init.normal_(m.weight, std=0.02)
    elif isinstance(m, nn.Embedding):
        nn.init.normal_(m.weight, std=0.02)
```

`std=0.02` không phải số ma thuật — nó là quy ước từ GPT-2 (Radford et al.),
đủ nhỏ để hoạt động ban đầu gần tuyến tính (tránh bão hoà activation), đủ lớn để phá
đối xứng. Hai chiến lược init phổ biến hơn cho mạng sâu, để biết tên khi gặp trong
tài liệu khác:

| Chiến lược | Công thức (rút gọn) | Dùng khi |
|---|---|---|
| **Xavier/Glorot** | `std = √(2 / (fan_in + fan_out))` | activation đối xứng quanh 0 (tanh, linear) |
| **Kaiming/He** | `std = √(2 / fan_in)` | activation ReLU-họ (chỉ giữ nửa dương, cần bù hệ số 2) |

Cả hai đều giải cùng một bài toán: giữ **phương sai của activation ổn định qua các
lớp**. Init sai làm activation nổ hoặc chết dần qua nhiều lớp — đúng cơ chế sẽ gặp
lại ở *exploding/vanishing gradient* (chương 4.7–4.8), vì lan truyền tiến (forward)
và lan truyền ngược (backward) chịu chung một vấn đề nhân dồn qua nhiều lớp.

**Chi tiết load-bearing trong repo này** — hai kiểu init đặc biệt, cả hai đều có lý
do ghi thẳng trong code:

```python
# model.py:172-175 — các lớp GHI VÀO residual (proj, down) khởi tạo NHỎ HƠN
if n.endswith("proj.weight") or n.endswith("down.weight"):
    nn.init.normal_(p, std=0.02 / math.sqrt(2 * cfg.n_layers))
```
Càng nhiều lớp, residual càng cộng dồn nhiều lần → mỗi lớp phải đóng góp *ít hơn* để
tổng không nổ. Đây là kỹ thuật gốc từ GPT-2.

```python
# model.py:186-187 — nhánh PLE khởi tạo là NO-OP tuyệt đối tại bước 0
if cfg.uses_per_layer:
    nn.init.zeros_(block.ple_norm.weight)
```
`RMSNorm` có `weight` nhân sau cùng — đặt nó = 0 thì cả nhánh PLE, dù tính toán đầy
đủ, cho ra output = 0, cộng vào residual không đổi gì. Lý do (comment gốc): nếu
không, mọi nhánh (`baseline`, `ple`, `bigcore`...) bắt đầu từ những hàm số **khác
nhau ngay ở bước 0** — bạn sẽ đo "may mắn khởi tạo" chứ không phải "khả năng học".
Đây là kỷ luật thực nghiệm đáng học: **khi so sánh, loại bỏ mọi khác biệt không phải
là biến bạn đang đo.**

## 2.5 Weight thay đổi như thế nào

Đây là toàn bộ vòng lặp huấn luyện, lấy nguyên văn từ
[`train.py`](https://github.com/ninhnn2/machineai/blob/main/src/train.py). Bốn dòng, chạy lặp vài nghìn lần — không có gì
thêm:

```python
opt.zero_grad(set_to_none=True)   # xoá gradient bước trước (không cộng dồn)
loss.backward()                    # tính gradient MỌI weight, một lượt (chương 5)
torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)  # chặn gradient quá lớn
opt.step()                         # thật sự cập nhật weight (AdamW, xem chương 4)
```

Bốn thứ vừa xuất hiện trong bốn dòng đó, gọi cho đúng tên — chi tiết toán ở chương 4,
đây chỉ là bản đồ:

```
gradient        = hướng làm loss TĂNG nhanh nhất, tính theo từng weight (∂Loss/∂w)
learning rate   = bước đi bao xa theo hướng NGƯỢC gradient
optimizer       = quy tắc dùng gradient để cập nhật weight (không chỉ trừ thẳng)
update          = w_mới = w_cũ - learning_rate × (gradient đã qua optimizer)
```

## 2.6 Weight trong Transformer

Mỗi cái tên dưới đây bạn sẽ gặp lại ở chương 6. Ở đây chỉ cần nhớ: **tất cả đều chỉ
là ma trận weight**, khác nhau ở việc nó nhân với gì và bị đọc theo pattern nào.

| Tên | Shape (cấu hình deploy) | Vai trò | Tầng bộ nhớ (§2.3) |
|---|---|---|---|
| **Embedding Table** | `[V=32768, D=96]` | tra 1 hàng theo token id | stream (tied với head) |
| **Q/K/V Weight** | gộp `[3D, D]` trong 1 ma trận `qkv` | tạo ra vector Query/Key/Value cho attention | core |
| **MLP Weight** | `gate/up [F,D]`, `down [D,F]` | biến đổi phi tuyến từng token | core |

`Q/K/V` **không phải ba lớp riêng biệt** trong code này — chúng gộp thành một ma
trận `[3D, D]` rồi cắt ra sau khi nhân, vì nhân một ma trận lớn nhanh hơn nhân ba
ma trận nhỏ trên phần cứng thật (ít lần khởi động kernel/lệnh hơn — đúng bài học
"launch overhead" ở [`docs/11`](https://github.com/ninhnn2/machineai/blob/main/docs/11-toi-uu-nvidia.md)):

```python
# model.py:93, 99
self.qkv = nn.Linear(cfg.d_model, 3 * cfg.d_model, bias=False)
q, k, v = self.qkv(x).split(C, dim=2)
```

Bảng embedding và **bảng PLE** ([§2.3](#23-weight-được-lưu-ở-đâu), tầng `table`) là
cùng một Ý TƯỞNG: một weight matrix `[V, ...]`, nhưng thay vì *nhân* toàn bộ ma trận
với đầu vào, ta **tra một hàng** theo token id (`nn.Embedding`). Đây chính là ranh
giới giữa "weight dùng để nhân" và "weight dùng để tra cứu" — và ranh giới đó quyết
định toàn bộ kiến trúc bộ nhớ của repo này (chi tiết toán ở
[`../02-hieu-model.md`](https://github.com/ninhnn2/machineai/blob/main/docs/02-hieu-model.md), mục 4.3 "Tham số nằm ở ĐÂU").

## 2.7 Quantization — giới thiệu nhanh (chi tiết ở chương 8)

Bạn đã làm việc này rồi, chỉ dưới tên khác: **Q15 fixed-point**. Chuyển từ `float`
sang `int16` với 1 hệ số scale cố định — chính xác là những gì quantization AI làm,
chỉ khác ở việc scale được **tính tự động cho từng nhóm weight** thay vì cố định
toàn cục.

| Định dạng | Bit/giá trị | Dùng khi | Tương đương embedded |
|---|---:|---|---|
| **FP32** | 32 | Train (cần gradient chính xác) | `float` trên MCU có FPU |
| **FP16 / BF16** | 16 | Train/suy luận trên GPU | không có tương đương MCU phổ biến |
| **INT8** | 8 | Suy luận, cân bằng tốc độ/chất lượng | gần với Q7 |
| **INT4** | 4 (+ scale) | Suy luận trên thiết bị siêu nhỏ | không có tương đương chuẩn, chip AI đời mới mới hỗ trợ |

Model trong repo này lưu ở **int4 group-wise**: mỗi nhóm 64 hoặc 128 giá trị liên
tiếp trong một hàng dùng chung 1 scale `fp16`. Xem chi tiết đầy đủ, kể cả cách đo
"lượng tử hoá làm hỏng bao nhiêu", ở [chương 8](https://github.com/ninhnn2/machineai/blob/main/docs/begin_0/08-quantization-nhung.md).

## Bài tập

1. Trong `model.py`, tìm **tất cả** các lớp `bias=True` (nếu có) hoặc chứng minh
   không có lớp nào. Vì sao `RMSNorm.weight` ([`model.py:68`](https://github.com/ninhnn2/machineai/blob/main/src/model.py#L68))
   không bị coi là bias dù nó cũng là một hằng số nhân?
2. Tự khởi tạo một ma trận `[4, 4]` toàn số 0, cho qua 2 lớp `nn.Linear` không bias,
   backward một loss bất kỳ. In gradient của từng hàng — chứng minh bằng số thật
   rằng chúng giống hệt nhau (symmetry breaking failure ở §2.4).
3. Chạy `uv run python budget.py --bits 8`. Bộ nhớ Flash cần cho bảng PLE tăng bao
   nhiêu MB so với 4-bit? Có còn vừa 16MB flash của ESP32-S3-N16R8 không?
4. Đối chiếu bảng §2.3 với sơ đồ bộ nhớ của một SoC bạn từng làm việc (ví dụ
   STM32H7: TCM/SRAM/QSPI Flash, hoặc AM62x: OCMC/DDR). Bạn sẽ đặt "core" ở đâu?

→ **Bài tiếp theo: Matrix Multiplication.** Phép toán duy nhất chiếm ~90% thời gian
chạy của mọi LLM. Bài đang viết; bản nháp đầy đủ có sẵn ở
[`docs/begin_0/03-matrix-nhan.md`](https://github.com/ninhnn2/machineai/blob/main/docs/begin_0/03-matrix-nhan.md)
trong repo.

---

*Bài viết thuộc loạt [AI cho kỹ sư nhúng](/study_ai/). Góp ý hoặc báo lỗi: mở issue tại
[github.com/ninhnn2/machineai](https://github.com/ninhnn2/machineai/issues).*
