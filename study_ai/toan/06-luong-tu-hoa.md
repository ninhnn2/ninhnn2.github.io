---
sort: 7
image: /assets/images/og-study-ai-v2.jpg
---

# Bài 6: Lượng tử hoá, ép số thực xuống 4 bit

> Giai đoạn 6 của roadmap. Cần bài 1 và bài 5. Đây là bài gần nghề nhúng nhất.
>
> Bài 6 trong loạt [Toán cho AI nhúng](/study_ai/toan/). Mọi con số trong bài đo
> trên MacBook Pro M3 và kiểm bằng `docs/toan/tools/so_that.py` trong repo
> [PLE TinyLM](https://github.com/ninhnn2/machineai), bản gốc của
> [Viacheslav Sierbov (slvDev)](https://x.com/slvDev), giấy phép MIT.

## 6.0 Một phép chia không vừa

Model trong repo có 4.120.768 tham số. Mỗi tham số là một `float` 32 bit, tức 4
byte:

```
4.120.768 × 4 byte = 16.483.072 byte ≈ 15,7 MB
```

Con ESP32-S3 có 512 KB SRAM. Chia ra:

```
15,7 MB / 0,5 MB ≈ 31 lần lớn hơn chỗ chứa
```

Model không vừa. Không phải thiếu chút ít, mà thiếu hơn ba mươi lần.

Có ba hướng: làm model nhỏ đi, chấp nhận không chạy trên con chip đó, hoặc **để
nguyên số lượng tham số mà làm mỗi tham số tốn ít bit hơn**.

Bài này về hướng thứ ba.

```bash
uv run python docs/toan/tools/so_that.py --giai-doan 6
```

## 6.1 Một float 32 bit chứa gì

`float` 32 bit biểu diễn được số từ cỡ `10⁻³⁸` tới `10³⁸`, với khoảng 7 chữ số
có nghĩa.

Nhưng weight của model thật trông như thế nào? Đây là 8 số đầu của một hàng
trong ma trận `qkv` của lớp 0:

```
0.90  -0.40  0.15  -0.85  0.05  0.62  -0.11  0.33
```

Toàn bộ nằm trong khoảng từ `−1` tới `+1`. Không có số nào cỡ `10³⁸`. Không có
số nào cỡ `10⁻³⁸`.

Nghĩa là phần lớn khả năng biểu diễn cuả `float` đang bị bỏ phí. Ta trả 32 bit
cho một dải số mà thực tế chỉ dùng một góc rất nhỏ.

Câu hỏi: nếu biết trước mọi số đều nằm trong `[−1, 1]`, có cần đủ 32 bit không?

## 6.2 Ý tưởng: một cái thước có vạch

Giả sử chỉ có 4 bit cho mỗi số. 4 bit biểu diễn được 16 giá trị, và nếu để dành
một nửa cho số âm thì được:

```
−7  −6  −5  −4  −3  −2  −1  0  +1  +2  +3  +4  +5  +6  +7
```

Đây là các số nguyên, không phải `0.90` hay `−0.40`. Cần một cách nối hai thế
giới.

Cách nối là **một hệ số nhân dùng chung**, gọi là `scale`:

```
số thực ≈ số nguyên × scale
```

Chọn `scale` sao cho số lớn nhất trong nhóm ứng đúng với vạch `7`:

```
scale = max(|w|) / 7
```

Với 8 số ở trên, `max(|w|) = 0.90`, nên:

```
scale = 0.90 / 7 = 0.1286
```

## 6.3 Làm tay một nhóm đầy đủ

**Nén.** Chia mỗi số cho `scale` rồi làm tròn:

```
q = round(w / scale)

0.90  / 0.1286 =  7.00  ->  7
-0.40 / 0.1286 = -3.11  -> -3
0.15  / 0.1286 =  1.17  ->  1
-0.85 / 0.1286 = -6.61  -> -7
0.05  / 0.1286 =  0.39  ->  0
0.62  / 0.1286 =  4.82  ->  5
-0.11 / 0.1286 = -0.86  -> -1
0.33  / 0.1286 =  2.57  ->  3
```

Kết quả là tám số nguyên, mỗi số vừa trong 4 bit:

```
[7, -3, 1, -7, 0, 5, -1, 3]
```

**Giải nén.** Nhân ngược lại với `scale`:

```
ŵ = q × scale

 7 × 0.1286 =  0.9000
-3 × 0.1286 = -0.3857
 1 × 0.1286 =  0.1286
-7 × 0.1286 = -0.9000
 0 × 0.1286 =  0.0000
 5 × 0.1286 =  0.6429
-1 × 0.1286 = -0.1286
 3 × 0.1286 =  0.3857
```

**So với số gốc:**

```
gốc:     0.90   -0.40    0.15   -0.85    0.05    0.62   -0.11    0.33
khôi phục: 0.9000 -0.3857  0.1286 -0.9000  0.0000  0.6429 -0.1286  0.3857
lệch:      0.0000  0.0143  0.0214  0.0500  0.0500  0.0229  0.0186  0.0557
```

Sai số lớn nhất là `0.0557`.

Con số đó có ý nghĩa: nó nhỏ hơn **nửa khoảng cách giữa hai vạch**, tức
`scale/2 = 0.0643`. Đó không phải may mắn, mà là hệ quả của phép làm tròn. Làm
tròn không bao giờ sai quá nửa vạch.

![Một trục số có 15 vạch đánh số từ âm 7 tới cộng 7, khoảng cách giữa hai vạch
bằng scale 0.1286. Tám weight được thả xuống dưới trục, mỗi weight là một chấm
xanh ở vị trí thật của nó, nối bằng một đoạn ngang tới chấm đỏ là vạch nó rơi
về.](/assets/images/study_ai/toan/luong-tu-hoa-vach.svg)

Chỗ cần nhìn là **độ dài các đoạn ngang**, đó chính là sai số. Không đoạn nào
dài quá nửa khoảng vạch, và giá trị `+0.90` có đoạn dài bằng 0 vì nó đúng bằng
`max|w|` nên rơi trúng vạch `7` không lệch chút nào.

Đây cũng là chỗ thấy được vì sao chia nhóm nhỏ lại tốt hơn. Vạch thưa hay dày là
do `scale`, mà `scale` do số lớn nhất trong nhóm quyết định. Nhóm nào có một số
bất thường lớn thì vạch của cả nhóm bị kéo thưa ra, và mọi số nhỏ trong nhóm đó
chịu sai số lớn theo.

## 6.4 Vì sao chia theo nhóm nhỏ

Nếu dùng một `scale` chung cho cả ma trận 49.152 số thì có vấn đề. Chỉ cần một
số bất thường lớn, ví dụ `5.0`, thì `scale = 5/7 = 0.714`, và mọi số nhỏ như
`0.05` sẽ làm tròn thành `0`. Toàn bộ thông tin của chúng biến mất.

Cách sưả: chia hàng thành từng **nhóm** nhỏ, mỗi nhóm có `scale` riêng. Repo này
dùng nhóm 32 hoặc 128 số.

Đo trên một hàng thật của model, nhóm 32 số, lượng tử hoá 4 bit:

```
sai số lớn nhất trong cả hàng 128 số = 0.0060
```

So với ví dụ tay ở mục 6.3 cho `0.0557`, tốt hơn gần 10 lần. Lý do: weight thật
trong một nhóm 32 số gần nhau về độ lớn hơn tám số tôi bịa ra để dễ tính tay.

Cái giá: mỗi nhóm phải lưu thêm một `scale`. Mục sau đếm cái giá đó.

## 6.5 Đếm byte thật

Một hàng 128 số của ma trận `qkv`, nhóm 32:

```
ở fp32:  128 số × 4 byte                        = 512 byte

ở int4:  128 số × 0,5 byte                      =  64 byte
         4 nhóm × 2 byte cho scale (fp16)       =   8 byte
         cộng lại                               =  72 byte
```

Tỉ lệ nén:

```
512 / 72 = 7,11 lần
```

Không phải đúng 8 lần như phép chia `32 bit / 4 bit` gợi ý, vì `scale` cũng tốn
chỗ. Đây là loại chi tiết mà chỉ đếm thật mới thấy.

Áp cho cả model:

```
4.120.768 tham số ở int4 ≈ 1,96 MB
```

So với `15,7 MB` ban đầu. Vẫn chưa vừa 512 KB SRAM của ESP32, nhưng giờ đã vừa
PSRAM và vừa flash, và đó là lý do repo này chia tham số theo nơi chứa chứ không
cố nhét tất cả vào một chỗ.

## 6.6 Đóng gói 4 bit trong C

Bộ nhớ đánh địa chỉ theo byte, không theo nibble. Nên hai số 4 bit ở chung một
byte:

```c
uint8_t b = (uint8_t)((q_hi << 4) | (q_lo & 0x0F));
```

Lúc đọc phải gỡ ra, và đây là phần tốn thời gian bất ngờ:

```c
int8_t lo = (int8_t)(b << 4) >> 4;   // dịch trái rồi phải để giữ dấu
int8_t hi = (int8_t)(b) >> 4;
```

Số byte mỗi hàng, khi số cột lẻ thì phải làm tròn lên:

```c
row_bytes = (cols + 1) / 2;
```

Bài 7 sẽ đo và cho thấy chính hai dòng gỡ nibble kia là nút thắt, chứ không phải
băng thông bộ nhớ như trực giác gợi ý.

## 6.7 Tích vô hướng trên số nguyên

Đây là chỗ nối toán với phần cứng nhúng, và là lý do lượng tử hoá đáng làm chứ
không chỉ để tiết kiệm chỗ.

Tích vô hướng của bài 1, viết cho weight đã lượng tử hoá:

```
w[i] ≈ qw[i] · scale
```

nên

```
Σ x[i] · w[i] ≈ Σ x[i] · qw[i] · scale = scale · Σ x[i] · qw[i]
```

`scale` là hằng trong cả nhóm nên rút ra ngoài được. Phần trong tổng chỉ còn
phép nhân cộng. Nếu lượng tử hoá luôn cả `x` thì phần đó thành **phép nhân cộng
trên số nguyên**.

Vì sao điều đó quan trọng: hầu hết chip nhúng làm phép nhân số nguyên nhanh hơn
số thực rất nhiều, và nhiều con không có đơn vị số thực nào cả.

```
ESP32-S3   lệnh SIMD số nguyên
ARM        NEON, có lệnh dotprod cho int8
DSP        MAC số nguyên là lệnh gốc, thứ nó sinh ra để làm
NVIDIA     Tensor Core có đường int8 riêng
```

Lượng tử hoá vì thế đổi được hai thứ cùng lúc: ít byte hơn để đọc, và phép tính
rẻ hơn để làm. Bài 7 đo cả hai.

## 6.8 Cái giá phải trả

Lượng tử hoá **làm mất thông tin**, và không có cách nào lấy lại. Ba yếu tố
quyết định mất bao nhiêu:

```
số bit thấp hơn   ->  ít byte hơn, sai số lớn hơn
nhóm nhỏ hơn      ->  sai số nhỏ hơn, tốn thêm chỗ cho scale
weight phân tán   ->  sai số lớn hơn ở cùng số bit
```

Cách đánh giá đúng không phải nhìn sai số tuyệt đối của từng weight, mà nhìn
**model có còn nói đúng không**. Sai số `0.006` trên một weight nghe nhỏ, nhưng
model có 6 lớp và sai số cộng dồn qua từng lớp. Ngược lại, một sai số nghe lớn ở
weight ít quan trọng có thể không ảnh hưởng gì.

Nên thước đo là perplexity của bài 5, đo trước và sau khi lượng tử hoá, trên
cùng tập dữ liệu. Nếu perplexity gần như không đổi thì việc nén là lời.

Đây là cùng một tư duy với mục 3.7: công thức đúng chưa đủ, phải đo trên số hữu
hạn thật.

## 6.9 Tự kiểm

1. Nhóm `[0.6, -0.3, 0.2, -0.6]`, lượng tử hoá 4 bit. Tính `scale` và `q`.
2. Với `scale` vừa tính, khôi phục `-0.3`. Sai số bao nhiêu?
3. Vì sao sai số không bao giờ vượt `scale/2`?
4. Một hàng 256 số, nhóm 64, int4, scale fp16. Tốn bao nhiêu byte?
5. Nếu đổi từ nhóm 64 sang nhóm 16, byte tăng hay giảm? Sai số tăng hay giảm?
6. Vì sao rút được `scale` ra ngoài dấu tổng của tích vô hướng?

Đáp án 1: `scale = 0.6/7 = 0.0857`, `q = [7, -4, 2, -7]`.
Đáp án 2: `-0.3 / 0.0857 = -3.5` đúng chằn, đây là trường hợp xấu nhất của phép
làm tròn vì nó nằm chính giữa hai vạch. Làm tròn cho `-4`, khôi phục thành
`-0.3429`, lệch `0.042857`, **bằng đúng** `scale/2`. Mục 6.3 nói sai số không
vượt nửa vạch, và câu này là chỗ nó chạm trần chứ không vượt.
Đáp án 4: `256/2 + (256/64)×2 = 128 + 8 = 136` byte.
Đáp án 5: byte tăng lên `128 + 32 = 160`, sai số giảm.

## Kết bài

1. **Weight của model nằm gọn trong một dải hẹp**, nên 32 bit mỗi số là lãng phí.
2. **Lượng tử hoá là `q = round(w/scale)` và `ŵ = q × scale`**, một cái thước có
   vạch.
3. **Sai số không bao giờ vượt nửa vạch**, đó là hệ quả của phép làm tròn.
4. **Chia nhóm nhỏ giảm sai số nhưng tốn thêm chỗ cho scale**, nên tỉ lệ nén
   thật là `7,11` lần chứ không phải `8`.
5. **`scale` rút được ra ngoài dấu tổng**, nên phần lõi thành phép nhân cộng số
   nguyên, thứ mà mọi chip nhúng làm nhanh.
6. **Thước đo đúng là perplexity, không phải sai số từng weight.**

Bài 7 khép lại loạt bài bằng câu hỏi cuối: biết hết những phép toán trên rồi,
làm sao đoán được chúng chạy nhanh hay chậm trên một con chip cụ thể.

