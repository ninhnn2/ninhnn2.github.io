---
sort: 3
image: /assets/images/og-study-ai-v2.jpg
---

# Bài 2: Ma trận, nhân ma trận với vector và với ma trận

> Giai đoạn 2 của roadmap. Cần bài 1 trước, nhất là tích vô hướng.
>
> Bài 2 trong loạt [Toán cho AI nhúng](/study_ai/toan/). Mọi con số trong bài đo
> trên MacBook Pro M3 và kiểm bằng `docs/toan/tools/so_that.py` trong repo
> [PLE TinyLM](https://github.com/ninhnn2/machineai), bản gốc của
> [Viacheslav Sierbov (slvDev)](https://x.com/slvDev), giấy phép MIT.

## 2.0 Một câu hỏi mà bài 1 chưa trả lời được

Bài 1 tính được "vector `a` giống vector `b` bao nhiêu" bằng một tích vô hướng.

Nhưng model thật không hỏi một câu. Nó hỏi 4096 câu cùng lúc: token vừa rồi
giống với **từng từ nào** trong toàn bộ từ điển 4096 từ? Rồi từ 4096 câu trả lời
đó nó chọn từ tiếp theo.

4096 câu hỏi, mỗi câu là một tích vô hướng 128 chiều. Viết 4096 vòng `for` rời
rạc thì được, nhưng không ai làm vậy, và quan trọng hơn là phần cứng không thích
cách đó.

Câu hỏi: có cách nào gói 4096 phép tính giống hệt nhau thành **một** phép toán
có tên không? Có, và tên nó là nhân ma trận.

```bash
uv run python docs/toan/tools/so_that.py --giai-doan 2
```

## 2.1 Ma trận là một bảng số

Bài 1 nói vector là dãy số. **Ma trận là bảng số**, tức nhiều dãy xếp chồng lên
nhau, mọi dãy dài bằng nhau.

```
W = [ 1  2  3 ]      2 hàng, 3 cột
    [ 4  5  6 ]
```

Ba từ phải nắm chắc, vì lỗi lập trình AI phần lớn là lỗi ở ba từ này:

- **hàng** (row): dòng ngang. `W` có 2 hàng.
- **cột** (column): dòng dọc. `W` có 3 cột.
- **shape**: cặp số `[hàng, cột]`. Shape cuả `W` là `[2, 3]`.

Cách chỉ vào một ô: `W[i, j]` là ô ở hàng `i`, cột `j`, đếm từ 0.

```
W[0, 0] = 1     W[0, 2] = 3
W[1, 0] = 4     W[1, 2] = 6
```

Trong C không có kiểu bảng hai chiều thật sự khi bạn cấp phát động, người ta
trải phẳng nó thành một mảng dài:

```c
float W[2 * 3] = {1,2,3, 4,5,6};   // hàng 0 rồi tới hàng 1, nối đuôi nhau
#define AT(W, cols, i, j)  W[(i) * (cols) + (j)]
// W[1,2] nằm ở chỉ số 1*3 + 2 = 5, đúng là số 6
```

Cách xếp này gọi là **row major**, các ô cùng một hàng nằm cạnh nhau trong bộ
nhớ. Nhớ chi tiết này, bài 7 sẽ cho thấy nó quyết định tốc độ.

Trong model thật, ma trận `blocks.0.attn.qkv.weight` có shape `[384, 128]`, tức
384 hàng và 128 cột, tổng cộng 49.152 số.

## 2.2 Cộng ma trận

Giống hệt cộng vector, làm từng ô một:

```
C[i,j] = A[i,j] + B[i,j]
```

Điều kiện: **hai ma trận phải cùng shape**. Cộng `[2,3]` với `[3,2]` là câu hỏi
vô nghĩa, và mọi thư viện sẽ báo lỗi shape ngay.

Phép này rẻ và song song hoàn toàn, nên nó gần như không bao giờ là chỗ chậm.

## 2.3 Chuyển vị: lật bảng

Chuyển vị là đổi hàng thành cột. Ký hiệu là `Aᵀ`.

```
A = [ 1  2  3 ]          Aᵀ = [ 1  4 ]
    [ 4  5  6 ]               [ 2  5 ]
                              [ 3  6 ]

shape [2,3]              shape [3,2]
```

Quy tắc: `Aᵀ[j, i] = A[i, j]`. Shape `[m,n]` thành `[n,m]`.

Vì sao cần: nhiều phép toán đòi hai ma trận phải "khớp cạnh" nhau. Chuyển vị là
cách xoay một ma trận cho khớp. Trong attention ở bài 4 có phép `QKᵀ`, và chữ
`ᵀ` ở đó chính là phép này.

Một điểm về phần cứng đáng biết sớm: chuyển vị **không tính toán gì cả**, nó chỉ
đọc số ở chỗ khác. Nhưng nếu làm thật trong bộ nhớ thì nó phá vỡ cách xếp row
major, biến việc đọc liên tiếp thành đọc nhảy cóc. Đây là lý do các thư viện
nhanh thường không chuyển vị thật, chúng chỉ đổi cách tính chỉ số.

## 2.4 Ma trận nhân vector: MATVEC

Đây là phép toán trả lời câu hỏi ở mục 2.0.

Ý tưởng: **mỗi hàng của ma trận làm một tích vô hướng với vector đầu vào.**

```
y = W x

W: [hàng, cột]        x: [cột]        y: [hàng]
```

Chú ý sự khớp: số cột của `W` phải bằng số chiều của `x`. Số chiều của `y` bằng
số hàng của `W`.

Tính tay với số nhỏ:

```
W = [ 1  2  3 ]      x = [ 1 ]
    [ 4  5  6 ]          [ 0 ]
                         [ 2 ]

y[0] = 1·1 + 2·0 + 3·2 = 1 + 0 + 6 = 7
y[1] = 4·1 + 5·0 + 6·2 = 4 + 0 + 12 = 16

y = [7, 16]
```

Viết gọn:

```
y[r] = tích vô hướng của hàng r của W với x
```

Trong C, đúng hai vòng lặp lồng nhau, và vòng trong chính là bài 1:

```c
for (int r = 0; r < rows; r++) {
    float acc = 0.0f;
    for (int c = 0; c < cols; c++)
        acc += W[r * cols + c] * x[c];     // tích vô hướng, hàng r
    y[r] = acc;
}
```

Đây là phép toán chiếm khoảng 90% thời gian khi model sinh chữ từng token một.
Bài 7 sẽ đo con số đó.

Một hàng của `W` làm gì với `x`, nhìn bằng hình học:

![Vector a bằng (3,4) và vector b bằng (5,1) cùng xuất phát từ gốc. Từ ngọn của
a hạ một đoạn vuông góc xuống đường thẳng chứa b, chân đường vuông góc rơi vào
điểm 0.731 nhân b. Đoạn từ gốc tới chân là thành phần song song, đoạn vuông góc
là phần bị bỏ.](/assets/images/study_ai/toan/chieu-vector.svg)

Tích vô hướng `a · b` đo **phần của `a` nằm dọc theo hướng `b`**. Phần vuông góc
với `b` không đóng góp gì vào con số đó, nó bị bỏ đi hoàn toàn.

Áp vào MATVEC: mỗi hàng của `W` là một hướng, và `y[r]` là phần của `x` nằm dọc
theo hướng của hàng `r`. Ma trận `[384, 128]` vì thế là 384 câu hỏi cùng dạng,
mỗi câu hỏi "`x` có bao nhiêu phần theo hướng này". Bài 4 sẽ cho thấy Q, K và V
chỉ là ba bộ hướng khác nhau, học được từ dữ liệu.

## 2.5 Ma trận nhân ma trận: MATMUL

Nếu thay `x` bằng cả một bảng, tức nhiều vector cùng lúc, thì được phép nhân ma
trận với ma trận.

```
C = A B

A: [m, k]      B: [k, n]      C: [m, n]
```

Quy tắc khớp shape, học một lần dùng mãi: **số cột của A phải bằng số hàng của
B**, và hai số đó biến mất khỏi kết quả.

```
[m, k] × [k, n] = [m, n]
     ↑     ↑
     phải bằng nhau, rồi triệt tiêu
```

Mỗi ô của kết quả là một tích vô hướng:

```
C[i,j] = tích vô hướng của hàng i của A với cột j của B
```

Tính tay đầy đủ một ví dụ 2×2:

```
A = [ 1  2 ]      B = [ 5  6 ]
    [ 3  4 ]          [ 7  8 ]

C[0,0] = hàng 0 của A · cột 0 của B = 1·5 + 2·7 = 5 + 14 = 19
C[0,1] = hàng 0 của A · cột 1 của B = 1·6 + 2·8 = 6 + 16 = 22
C[1,0] = hàng 1 của A · cột 0 của B = 3·5 + 4·7 = 15 + 28 = 43
C[1,1] = hàng 1 của A · cột 1 của B = 3·6 + 4·8 = 18 + 32 = 50

C = [ 19  22 ]
    [ 43  50 ]
```

Trong C, ba vòng lặp lồng nhau:

```c
for (int i = 0; i < m; i++)
    for (int j = 0; j < n; j++) {
        float acc = 0.0f;
        for (int p = 0; p < k; p++)
            acc += A[i*k + p] * B[p*n + j];    // vẫn là tích vô hướng
        C[i*n + j] = acc;
    }
```

Tên nghề nghiệp của phép này là **GEMM** (general matrix multiply). Khi đọc tài
liệu tối ưu của bất kỳ hãng chip nào, GEMM là từ xuất hiện nhiều nhất, và giờ
bạn biết nó chỉ là rất nhiều tích vô hướng xếp cạnh nhau.

**MATVEC là trường hợp riêng của MATMUL với `n = 1`.** Một cột thay vì nhiều cột.
Cùng công thức, nhưng bài 7 sẽ cho thấy hai trường hợp này chạy nhanh chậm khác
hẳn nhau trên cùng con chip, và lý do không nằm ở số phép tính.

## 2.6 Đếm số phép tính

Đếm bằng cách nhìn vòng lặp, không cần lý thuyết.

**MATVEC** có 2 vòng lồng nhau, chạy `rows × cols` lần, mỗi lần một nhân một cộng:

```
số phép tính ≈ 2 × rows × cols
```

Với `W` thật shape `[384, 128]`: `2 × 384 × 128 = 98.304` phép tính cho một token.

**MATMUL** có 3 vòng, chạy `m × k × n` lần:

```
số phép tính ≈ 2 × m × k × n
```

Ký hiệu Big-O chỉ là cách viết gọn "cái gì lớn lên thì tốn thêm bao nhiêu":

```
MATVEC:  O(R · C)
MATMUL:  O(M · K · N)
```

Nghĩa thực dụng: gấp đôi số hàng thì tốn gấp đôi. Gấp đôi cả ba chiều của MATMUL
thì tốn gấp tám.

Còn attention ở bài 4 có một chi tiết cần tách bạch ngay từ đây, vì rất nhiều
người nói gộp rồi kết luận sai:

```
phần tính điểm giữa các token:  O(T² · D)     lớn theo ĐỘ DÀI câu
phần chiếu và phần FFN:         O(T · D²)     lớn theo BỀ RỘNG model
```

`T` là số token trong câu, `D` là số chiều của model. Câu "Transformer là `O(T²)`"
chỉ đúng cho vế đầu, và vế đầu chỉ chiếm ưu thế khi `T` lớn so với `D`. Model
trong repo này có `D = 128`, nên với câu ngắn thì vế sau mới là chỗ tốn.

## 2.7 Vì sao MATVEC và MATMUL chạy khác nhau

Đây là cầu nối sang phần cứng, và là ý quan trọng nhất của bài.

Xét MATVEC `[384, 128] × [128]`:

```
đọc:   384 × 128 số của W, cộng 128 số của x
tính:  2 × 384 × 128 phép
```

Mỗi số của `W` được đọc lên **đúng một lần** rồi dùng đúng một lần. Đọc xong
dùng liền, không dùng lại được nữa.

Giờ xét MATMUL với `n = 32`, tức xử lý 32 token cùng lúc:

```
đọc:   vẫn 384 × 128 số của W
tính:  2 × 384 × 128 × 32 phép, gấp 32 lần
```

Cùng lượng dữ liệu đọc lên, nhưng làm được gấp 32 lần công việc. Mỗi số của `W`
sau khi nạp vào thanh ghi được **dùng lại 32 lần**.

Đây là toàn bộ lý do phần cứng thích MATMUL hơn MATVEC. Không phải vì MATMUL ít
việc hơn, mà vì nó **đọc bộ nhớ ít hơn tính trên mỗi phép tính**.

Nếu bạn từng viết DMA để kéo một khối dữ liệu vào bộ nhớ nội rồi cố vắt kiệt
khối đó trước khi kéo khối mới, thì đó chính xác là cùng một bài toán. Kéo dữ
liệu về là phần đắt, dùng lại được nhiều lần là phần lời.

Bài 7 đặt tên cho tỉ lệ này và đo nó bằng số thật.

## 2.8 Kỹ năng đọc shape

Đây là kỹ năng dùng hàng ngaỳ khi debug PyTorch, ONNX hay runtime, và luyện được
bằng cách nhìn hai số ở giữa có triệt tiêu không.

```
[2, 3] × [3, 4]  ->  [2, 4]     hợp lệ, 3 khớp 3
[2, 3] × [4, 3]  ->  LỖI        3 không khớp 4
[2, 3] × [3]     ->  [2]        matvec
```

Khi shape không khớp, cách sửa gần như luôn là chuyển vị một trong hai:

```
[2, 3] × [4, 3]ᵀ = [2, 3] × [3, 4] = [2, 4]     hợp lệ
```

Đây là lý do `ᵀ` xuất hiện trong `QKᵀ` ở bài 4. Không phải vì toán học thích ký
hiệu đẹp, mà vì không có nó thì shape không khớp.

## 2.9 Tự kiểm

1. `A` shape `[5, 8]`, `B` shape `[8, 3]`. `AB` shape gì? `BA` có tính được không?
2. Tính tay `[1 2; 0 1] × [3; 4]`.
3. Tính tay `[1 0; 0 1] × [7 8; 9 10]`. Nhận xét về kết quả.
4. MATVEC `[512, 256]` tốn bao nhiêu phép tính?
5. Vì sao xử lý 32 token cùng lúc nhanh hơn 32 lần xử lý 1 token, dù tổng số
   phép tính bằng nhau?

Đáp án 1: `[5, 3]`; `BA` không tính được vì 3 không khớp 5.
Đáp án 2: `[1·3 + 2·4, 0·3 + 1·4] = [11, 4]`.
Đáp án 3: ra đúng `[7 8; 9 10]`, vì ma trận kia là ma trận đơn vị.
Đáp án 4: `2 × 512 × 256 = 262.144`.

## Kết bài

1. **Ma trận là bảng số, shape là `[hàng, cột]`.** Trong C nó là mảng phẳng xếp
   theo hàng.
2. **MATVEC là mỗi hàng làm một tích vô hướng với vector.** Đây là phép chiếm
   phần lớn thời gian khi model sinh chữ.
3. **MATMUL là mỗi ô kết quả là một tích vô hướng.** Tên nghề là GEMM. MATVEC là
   trường hợp riêng với một cột.
4. **Shape khớp khi hai số ở giữa bằng nhau**, và chúng triệt tiêu.
5. **MATMUL nhanh hơn không phải vì ít việc hơn**, mà vì mỗi số weight đọc lên
   được dùng lại nhiều lần. Đây là ý sẽ được đo bằng số ở bài 7.

Bài 3 chuyển sang nhóm phép toán còn lại: làm gì đó trên từng phần tử, và bóp
nhiều số thành một số.

