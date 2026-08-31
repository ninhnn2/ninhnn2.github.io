---
sort: 8
image: /assets/images/og-study-ai-v2.jpg
---

# Bài 7: FLOPs, cường độ số học, băng thông

> Giai đoạn 7 của roadmap, bài cuối. Cần cả sáu bài trước. Mọi con số trong bài
> này đo trên MacBook Pro M3 bằng lệnh ghi kèm, chạy lại được.
>
> Bài 7 trong loạt [Toán cho AI nhúng](/study_ai/toan/). Mọi con số trong bài đo
> trên MacBook Pro M3 và kiểm bằng `docs/toan/tools/so_that.py` trong repo
> [PLE TinyLM](https://github.com/ninhnn2/machineai), bản gốc của
> [Viacheslav Sierbov (slvDev)](https://x.com/slvDev), giấy phép MIT.

## 7.0 Một kết quả đo trái với trực giác

Cùng một ma trận weight `[4096 × 128]`, cùng một phép MATVEC, viết theo năm cách
khác nhau. Chạy trên cùng con chip, cùng lúc:

```
bậc                        ms      GB/s     so với L0
L0  int4 + fp32          0.3020     0.9        1.00x
L1  int4 + int8 act      0.1933     1.4        1.56x
L2  int8 dàn sẵn         0.0246    21.3       12.29x
L3  thêm SIMD            0.0154    34.0       19.58x
L4  thêm đa luồng        0.0240    21.8       12.56x
```

Đo bằng:

```bash
make -C samples/cpu run
```

Hai chỗ trái trực giác trong bảng này.

Thứ nhất, **L2 đọc gấp đôi số byte so với L0** (nó dàn weight từ 4 bit ra 8 bit,
tức 512 KB thay vì 256 KB), vậy mà nó nhanh hơn **12 lần**.

Thứ hai, **L4 dùng 8 luồng nhưng chậm hơn L3 dùng 1 luồng**. Thêm bảy lõi vào
làm việc chậm đi.

Bài này giải thích cả hai bằng ba khái niệm, và cả ba đều đếm được bằng tay.

## 7.1 Đếm phép tính: FLOPs

FLOP là một phép toán trên số thực. Đếm bằng cách nhìn vòng lặp của bài 2:

```c
for (int r = 0; r < rows; r++)
    for (int c = 0; c < cols; c++)
        acc += W[r*cols+c] * x[c];    // 1 nhân + 1 cộng = 2 FLOP
```

```
FLOPs của MATVEC = 2 × rows × cols
```

Với ma trận `qkv` thật `[384, 128]`:

```
2 × 384 × 128 = 98.304 FLOP cho một token
```

FLOPs chỉ đếm **việc phải làm**. Nó chưa nói gì về thời gian, vì thời gian còn
phụ thuộc dữ liệu tới kịp hay không. Đó là khái niệm kế tiếp.

## 7.2 Đếm byte phải đọc

Cùng phép MATVEC đó, đọc bao nhiêu byte?

```
ở fp32:  384 × 128 × 4 byte = 196.608 byte
ở int4:  384 × 128 / 2      =  24.576 byte
```

Bài 6 đã giải thích vì sao con số thứ hai nhỏ đi 8 lần.

Chú ý điều quan trọng: khi model sinh chữ từng token một, **mỗi weight được đọc
lên đúng một lần rồi dùng đúng một lần**. Đọc xong là bỏ. Không có chuyện dùng
lại.

## 7.3 Cường độ số học

Ghép hai con số trên lại:

```
cường độ số học = FLOPs / số byte phải đọc
```

Nó trả lời: **mỗi byte kéo về từ bộ nhớ thì làm được bao nhiêu phép tính?**

```
ở fp32:  98.304 / 196.608 = 0,5 FLOP mỗi byte
ở int4:  98.304 /  24.576 = 4,0 FLOP mỗi byte
```

Con số `0,5` rất thấp. Nó nghĩa là đọc 2 byte mới làm được 1 phép tính. Trong khi
một con CPU hiện đại làm được hàng chục phép tính trong thời gian đọc 1 byte từ
RAM.

Từ đây có hai trạng thái, và phân biệt được chúng là kỹ năng chính của bài:

```
memory-bound   CPU ngồi chờ dữ liệu.   Thêm sức tính không giúp.
compute-bound  Dữ liệu chờ CPU.        Thêm băng thông không giúp.
```

Đây là lý do bài 2 nói MATMUL nhanh hơn MATVEC không phải vì ít việc hơn. Xử lý
32 token cùng lúc thì FLOPs nhân 32 mà byte đọc giữ nguyên, nên cường độ số học
nhân 32. Cùng một dữ liệu, làm được nhiều việc hơn.

## 7.4 Băng thông

Băng thông là số byte bộ nhớ chuyển được mỗi giây.

```
GB/s = số byte đọc / thời gian
```

Cột `GB/s` trong bảng ở đầu bài tính đúng như vậy. Và đây là chỗ trả lời câu hỏi
thứ nhất.

Nhìn L0 và L2:

```
L0:  đọc 256 KB,  mất 0.3020 ms  ->   0,9 GB/s
L2:  đọc 512 KB,  mất 0.0246 ms  ->  21,3 GB/s
```

Nếu L0 thật sự bị chặn bởi băng thông thì nó phải đạt gần mức trần của phần
cứng. Nhưng L2 trên **chính con chip đó** đạt `21,3 GB/s`, gấp 23 lần. Nên trần
băng thông không phải thứ đang chặn L0.

Vậy L0 chậm vì gì? Vì nó gỡ nibble trong vòng lặp trong cùng, đúng hai dòng dịch
bit ở mục 6.6, cho từng weight một. L2 gỡ sẵn một lần rồi mới vào vòng lặp. Nó
đọc nhiều byte hơn nhưng làm ít việc hơn trên mỗi byte.

Kết luận, và đây là câu quan trọng nhất của bài: **"bị chặn bởi bộ nhớ" là một
giả thuyết phải đo, không phải kết luận rút ra từ việc nhìn công thức.** Cường độ
số học `0,5` gợi ý memory-bound, nhưng phép đo cho thấy nút thắt thật là compute,
cụ thể là việc gỡ bit.

Cách kiểm nhanh, dùng được cho bất kỳ kernel nào: **giảm số byte phải đọc mà tốc
độ không tăng, thì không phải memory-bound.**

Vẽ ba bậc lên cùng một đồ thị thì chuyện này thành hiển nhiên:

![Đồ thị hai trục loga. Trục ngang là số FLOP trên mỗi byte, trục dọc là GFLOP
mỗi giây. Một đường thẳng nghiêng là trần băng thông 34 GB/s. Bậc L3 nằm sát
trần ở cường độ 2. Bậc L2 nằm dưới trần một chút, cùng cường độ 2. Bậc L0 nằm ở
cường độ 4, tức cao gấp đôi, nhưng rơi xuống tận 3.5 GFLOP mỗi
giây.](/assets/images/study_ai/toan/roofline-do-that.svg)

Đồ thị này gọi là **roofline**. Đường nghiêng là trần: với mỗi mức cường độ số
học, đó là tốc độ cao nhất mà băng thông cho phép. Điểm nằm sát trần nghĩa là
đang bị bộ nhớ chặn. Điểm nằm xa dưới trần nghĩa là nút thắt ở chỗ khác.

Chỗ cần nhìn: **L0 nằm bên phải L2 và L3**, tức nó dùng dữ liệu tiết kiệm hơn,
vậy mà nó rơi xuống tận đáy đồ thị. Nếu bộ nhớ là thứ chặn nó thì nó đã phải nằm
gần trần như L3. Khoảng cách dọc từ L0 tới trần chính là phần thời gian nó dành
để gỡ nibble.

Lưu ý về đường trần: nó dựng từ băng thông **tốt nhất đo được trên máy này**,
không phải con số trên tờ quảng cáo của nhà sản xuất. Trần đo được luôn thấp hơn
trần lý thuyết, và trần đo được mới là thứ đáng so.

## 7.5 Vì sao thêm lõi lại chậm đi

Câu hỏi thứ hai ở đầu bài. Số đo trả lời thẳng.

Đo chi phí mở một vùng song song **rỗng**, không làm gì cả:

```
1 luồng:   0,07 us
2 luồng:   3,80 us
4 luồng:   6,84 us
8 luồng:  13,40 us
```

Mở 8 luồng tốn `13,40 us` trước khi có một phép tính nào được thực hiện. Trong
khi toàn bộ công việc của L3 chỉ mất `15,4 us`.

```
công việc thật:  15,4 us
chi phí mở luồng: 13,4 us  ->  87% công việc
```

Chia một việc 15 us cho 8 lõi thì mỗi lõi làm chưa tới 2 us, còn tiền tổ chức
là 13 us. Lỗ.

Bảng quét theo số token xử lý cùng lúc cho thấy điểm hoà vốn:

```
   B     1 luồng    8 luồng   so sánh
   1     0.0152     0.0235     0.65x    1 luồng thắng
   2     0.0284     0.0243     1.17x    đa luồng thắng
   4     0.0577     0.0401     1.44x
  16     0.2366     0.0845     2.80x
  64     0.9563     0.2446     3.91x
 256     3.8562     0.9014     4.28x
```

Điểm hoà vốn nằm ở khoảng `14,9 us` việc mỗi lần gọi. Dưới ngưỡng đó, song song
hoá làm chậm đi. Trên ngưỡng đó, nó thắng dần và tiến tới khoảng 4 lần.

Nguyên tắc rút ra: **song song hoá có giá cố định, và giá đó phải nhỏ hơn phần
tiết kiệm được.** Nguyên tắc này lặp lại y hệt ở mọi tầng, từ OpenMP trên CPU tới
việc phóng kernel trên GPU. Trên Jetson, thời gian CPU ra lệnh cho GPU chiếm
khoảng một nửa thời gian mỗi token, cùng một hiện tưọng với con số `13,40 us` ở
trên.

## 7.6 Ba câu hỏi khi nhìn một phép toán

Đây là công cụ mang vê từ cả loạt bài. Với bất kỳ phép toán nào, hỏi ba câu:

```
1. Tốn bao nhiêu phép tính?      -> đếm vòng lặp, ra FLOPs
2. Đọc bao nhiêu byte?           -> đếm kích thước dữ liệu
3. Có dùng lại dữ liệu không?    -> chia hai số trên, ra cường độ số học
```

Áp cho ba nhóm phép toán của bài 3:

| Nhóm | FLOPs | Byte | Cường độ | Thường bị chặn bởi |
|---|---|---|---|---|
| Từng phần tử | `D` | `2D` đọc, `D` ghi | rất thấp | bộ nhớ |
| Rút gọn | `D` | `D` | thấp | bộ nhớ |
| MATVEC | `2RC` | `RC` | khoảng 2 | bộ nhớ |
| MATMUL, `n` cột | `2RCn` | `RC` | khoảng `2n` | tính toán khi `n` lớn |

Nhìn bảng này thì thấy ngay vì sao decode từng token chậm hơn nhiều so với xử lý
cả câu một lượt, dù cùng một model và cùng một weight.

## 7.7 Áp cho model thật

Model `4.120.768` tham số, lượng tử hoá 4 bit theo bài 6:

```
kích thước = 4.120.768 / 2 byte ≈ 1,96 MB
```

Mỗi token sinh ra phải đọc toàn bộ số đó. Ở mức `34 GB/s` đo được ở bậc L3:

```
1,96 MB / 34 GB/s = 0,061 ms mỗi token
```

Nghĩa là trần lý thuyết vào khoảng `16.000` token mỗi giây, nếu chỉ tính thời
gian đọc weight.

Con số này dùng để làm gì: nếu đo thực tế ra `2.000` token mỗi giây thì có 8 lần
chênh, và chênh đó nằm ở chỗ khác chứ không nằm ở băng thông. Có thể là gỡ
nibble như L0, có thể là chi phí phóng kernel như mục 7.5, có thể là attention
khi câu dài. Con số trần cho biết **còn bao nhiêu chỗ để cải thiện**, và quan
trọng hơn là cho biết khi nào nên dừng tối ưu.

## 7.8 Tự kiểm

1. MATVEC `[1024, 512]` ở int4. Tính FLOPs, byte đọc, cường độ số học.
2. Cùng ma trận đó nhưng xử lý 16 token cùng lúc. Cường độ số học đổi thế nào?
3. Một kernel đạt `2 GB/s`, kernel khác trên cùng chip đạt `30 GB/s`. Kernel đầu
   có memory-bound không? Vì sao?
4. Chi phí mở vùng song song là `13 us`. Một việc mất `20 us` trên một lõi thì
   chia cho 8 lõi có lời không?
5. Model `29M` tham số ở int4, băng thông `25 GB/s`. Trần token mỗi giây là bao nhiêu?
6. Đo thực tế được một nửa trần. Nên nghi vào đâu trước?

Đáp án 1: `2×1024×512 = 1.048.576` FLOP, `262.144` byte, cường độ `4,0`.
Đáp án 2: nhân 16, thành `64`. Byte đọc không đổi.
Đáp án 3: không, vì chip rõ ràng làm được `30 GB/s`. Nút thắt nằm ở chỗ khác.
Đáp án 4: `20/8 = 2,5 us` việc, cộng `13 us` tổ chức, thành `15,5 us`. Không lời.
Đáp án 5: `29M/2 = 14,5 MB`, `14,5/25000 s = 0,58 ms`, khoảng `1.720` token mỗi giây.

## Kết bài: ba lớp kiến thức

**Lớp A, phải nắm.** FLOPs là số phép tính, đếm bằng cách nhìn vòng lặp. Cường độ
số học là FLOPs chia byte đọc. Memory-bound là CPU chờ dữ liệu, compute-bound là
dữ liệu chờ CPU. Ba thứ này đủ để đoán một phép toán sẽ nhanh hay chậm.

**Lớp B, cần khi đi tối ưu.** Đừng tin công thức, hãy đo. Trên chính con chip
này, cùng một phép MATVEC chạy từ `0,9` tới `34 GB/s` tuỳ cách viết, chênh 38
lần. Bậc L2 đọc gấp đôi byte mà nhanh gấp 12, chứng minh nút thắt ở L0 là gỡ bit
chứ không phải băng thông. Cách kiểm rẻ nhất là giảm byte đọc rồi xem tốc độ có
tăng không.

**Lớp C, khi đã biết mình bị chặn ở đâu.** Song song hoá có giá cố định. Trên máy
này giá đó là `13,40 us` cho 8 luồng, và điểm hoà vốn là `14,9 us` việc mỗi lần
gọi. Cùng nguyên tắc chi phối chi phí phóng kernel trên GPU, tiling để tăng khả
năng dùng lại dữ liệu, và cách xếp bộ nhớ theo hàng của bài 2.

Thứ tự quan trọng: Lớp C chỉ đáng đụng tới **sau khi** đã biết mình đang
memory-bound hay compute-bound. Tối ưu sai phía là công sức đổ đi.

## Hết loạt bài

Bảy bài, đi từ dãy số tới việc đoán hiêu năng trên một con chip cụ thể:

```
bài 1   vector, tích vô hướng          MAC
bài 2   ma trận, MATVEC, MATMUL        GEMM
bài 3   từng phần tử, rút gọn, softmax ba nhóm phép toán
bài 4   attention                       lắp từ bài 1 tới 3
bài 5   đạo hàm, gradient, backprop     weight từ đâu ra
bài 6   lượng tử hoá                    32 bit xuống 4 bit
bài 7   FLOPs, cường độ, băng thông     nhanh hay chậm, vì sao
```

Đích cuối không phải trở thành nhà toán học. Đích là nhìn một tensor và lần
xuống được: nó đang biểu diễn gì, phép toán đang làm gì, viết thành vòng `for`
ra sao, đọc bộ nhớ theo kiểu nào, tốn bao nhiêu MAC, cần bao nhiêu băng thông,
và có tối ưu bằng SIMD hay DSP hay GPU được không.

Kiểm lại toàn bộ số trong bảy bài bằng một lệnh:

```bash
uv run python docs/toan/tools/so_that.py
```

