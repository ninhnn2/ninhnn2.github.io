---
sort: 2
image: /assets/images/og-study-ai-v2.jpg
---

# Bài 1: Vector và tích vô hướng

> Giai đoạn 1 của roadmap. Cần biết trước: cộng, trừ, nhân, chia, số âm, bình
> phương, căn bậc hai. Đúng chừng đó. Ai học hết lớp 9 là đủ vốn để đọc bài này.
>
> Bài 1 trong loạt [Toán cho AI nhúng](/study_ai/toan/). Mọi con số trong bài đo
> trên MacBook Pro M3 và kiểm bằng `docs/toan/tools/so_that.py` trong repo
> [PLE TinyLM](https://github.com/ninhnn2/machineai), bản gốc của
> [Viacheslav Sierbov (slvDev)](https://x.com/slvDev), giấy phép MIT.

## 1.0 Một hiện tượng lạ trước khi có công thức nào

Trong repo này có một model đã train xong. Nó không lưu chữ, nó lưu số. Mỗi từ
trong từ điển của nó ứng với một dãy 128 số.

Từ ` cat` ứng với dãy bắt đầu bằng:

```
0.1700  -0.1482  -0.0753  0.0389  0.0437  0.0198  -0.0931  -0.0767  ...
```

Từ ` dog` cũng có một dãy 128 số của riêng nó. Từ ` car` cũng vậy.

Bây giờ làm một phép tính rất đơn giản: nhân từng cặp số ở cùng vị trí rồi cộng
tất cả lại. Kết quả:

```
cat và dog  ->  0.4970
cat và car  ->  0.1779
```

Không ai dạy model rằng chó gần mèo hơn xe hơi. Không có dòng code nào ghi luật
đó. Model chỉ đọc truyện rồi tự chỉnh các con số kia. Vậy mà phép cộng dồn tầm
thường ở trên lại lôi được thông tin đó ra.

Bài này giải thích vì sao.

Chạy lại số trên máy bạn:

```bash
uv run python docs/toan/tools/so_that.py --giai-doan 1
```

## 1.1 Một số lẻ loi thì nói được rất ít

Nhiệt độ 30 độ. Đó là một **số**, trong toán gọi là **scalar** (đại lượng vô
hướng). Một số mô tả được một chiều thông tin, không hơn.

Nhưng nếu muốn mô tả **thời tiết**, một số là không đủ. Cần ít nhất:

```
nhiệt độ   30
độ ẩm      80
gió        12
```

Ba số này đi cùng nhau. Tách rời thì mất nghĩa, vì "30" một mình không cho biết
đó là nhiệt độ hay tuổi hay giá tiền.

Câu hỏi: gom mấy số đi chung thành một khối thì gọi là gì, và làm được gì với
khối đó?

## 1.2 Vector là một dãy số có thứ tự

**Vector là một dãy số, có thứ tự cố định, được coi như một đơn vị.**

Viết như sau:

```
x = [30, 80, 12]
```

Số vị trí trong dãy gọi là **số chiều**. Vector trên có 3 chiều. Embedding của
model ở đầu bài có 128 chiều.

Trong C, vector chính là mảng, không có gì bí ẩn:

```c
float x[3] = {30.0f, 80.0f, 12.0f};   // vector 3 chiều
float e[128];                          // vector 128 chiều
```

Hai điều cần nhớ ngay, vì mọi thứ sau này dựa vào chúng:

1. **Thứ tự có nghĩa.** `[30, 80, 12]` khác `[80, 30, 12]`. Vị trí 0 luôn là
   nhiệt độ, vị trí 1 luôn là độ ẩm. Đổi chỗ là đổi nghĩa.
2. **Hai vector chỉ so được khi cùng số chiều.** So một vector 3 chiều với một
   vector 5 chiều là câu hỏi không có nghĩa, giống như hỏi 3 mét nặng bao nhiêu.

Vector trong AI thường mang tên khác nhau tuỳ chỗ dùng, nhưng bản chất vẫn là
dãy số: `embedding` (dãy số đại diện cho một từ), `hidden state` (dãy số model
đang nghĩ dở), `feature vector` (dãy số mô tả đặc trưng).

Có thể hình dung vector 2 chiều là một điểm trên giấy kẻ ô: `[3, 4]` là điểm
cách gốc 3 ô sang phải và 4 ô lên trên. Cách hình dung này đúng và hữu ích, chỉ
đừng cố tưởng tượng 128 chiều, không ai làm đựơc và cũng không cần.

## 1.3 Cộng, trừ, nhân với một số

Ba phép này làm **từng vị trí một**, không trộn các vị trí với nhau.

```
a = [1, 2, 3]
b = [4, 5, 6]

a + b = [1+4, 2+5, 3+6] = [5, 7, 9]
b - a = [4-1, 5-2, 6-3] = [3, 3, 3]
2a    = [2·1, 2·2, 2·3] = [2, 4, 6]
```

Trong C, mỗi phép là một vòng lặp một dòng:

```c
for (int i = 0; i < D; i++) c[i] = a[i] + b[i];   // cộng
for (int i = 0; i < D; i++) c[i] = 2.0f * a[i];   // nhân với số
```

Điểm đáng chú ý về phần cứng, sẽ dùng lại ở bài 7: vị trí `i` không cần biết gì
về vị trí `j`. Nghĩa là 128 phép cộng này **làm song song được hết**. Đây là lý
do các phép loại này chạy rất nhanh trên SIMD, DSP và GPU.

Kết quả trả về vẫn là một vector cùng số chiều.

## 1.4 Tích vô hướng: phép tính ở đầu bài

Giờ quay lại phép tính đã mở đầu. Nó khác ba phép trên ở một điểm: **kết quả là
một số duy nhất**, không phải một vector.

Bắt đầu bằng vòng lặp, chưa cần công thức:

```c
float acc = 0.0f;
for (int i = 0; i < D; i++) {
    acc += a[i] * b[i];      // nhân cặp cùng vị trí, cộng dồn vào acc
}
// acc là kết quả
```

Chạy tay với số nhỏ:

```
a = [1, 2, 3]
b = [4, 5, 6]

i=0:  acc = 0  + 1·4 = 4
i=1:  acc = 4  + 2·5 = 14
i=2:  acc = 14 + 3·6 = 32
```

Kết quả `32`.

Toán học gọi phép tính này là **tích vô hướng**. Tài liệu tiếng Anh và tên hàm
trong code gọi nó là `dot product`, cùng một thứ. Đến đây công thức mới có ích,
vì nó chỉ là vòng `for` ở trên viết gọn:

```
a · b = Σ aᵢbᵢ = a₀b₀ + a₁b₁ + ... + a_{D-1}b_{D-1}
```

Ký hiệu `Σ` (đọc là xích ma) nghĩa là "cộng dồn tất cả". Nó chính là chữ `+=`
trong vòng lặp, không hơn.

Phần cứng gọi cặp "nhân rồi cộng dồn" này là **MAC** (multiply accumulate). Đây
là lý do mọi con chip làm AI, từ DSP của TI tới Tensor Core của NVIDIA, đều
quảng cáo số MAC trên giây. Bài 7 quay lại chuyện này.

## 1.5 Chỗ gần như ai cũng nhầm một lần

Có hai phép tính nhìn giống nhau nhưng khác hẳn:

```
nhân từng phần tử:  a * b = [1·4, 2·5, 3·6] = [4, 10, 18]     -> VECTOR
tích vô hướng:      a · b = 1·4 + 2·5 + 3·6 = 32              -> MỘT SỐ
```

Tích vô hướng chính là "nhân từng phần tử rồi cộng hết lại". Bước cộng dồn ở
cuối là chỗ khác nhau, và nó đổi hẳn kiểu kết quả.

| | Làm gì | Kết quả | Vào ra |
|---|---|---|---|
| Nhân từng phần tử | `c[i] = a[i]*b[i]` | vector `D` chiều | `D` số ra `D` số |
| Tích vô hướng | `acc += a[i]*b[i]` | một số | `2D` số ra `1` số |

Cột cuối là chỗ quan trọng nhất và bài 7 sẽ đo nó: tích vô hướng **nuốt** rất
nhiều số để nhả ra đúng một số. Đọc nhiều, ghi ít.

## 1.6 Vector dài bao nhiêu

Vector `[3, 4]` là điểm cách gốc 3 ô ngang và 4 ô dọc. Khoảng cách thẳng từ gốc
tới điểm đó là bao nhiêu?

Đây đúng là định lý Pythagore của lớp 7:

```
độ dài = √(3² + 4²) = √(9 + 16) = √25 = 5
```

Công thức tổng quát cho `D` chiều, gọi là **norm** hay **độ lớn**, viết là `||x||`:

```
||x|| = √(Σ xᵢ²) = √(x₀² + x₁² + ... )
```

Trong C:

```c
float acc = 0.0f;
for (int i = 0; i < D; i++) acc += x[i] * x[i];   // lại là MAC, với b = a
float norm = sqrtf(acc);
```

Chú ý: `Σ xᵢ²` chính là tích vô hướng của `x` với chính nó. Nên `||x||² = x · x`.
Một công thức, hai cách đọc.

Một họ hàng gần sẽ gặp lại ở bài 3, gọi là **RMS** (căn quân phương), khác norm
đúng một chỗ là chia cho số chiều trưóc khi lấy căn:

```
RMS(x) = √( (1/D) Σ xᵢ² )
```

Vì sao phải chia: norm của vector 128 chiều luôn lớn hơn norm của vector 3
chiều, chỉ vì cộng nhiều số hạng hơn. Chia cho `D` xoá ảnh hưởng của số chiều,
cho ra một con số so được giữa các vector khác cỡ.

Số thật từ model: `||emb(cat)|| = 0.8086`.

## 1.7 Chuẩn hoá: giữ hướng, bỏ độ dài

Lấy vector chia cho chính độ dài của nó:

```
x = [3, 4]        ||x|| = 5
x / ||x|| = [3/5, 4/5] = [0.6, 0.8]
```

Kiểm lại: `√(0.6² + 0.8²) = √(0.36 + 0.64) = √1 = 1`. Đúng bằng 1.

Việc này gọi là **chuẩn hoá**. Sau khi chuẩn hoá, mọi vector đều dài đúng 1, chỉ
còn khác nhau ở **hướng**.

Vì sao đáng làm: một vector mang hai loại thông tin trộn vào nhau, **hướng** (nó
chỉ về phía nào) và **độ dài** (nó mạnh cỡ nào). Nhiều lúc chỉ cần hướng. Chuẩn
hoá là cách tách hai thứ đó ra.

Mục kế tiếp cho thấy nếu không tách, chuyện gì xảy ra.

## 1.8 Hai cách hỏi "hai vector này có giống nhau không"

**Cách 1, đo khoảng cách.** Trừ hai vector rồi lấy độ dài của hiệu:

```
distance(a,b) = ||a − b||
```

Với `a=[1,2,3]`, `b=[4,5,6]`: hiệu là `[−3,−3,−3]`, độ dài là `√27 ≈ 5.196`.
Số càng nhỏ thì hai vector càng nằm gần nhau.

**Cách 2, đo góc.** Đây là chỗ tích vô hướng quay lại. Công thức:

```
cosine(a,b) = (a · b) / (||a|| · ||b||)
```

Tức là lấy tích vô hướng rồi chia cho độ dài của cả hai. Chia như vậy là để xoá
ảnh hưởng của độ dài, y hệt việc chuẩn hoá ở mục 1.7. Thật ra nếu hai vector đã
chuẩn hoá sẵn thì `cosine(a,b)` **chính là** `a · b`, vì hai mẫu số đều bằng 1.

Kết quả luôn nằm trong khoảng từ `−1` tới `+1`:

```
+1  cùng hướng hoàn toàn
 0  vuông góc, không liên quan
−1  ngược hướng hoàn toàn
```

## 1.9 Vì sao không dùng thẳng tích vô hướng để đo giống nhau

Đây là chỗ dễ nói suông, nên lấy số thật trong model ra xem.

```
                tích vô hướng thô     cosine
cat  và dog          0.4970           0.7038
happy và sad         0.6299           0.6158
```

Đọc kỹ hai cột. Chúng **xếp hạng ngược nhau**:

- Theo tích vô hướng thô, cặp happy/sad (`0.6299`) có vẻ giống nhau hơn cặp
  cat/dog (`0.4970`).
- Theo cosine, ngược lại: cat/dog (`0.7038`) giống nhau hơn happy/sad (`0.6158`).

Vì sao lệch? Nhìn độ dài của bốn vector:

```
||emb(cat)||   = 0.8086
||emb(dog)||   = 0.8733
||emb(happy)|| = 1.0462
||emb(sad)||   = 0.9777
```

Hai vector happy và sad **dài hơn** hẳn. Tích vô hướng nhân độ dài vào kết quả,
nên hai vector dài luôn cho tích lớn, kể cả khi hướng của chúng không đặc biệt
giống nhau. Cosine chia độ dài đi nên không bị đánh lừa.

Một vector dài cho tích vô hướng lớn với gần như mọi thứ. Độ lớn che mất hướng.

![Hai bảng cạnh nhau. Bảng trái: vector cat nằm ngang dài 0.8086 và vector dog
nghiêng 45.3 độ dài 0.8733, tích vô hướng 0.4970, cosine 0.7038. Bảng phải:
vector happy nằm ngang dài 1.0462 và vector sad nghiêng 52.0 độ dài 0.9777,
tích vô hướng 0.6299, cosine 0.6158.](/assets/images/study_ai/toan/cosine-vs-tich-vo-huong.svg)

Hình vẽ đúng tỉ lệ, độ dài và góc lấy thẳng từ model đã train. Chỗ cần nhìn:
cặp bên phải có **góc rộng hơn**, tức kém giống nhau hơn về hướng, nhưng hai mũi
tên của nó **dài hơn**, và chính độ dài đó đẩy tích vô hướng của chúng lên cao
hơn cặp bên trái. Cosine chia độ dài đi nên chỉ còn góc, và thứ hạng lật lại.

Đó là lý do khi câu hỏi là "hai thứ này có cùng ý nghiã không", người ta dùng
cosine chứ không dùng tích vô hướng thô. Còn bên trong lớp Linear và bên trong
attention thì lại dùng tích vô hướng thô, vì ở đó độ lớn là thông tin cần giữ
chứ không phải nhiễu cần bỏ.

## 1.10 Vì sao kỹ sư nhúng nên thấy quen

Bộ lọc FIR, thứ ai làm DSP cũng viết ít nhất một lần:

```c
y[n] = 0;
for (int k = 0; k < N; k++) y[n] += h[k] * x[n-k];
```

So với tích vô hướng:

```c
acc = 0;
for (int i = 0; i < D; i++) acc += a[i] * b[i];
```

Cùng một phép toán, không lệch một dấu. FIR là tích vô hướng giữa vector hệ số
`h` và một cửa sổ tín hiệu.

Attention trong Transformer, thứ mà bài 4 sẽ dựng lại, không làm gì khác ngoài
hàng triệu tích vô hướng giữa các vector. Nếu bạn đã tối ưu FIR bằng SIMD hay
bằng MAC của DSP thì kỹ năng đó dùng lại được gần như nguyên vẹn.

## 1.11 Tự kiểm

Tính bằng tay, rồi chạy script để đối chiếu.

1. `a = [2, 0, 1]`, `b = [1, 3, 4]`. Tính `a + b`, `3a`, `a · b`.
2. `||[6, 8]||` bằng bao nhiêu? Chuẩn hoá nó.
3. Hai vector `[1, 0]` và `[0, 1]` có cosine bằng bao nhiêu? Giải thích nghĩa.
4. Vector `[2, 0]` và `[100, 0]` cùng hướng. Tích vô hướng của mỗi cái với
   `[1, 0]` bằng bao nhiêu? Cosine bằng bao nhiêu? Con số nào phản ánh đúng
   chuyện chúng cùng hướng?
5. Viết tích vô hướng bằng C, không nhìn lại bài.

Đáp án câu 1: `[3, 3, 5]`, `[6, 0, 3]`, `2·1 + 0·3 + 1·4 = 6`.
Đáp án câu 4: tích vô hướng cho `2` và `100`, cosine cho `1` và `1`. Cosine đúng.

## Kết bài

Năm điều mang sang bài sau:

1. **Vector là dãy số có thứ tự.** Trong C nó là mảng. Thứ tự có nghĩa, và chỉ
   so được hai vector cùng số chiều.
2. **Tích vô hướng là nhân từng cặp rồi cộng dồn, ra một số.** Phần cứng gọi nó
   là MAC. Đây là viên gạch của Linear, của nhân ma trận và của attention.
3. **Nhân từng phần tử không phải tích vô hướng.** Khác nhau ở bước cộng dồn
   cuối, và bước đó đổi hẳn kiểu kết quả.
4. **Norm là độ dài, chuẩn hoá là bỏ độ dài giữ hướng.** `||x||² = x · x`.
5. **Cosine đo hướng, tích vô hướng thô trộn cả hướng lẫn độ lớn.** Trên model
   thật, hai cách này xếp hạng ngược nhau ở cặp cat/dog và happy/sad, và lý do
   là bốn vector đó không dài bằng nhau.

Bài 2 xếp nhiều vector chồng lên nhau thành ma trận, và cho thấy nhân ma trận
chỉ là làm rất nhiều tích vô hướng cùng lúc.

