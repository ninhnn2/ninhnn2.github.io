---
sort: 4
image: /assets/images/og-study-ai-v2.jpg
---

# Bài 3: Phép trên từng phần tử, phép rút gọn, và softmax

> Giai đoạn 3 của roadmap. Cần bài 1 và bài 2.
>
> Bài 3 trong loạt [Toán cho AI nhúng](/study_ai/toan/). Mọi con số trong bài đo
> trên MacBook Pro M3 và kiểm bằng `docs/toan/tools/so_that.py` trong repo
> [PLE TinyLM](https://github.com/ninhnn2/machineai), bản gốc của
> [Viacheslav Sierbov (slvDev)](https://x.com/slvDev), giấy phép MIT.

## 3.0 Một con số làm hỏng cả chương trình

Thử tính `e` mũ 1000 trên máy:

```python
>>> import math
>>> math.exp(1000)
OverflowError: math range error
```

Với PyTorch nó không báo lỗi, nó trả về `inf`, và `inf` lặng lẽ lan ra khắp phép
tính phía sau cho tới khi kết quả cuối cùng thành `nan`.

Điều khó chịu là công thức toán ở đó **hoàn toàn đúng**. Softmax thật sự có
`exp` trong đó. Chỉ là viết đúng công thức chưa đủ để chương trình chạy được.

Bài này đi qua nhóm phép toán còn lại của một Transformer, và kết thúc ở chỗ sửa
đúng lỗi trên bằng một mẹo dài một dòng.

```bash
uv run python docs/toan/tools/so_that.py --giai-doan 3
```

## 3.1 Phép trên từng phần tử

Bài 1 đã gặp loại này: làm cùng một việc lên từng ô, các ô không nói chuyện với
nhau.

```
y[i] = f(x[i])
```

Ví dụ với `x = [1, 2, 3]` và `w = [4, 5, 6]`:

```
x * w   = [4, 10, 18]        nhân từng cặp
x²      = [1, 4, 9]          bình phương từng ô
max(0,x)= [1, 2, 3]          cắt số âm
```

Trong C, một vòng lặp, không có gì cộng dồn:

```c
for (int i = 0; i < D; i++) y[i] = f(x[i]);
```

Nhắc lại vì rất dễ lẫn: `x * w` cho ra một **vector**, còn tích vô hướng cho ra
**một số**. Bước cộng dồn cuối là chỗ khác nhau.

Về phần cứng, đây là loại phép dễ tăng tốc nhất. Không ô nào phụ thuộc ô nào,
nên SIMD làm 4 hoặc 8 ô một nhịp mà không cần nghĩ.

## 3.2 Phép rút gọn: nhiều số thành một số

Ngược lại với loại trên. **Rút gọn** là nuốt cả vector để nhả ra một số.

```
sum(x)  = x₀ + x₁ + ... + x_{D-1}
mean(x) = sum(x) / D
max(x)  = số lớn nhất
min(x)  = số nhỏ nhất
sumsq(x)= Σ xᵢ²                     tổng bình phương
```

Với `x = [3, 4, 0, 0]`:

```
sum   = 7
mean  = 7/4 = 1.75
max   = 4
sumsq = 9 + 16 + 0 + 0 = 25
```

Trong C, mọi phép rút gọn có cùng một khung:

```c
float acc = 0.0f;                          // giá trị khởi tạo
for (int i = 0; i < D; i++) acc += x[i];   // gộp từng ô vào acc
```

Đổi `acc += x[i]` thành `acc += x[i]*x[i]` là được tổng bình phương. Đổi thành
`if (x[i] > acc) acc = x[i]` là được max. Cùng một bộ khung.

Tích vô hướng của bài 1 chính là một phép rút gọn: nhân từng phần tử trước, rồi
rút gọn bằng tổng.

Về phần cứng, rút gọn khó song song hơn hẳn loại trên, vì mọi luồng phải cùng
ghi vào một chỗ. Cách làm thường thấy là mỗi luồng cộng riêng một phần rồi gộp
các phần lại ở cuối. Đây là lý do trong tài liệu CUDA có hẳn một mục dài về
reduction, trong khi phép trên từng phần tử thì không ai viết mục riêng.

## 3.3 RMS và RMSNorm

Bài 1 đã gặp `RMS`, giờ dùng nó thật.

```
RMS(x) = √( mean(x²) ) = √( (1/D) Σ xᵢ² )
```

Tính tay với `x = [3, 4, 0, 0]`:

```
x²           = [9, 16, 0, 0]
Σ x²         = 25
mean(x²)     = 25 / 4 = 6.25
RMS          = √6.25 = 2.5
```

Bây giờ chia cả vector cho số đó:

```
x / RMS = [3/2.5, 4/2.5, 0, 0] = [1.2, 1.6, 0, 0]
```

Việc này gọi là **RMSNorm**. Trong model thật có thêm một vector hệ số học được,
nhân vào sau:

```
y = weight ⊙ x / (RMS(x) + eps)
```

Ký hiệu `⊙` là nhân từng phần tử ở mục 3.1. Còn `eps` là một số rất nhỏ, ví dụ
`1e-5`, cộng vào mẫu để nếu cả vector toàn số 0 thì không chia cho 0.

Chuỗi phép tính, đúng thứ tự:

```
x  ->  bình phương  ->  cộng dồn  ->  chia D  ->  căn  ->  chia  ->  nhân hệ số
       (từng ô)        (rút gọn)                        (từng ô)   (từng ô)
```

Trong C, và đây là lý do RMSNorm là bài tập tốt nhất để nối toán với code:

```c
float acc = 0.0f;
for (int i = 0; i < D; i++) acc += x[i] * x[i];   // rút gọn
float rms = sqrtf(acc / D);
for (int i = 0; i < D; i++)                       // từng ô
    y[i] = w[i] * x[i] / (rms + 1e-5f);
```

Hai vòng lặp, và **chúng không gộp được thành một**, vì vòng thứ hai cần `rms`
mà `rms` chỉ có sau khi vòng thứ nhất chạy xong. Chi tiết này quyết định cách
viết kernel: phải đọc `x` hai lượt, hoặc giữ `x` trong bộ nhớ nhanh giữa hai
lượt.

Số thật từ model: vector embedding của ` cat` có `RMS = 0.0715`. Sau khi qua
RMSNorm với hệ số học được của lớp 0, độ dài của nó thành `11.4523`. Vector vào
rất ngắn, vector ra dài hơn 14 lần, và đó là việc của lớp hệ số kia.

Vì sao cần chuẩn hoá giữa các lớp: model có 6 lớp nối tiếp. Nếu mỗi lớp làm số
lớn lên một chút thì tới lớp 6 số sẽ tràn. Nếu mỗi lớp làm số nhỏ đi thì tới lớp
6 số thành 0. RMSNorm kéo độ lớn về một mức ổn định ở đầu mỗi lớp, nên nhửng
lớp sau luôn nhận đầu vào ở cùng thang đo.

![Ba vector xuất phát từ gốc toạ độ với độ dài 2.57, 1.29 và 2.51. Một cung tròn
bán kính 1 cắt qua cả ba. Hai vector đầu cùng hướng nên điểm cắt của chúng trùng
nhau thành một chấm duy nhất.](/assets/images/study_ai/toan/chuan-hoa-don-vi.svg)

Chỗ cần nhìn là hai vector cùng hướng: sau khi chia cho độ dài, chúng rơi vào
**đúng một điểm**, không còn cách nào phân biệt. Độ dài đã bị bỏ thật chứ không
phải bị làm nhỏ lại. Đó là điều RMSNorm làm ở đầu mỗi lớp, và là lý do lớp sau
luôn nhận đầu vào ở cùng thang đo dù lớp trước trả ra số to hay nhỏ.

## 3.4 Hàm kích hoạt

Nếu chỉ chồng các lớp Linear lên nhau thì vô ích, vì nhân ma trận liên tiếp gộp
lại vẫn chỉ là một phép nhân ma trận. Cần một phép **không thẳng** chen vào
giữa. Đó là việc của hàm kích hoạt.

Cả ba hàm dưới đây đều làm trên từng phần tử.

**ReLU**, đơn giản nhất, cắt số âm về 0:

```
ReLU(x) = max(0, x)

ReLU([-2, 0, 3]) = [0, 0, 3]
```

Trong C là một dòng: `y[i] = x[i] > 0 ? x[i] : 0;`

**Sigmoid**, ép mọi số về khoảng từ 0 tới 1:

```
sigmoid(x) = 1 / (1 + e^(-x))

sigmoid(0)  = 0.5
sigmoid(2)  ≈ 0.881
sigmoid(-2) ≈ 0.119
```

**SiLU**, thứ model trong repo này dùng, là `x` nhân sigmoid của chính nó:

```
SiLU(x) = x · sigmoid(x)
```

Khác ReLU ở chỗ nó không cắt phăng số âm thành 0 mà làm chúng nhỏ lại một cách
mượt. Chi tiết đó có ích khi tính đạo hàm ở bài 5, vì ReLU có một điểm gãy còn
SiLU thì trơn khắp nơi.

`GELU` là một họ hàng nữa, thường gặp trong tài liệu. Ở giai đoạn này chỉ cần
biết nó cùng vai trò, chưa cần thuộc công thức xấp xỉ của nó.

## 3.5 Luỹ thừa và logarit

Hai hàm này phải hiễu kỹ, vì chúng là nguồn của gần như mọi lỗi số trong AI.

**`exp(x)` tăng cực nhanh.** Nhanh tới mức khó tin nếu chưa nhìn bảng:

```
exp(1)    ≈ 2.7
exp(10)   ≈ 22.026
exp(100)  ≈ 2.7 × 10⁴³
exp(1000) = tràn số
```

Số lớn nhất mà `float` 32 bit chứa được là khoảng `3.4 × 10³⁸`. Nên `exp(89)` đã
tràn rồi.

**`log(x)` là phép ngược của `exp`.** Nếu `exp(a) = b` thì `log(b) = a`.

```
log(1)   = 0
log(2.7) ≈ 1
log(0.1) ≈ −2.3
log(0)   = âm vô cùng
```

Hai tính chất sẽ dùng ở bài 5:

```
log(a · b) = log(a) + log(b)        biến nhân thành cộng
log(a / b) = log(a) − log(b)
```

Vì sao tính chất đó quý: model nhân hàng trăm xác suất với nhau, mỗi cái nhỏ hơn
1, và tích của chúng nhanh chóng nhỏ tới mức `float` không biểu diễn nổi. Chuyển
sang `log` thì phép nhân thành phép cộng, và cộng thì không bị nhỏ dần.

## 3.6 Softmax: biến điểm số thành xác suất

Model chấm điểm cho 4096 từ. Điểm là số bất kỳ, có âm có dương:

```
z = [1, 2, 3]
```

Cần biến chúng thành xác suất, tức các số dương cộng lại bằng 1.

Ba bước:

```
bước 1, mũ hoá:   exp(1)=2.718   exp(2)=7.389   exp(3)=20.086
bước 2, cộng:     2.718 + 7.389 + 20.086 = 30.193
bước 3, chia:     2.718/30.193 = 0.0900
                  7.389/30.193 = 0.2447
                  20.086/30.193 = 0.6652
```

Kiểm lại: `0.0900 + 0.2447 + 0.6652 = 0.9999`, bằng 1 sau khi làm tròn.

Công thức, giờ mới cần:

```
softmax(zᵢ) = e^(zᵢ) / Σⱼ e^(zⱼ)
```

Vì sao dùng `exp` chứ không chia thẳng cho tổng: điểm có thể âm, mà xác suất
không được âm. `exp` biến mọi số thành số dương. Và vì `exp` tăng nhanh, chênh
lệch nhỏ ở điểm thành chênh lệch lớn ở xác suất. Điểm `3` chỉ hơn điểm `1` có 2
đơn vị, nhưng xác suất `0.6652` gấp hơn 7 lần `0.0900`.

Chuỗi phép tính:

```
điểm  ->  exp (từng ô)  ->  tổng (rút gọn)  ->  chia (từng ô)  ->  xác suất
```

## 3.7 Sửa lỗi tràn số ở đầu bài

Giờ quay lại `exp(1000)`.

Nếu điểm của model là `[1000, 1001, 1002]` thì `exp` của cả ba đều tràn, và kết
quả là `inf/inf`, tức `nan`.

Mẹo sửa: **trừ số lớn nhất đi trước khi mũ hoá.**

```
z    = [1000, 1001, 1002]
max  = 1002
z−max= [−2, −1, 0]

exp: [0.135, 0.368, 1.0]        không tràn nữa
tổng: 1.503
chia: [0.0900, 0.2447, 0.6652]
```

Kết quả **giống hệt** kết quả của `[1, 2, 3]` ở mục trước. Không phải trùng hợp,
mà là tính chất của phép chia: tử và mẫu cùng bị chia cho `exp(max)` nên chúng
triệt tiêu nhau.

Công thức ổn định, thứ mọi thư viện thật sự cài đặt:

```
softmax(zᵢ) = e^(zᵢ − max z) / Σⱼ e^(zⱼ − max z)
```

Trong C là ba lượt quét thay vì hai:

```c
float m = z[0];
for (int i = 1; i < N; i++) if (z[i] > m) m = z[i];   // lượt 1: tìm max
float s = 0.0f;
for (int i = 0; i < N; i++) { p[i] = expf(z[i]-m); s += p[i]; }  // lượt 2
for (int i = 0; i < N; i++) p[i] /= s;                // lượt 3
```

Bài học rộng hơn con số: **công thức toán đúng không đồng nghĩa với cài đặt
đúng.** Máy tính có giới hạn về số nó biểu diễn được, và một cài đặt tốt phải
tính tới giới hạn đó. Đây là tư duy sẽ quay lại ở bài 6 khi ép số thực xuống 4
bit.

## 3.8 Ba nhóm phép toán, ba kiểu tối ưu

Tới đây đã đủ ba nhóm để phân loại mọi phép toán trong một Transformer:

| Nhóm | Ví dụ | Vào ra | Song song hoá |
|---|---|---|---|
| Từng phần tử | ReLU, SiLU, nhân hệ số | `D` số ra `D` số | dễ nhất, SIMD làm ngay |
| Rút gọn | tổng, max, RMS | `D` số ra `1` số | cần gộp phần, khó hơn |
| Nhân ma trận | MATVEC, MATMUL | bảng ra bảng | tốn nhất, nhưng dùng lại được dữ liệu |

Khi nhìn một model và muốn biết chỗ nào đáng tối ưu, phân loại theo bảng này
trước. Bài 7 sẽ đo và cho thấy nhóm thứ ba gần như luôn là chỗ tốn thời gian.

## 3.9 Tự kiểm

1. `x = [1, 2, 2]`. Tính `sum`, `mean`, `sumsq`, `RMS`.
2. `ReLU([-1, 0, 5])` bằng bao nhiêu?
3. Tính softmax của `[0, 0]` bằng tay. Kết quả có hợp lý không?
4. Tính softmax của `[0, 0, 0, 0]`. Rút ra quy luật gì?
5. Vì sao RMSNorm cần hai vòng lặp mà không gộp được thành một?
6. Điểm `[5, 6, 7]` và điểm `[105, 106, 107]` cho cùng một kết quả softmax. Vì sao?

Đáp án 1: `5`, `1.667`, `9`, `√3 = 1.732`.
Đáp án 3: `[0.5, 0.5]`, hợp lý vì hai lựa chọn điểm bằng nhau.
Đáp án 4: `[0.25, 0.25, 0.25, 0.25]`, điểm bằng nhau thì xác suất chia đều.

## Kết bài

1. **Phép trên từng phần tử giữ nguyên số chiều**, các ô độc lập, dễ song song
   nhất.
2. **Phép rút gọn bóp nhiều số thành một số.** Mọi phép rút gọn dùng chung một
   khung vòng lặp, chỉ khác cách gộp.
3. **RMSNorm là rút gọn rồi chia**, cần hai lượt quét và không gộp được, chi
   tiết này quyết định cách viết kernel.
4. **Hàm kích hoạt là chỗ chen phi tuyến vào giữa các lớp Linear.** Không có nó,
   nhiều lớp gộp lại vẫn chỉ bằng một lớp.
5. **Softmax biến điểm thành xác suất**, và bản cài đặt thật luôn trừ max trước
   khi mũ hoá. Công thức đúng chưa đủ, còn phải chạy được trên số hữu hạn.

Bài 4 ghép tất cả lại thành attention, phép toán trung tâm của Transformer.

