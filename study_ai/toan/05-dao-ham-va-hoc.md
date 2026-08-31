---
sort: 6
image: /assets/images/og-study-ai-v2.jpg
---

# Bài 5: Đạo hàm, gradient, và cách model học

> Giai đoạn 5 của roadmap. Cần bài 1 tới 4. Đây là phần toán duy nhất của loạt
> bài không nằm trong chương trình phổ thông trước lớp 11, nên nó được xây từ
> con số 0.
>
> Bài 5 trong loạt [Toán cho AI nhúng](/study_ai/toan/). Mọi con số trong bài đo
> trên MacBook Pro M3 và kiểm bằng `docs/toan/tools/so_that.py` trong repo
> [PLE TinyLM](https://github.com/ninhnn2/machineai), bản gốc của
> [Viacheslav Sierbov (slvDev)](https://x.com/slvDev), giấy phép MIT.

## 5.0 Bốn triệu con số, không ai gõ tay

Model trong repo này có 4.120.768 tham số. Không ai ngồi gõ từng số. Lúc bắt đầu
chúng là số ngẫu nhiên, và model nói năng vô nghĩa.

Sau vài giờ chạy, cũng bốn triệu con số đó viết được câu tiếng Anh có nghĩa.

Không có ai sửa chúng. Vậy ai sửa?

Câu trả lời là một vòng lặp làm đúng bốn việc, lặp đi lặp lại hàng chục nghìn
lần:

```
1. đoán
2. đo xem đoán sai bao nhiêu
3. tính xem mỗi tham số góp bao nhiêu vào cái sai đó
4. nhích từng tham số theo hướng làm cái sai nhỏ lại
```

Việc 1 là bốn bài trước. Bài này lo việc 2, 3 và 4. Việc 3 là chỗ cần đạo hàm.

```bash
uv run python docs/toan/tools/so_that.py --giai-doan 5
```

## 5.1 Hàm số: vào một số, ra một số

```
y = f(x)
```

Đọc là "y phụ thuộc x". Cho `x` một giá trị thì `f` trả về một giá trị `y`.

```
f(x) = x²

f(2) = 4
f(3) = 9
f(4) = 16
```

Trong C, hàm số đúng là một hàm:

```c
float f(float x) { return x * x; }
```

Câu hỏi mà cả bài này xoay quanh: nếu `x` **nhích một chút** thì `y` thay đổi
bao nhiêu?

## 5.2 Đạo hàm là tốc độ thay đổi

Thử với `f(x) = x²` tại `x = 3`:

```
f(3)     = 9
f(3.01)  = 9.0601

x tăng 0.01  ->  y tăng 0.0601
tỉ lệ: 0.0601 / 0.01 = 6.01
```

Làm lại với bước nhỏ hơn:

```
f(3.001) = 9.006001
tỉ lệ: 0.006001 / 0.001 = 6.001
```

Bước càng nhỏ, tỉ lệ càng gần `6`. Con số `6` đó gọi là **đạo hàm** của `x²` tại
`x = 3`, viết là:

```
dy/dx tại x=3  =  6
```

Nghĩa đen của ký hiệu: `d` là "một chút", nên `dy/dx` là "y thay đổi một chút
chia cho x thay đổi một chút". Nó là một phép chia, không phải phép thuật.

Vài đạo hàm cần biết, chỉ chừng này là đủ cho cả loạt bài:

```
f(x) = c        ->  dy/dx = 0          hằng số không đổi
f(x) = x        ->  dy/dx = 1
f(x) = x²       ->  dy/dx = 2x         tại x=3 cho 6, khớp với đo ở trên
f(x) = c·x      ->  dy/dx = c
f(x) = eˣ       ->  dy/dx = eˣ
f(x) = log(x)   ->  dy/dx = 1/x
```

Dấu của đạo hàm là phần quan trọng nhất và hay bị bỏ qua:

```
đạo hàm dương  ->  tăng x thì y tăng
đạo hàm âm     ->  tăng x thì y GIẢM
đạo hàm bằng 0 ->  đang ở đáy hoặc đỉnh, nhích không đổi gì
```

Giữ chặt ý này, vì mục 5.6 dựa hoàn toàn vào nó.

## 5.3 Nhiều biến: đạo hàm riêng

Model không có một tham số, nó có bốn triệu. Nên câu hỏi thành: nếu **chỉ** nhích
tham số thứ 1000, giữ nguyên tất cả các tham số khác, thì kết quả đổi bao nhiêu?

Đó gọi là **đạo hàm riêng**, ký hiệu đổi từ `d` thành `∂`:

```
∂L/∂w
```

Đọc là "loss `L` đổi bao nhiêu khi chỉ `w` nhích". Cách tính không có gì mới:
coi mọi biến khác là hằng số rồi lấy đạo hàm bình thường.

```
f(x, y) = x² + 3y

∂f/∂x = 2x        coi y là hằng, 3y đạo hàm thành 0
∂f/∂y = 3         coi x là hằng, x² đạo hàm thành 0
```

## 5.4 Gradient là vector đạo hàm riêng

Xếp tất cả đạo hàm riêng thành một vector, và ta có một vector đúng nghĩa bài 1:

```
∇L = [ ∂L/∂w₀, ∂L/∂w₁, ∂L/∂w₂, ... ]
```

Ký hiệu `∇` đọc là nabla. **Gradient có đúng bằng số chiều với số tham số.** Model
4.120.768 tham số thì gradient là vector 4.120.768 chiều.

Ý nghĩa: gradient chỉ về hướng làm loss **tăng nhanh nhất**. Nên muốn loss giảm
thì đi nguợc lại, và đó là mục 5.6.

## 5.5 Quy tắc dây chuyền

Model có 6 lớp chồng lên nhau. Weight ở lớp 1 ảnh hưởng tới loss thông qua lớp
2, lớp 3, cho tới lớp 6. Làm sao tính được ảnh hưởng xuyên qua nhiều tầng như
vậy?

Bằng **quy tắc dây chuyền**, và nó dễ hơn vẻ ngoài của nó:

```
nếu   y = f(g(x))
thì   dy/dx = (dy/dg) · (dg/dx)
```

Chỉ là nhân các tỉ lệ với nhau.

Ví dụ số cụ thể. Đặt `g = a²` và `f = 3g`, với `a = 2`:

```
g = a² = 4
f = 3g = 12

dg/da = 2a = 4          a nhích 1 thì g nhích 4
df/dg = 3               g nhích 1 thì f nhích 3
df/da = 3 × 4 = 12      a nhích 1 thì f nhích 12
```

Kiểm bằng máy, dùng autograd của PyTorch: kết quả là `12.0`. Khớp.

Ví von đặt sau cơ chế: giống ba bánh răng ăn khớp nhau. Bánh đầu quay 1 vòng làm
bánh giữa quay 4 vòng, bánh giữa quay 1 vòng làm bánh cuối quay 3 vòng, nên bánh
đầu quay 1 vòng thì bánh cuối quay 12 vòng. Nhân các tỉ số truyền.

## 5.6 Gradient descent: cách nhích tham số

Giờ ghép lại. Công thức cập nhật, thứ chạy hàng chục nghìn lần trong lúc train:

```
w_mới = w_cũ − η · ∂L/∂w
```

`η` (đọc là eta) là **learning rate**, một số nhỏ như `0.001`, quyết định bước
nhích to hay nhỏ.

Dấu trừ là linh hồn của công thức. Gradient chỉ hướng loss tăng, ta muốn loss
giảm, nên đi ngược lại.

Làm tay một bước hoàn chỉnh. Bài toán: có `x = 2`, đáp án đúng là `t = 10`, model
đoán bằng `w · x`. Sai bao nhiêu thì đo bằng bình phương hiệu:

```
L = (w·x − t)²
```

Khởi đầu `w = 3`:

```
đoán:  w·x = 3 × 2 = 6
đúng:  t = 10
loss:  (6 − 10)² = 16
```

Tính đạo hàm bằng quy tắc dây chuyền. Đặt `u = w·x − t`, thì `L = u²`:

```
dL/du = 2u = 2(6 − 10) = −8
du/dw = x = 2
dL/dw = −8 × 2 = −16
```

Kiểm bằng autograd: `−16.0`. Khớp.

Đạo hàm âm, nghĩa là tăng `w` thì loss giảm. Cập nhật với `η = 0.1`:

```
w_mới = 3 − 0.1 × (−16) = 3 + 1.6 = 4.6
```

Kiểm xem có tốt hơn thật không:

```
đoán mới:  4.6 × 2 = 9.2
loss mới:  (9.2 − 10)² = 0.64
```

Loss từ `16` xuống `0.64`, giảm 25 lần trong đúng một bước. Đáp án hoàn hảo là
`w = 5`, và ta đã đi được phần lớn quãng đường tới đó.

![Đường cong parabol của loss theo w, đáy nằm ở w bằng 5. Tại điểm w bằng 3 có
một đường thẳng tiếp xúc với đường cong, độ dốc của nó bằng âm 16. Bốn chấm đánh
dấu bốn bước đi, chấm đầu ở w bằng 3 loss 16, chấm thứ hai ở w bằng 4.60 loss
0.64, hai chấm sau dồn sát đáy.](/assets/images/study_ai/toan/gradient-descent.svg)

Chỗ cần nhìn là **đường thẳng đỏ**, nó tiếp xúc với đường cong tại chỗ đang
đứng, và độ dốc của nó chính là đạo hàm `-16`. Dốc đi xuống về bên phải, nên
bước tiếp theo phải đi sang phải, đúng như dấu trừ trong công thức quy định.

Nhìn khoảng cách giữa các chấm: bước đầu rất dài, các bước sau ngắn dần. Không
phải vì learning rate thay đổi, mà vì càng gần đáy thì độ dốc càng nhỏ, và bước
đi tỉ lệ với độ dốc. Thuật toán tự hãm lại khi tới gần đích.

Đây là toàn bộ việc train, chỉ khác là làm với bốn triệu tham số thay vì một, và
lặp hàng chục nghìn lần.

Về learning rate, hai thất bại đối xứng:

```
η quá nhỏ  ->  mỗi bước nhích tí xíu, train lâu vô tận
η quá lớn  ->  nhảy vọt qua đáy, loss dao động hoặc phân kỳ
```

## 5.7 Loss: đo sai bao nhiêu

Việc số 2 trong vòng lặp ở đầu bài. Có hai hàm cần biết.

**Sai số bình phương trung bình**, dùng khi đầu ra là số:

```
MSE = (1/N) Σ (y − ŷ)²
```

Bình phương để sai lệch âm và dương không triệt tiêu nhau, và để lỗi lớn bị phạt
nặng hơn tỉ lệ thuận.

**Cross entropy**, thứ mà model ngôn ngữ dùng. Model không đoán một số, nó đưa ra
xác suất cho 4096 từ. Loss chĩ nhìn vào **xác suất mà model gán cho đáp án
đúng**:

```
loss = − log( p[đáp án đúng] )
```

Nhìn cách nó phạt:

```
model chắc chắn và đúng:   p = 0.999  ->  loss = 0.0010
model lưỡng lự:            p = 0.665  ->  loss = 0.4076
model sai hẳn:             p = 0.001  ->  loss = 6.9078
```

Đoán đúng gần như không bị phạt, đoán sai bị phạt rất nặng, và mức phạt tăng
không có trần khi `p` tiến về 0. Dấu trừ ở đầu là vì `log` của số nhỏ hơn 1 luôn
âm, thêm dấu trừ cho loss thành số dương.

Vì sao dùng `log` chứ không dùng thẳng `1 − p`: bài 3 đã nói, `log` biến phép
nhân thành phép cộng. Model tính xác suất cho cả câu bằng cách nhân xác suất
từng token, và tích của hàng trăm số nhỏ hơn 1 sẽ nhỏ tới mức `float` không giữ
nổi. Cộng các `log` thì không bị vấn đề đó.

Một con số hay gặp trong log train là **perplexity**, và nó chỉ là `exp(loss)`.
Loss `2.11` cho perplexity `8.25`, đọc là "model đang lưỡng lự như thể phải chọn
giữa khoảng 8 từ".

## 5.8 Backpropagation

Đây không phải một phép toán mới. **Backpropagation là áp dụng quy tắc dây
chuyền một cách có tổ chức, đi ngược từ loss về từng weight.**

Vì sao phải đi ngược. Giả sử tính xuôi: muốn biết `∂L/∂w` của một weight ở lớp
1, phải lần qua lớp 2, 3, 4, 5, 6. Làm vậy cho từng weight trong bốn triệu
weight thì tính lại cùng một thứ hàng triệu lần.

Đi ngược thì mỗi phần chỉ tính đúng một lần rồi tái sử dụng cho mọi weight phía
trước nó. Cùng kết quả, ít việc hơn rất nhiều.

Sơ đồ một vòng train:

```
     tính xuôi                            tính ngược
x  ->  lớp 1  ->  ...  ->  lớp 6  ->  L
                                       |
∂L/∂w₁  <-  ...  <-  ∂L/∂w₆  <---------+
```

Chi phí thực tế: tính ngược tốn khoảng gấp đôi tính xuôi, và phải **giữ lại** kết
quả trung gian của mọi lớp trong lúc tính xuôi để dùng khi tính ngược. Đây là lý
do train tốn RAM hơn chạy suy luận rất nhiều, và là lý do một model chạy được
trên Jetson chưa chắc train được trên Jetson.

## 5.9 Tự kiểm

1. `f(x) = x²`, tính `dy/dx` tại `x = 5`. Nếu `x` tăng 0.01 thì `y` tăng bao nhiêu?
2. `f(x,y) = 2x + y²`. Tính `∂f/∂x` và `∂f/∂y`.
3. `y = 5g`, `g = a²`, `a = 3`. Tính `dy/da`.
4. `w = 2`, `x = 3`, `t = 12`, `L = (wx − t)²`. Tính loss và `dL/dw`. Với `η = 0.05`,
   `w` mới bằng bao nhiêu?
5. Model gán xác suất `0.5` cho đáp án đúng. Cross entropy bằng bao nhiêu?
6. Vì sao backpropagation đi ngược chứ không đi xuôi?

Đáp án 1: `10`, `y` tăng khoảng `0.1`.
Đáp án 2: `2` và `2y`.
Đáp án 3: `5 × 2×3 = 30`.
Đáp án 4: đoán `6`, loss `36`, `dL/dw = 2(6−12)×3 = −36`, `w` mới `= 2 + 1.8 = 3.8`.
Đáp án 5: `−log(0.5) ≈ 0.693`.

## Kết bài

1. **Đạo hàm là tỉ lệ thay đổi**, và dấu của nó cho biết nên tăng hay giảm.
2. **Đạo hàm riêng là nhích một biến, giữ nguyên phần còn lại.**
3. **Gradient là vector chứa mọi đạo hàm riêng**, cùng số chiều với số tham số.
4. **Quy tắc dây chuyền là nhân các tỉ lệ**, và nó cho phép xuyên qua nhiều lớp.
5. **Gradient descent là `w = w − η·∂L/∂w`**, dấu trừ vì gradient chỉ hướng tăng.
6. **Backpropagation không phải phép toán mới**, nó là cách tổ chức quy tắc dây
   chuyền sao cho không tính lặp, và cái giá của nó là bộ nhớ.

Bài 6 hỏi một câu rất nhúng: bốn triệu số kia có cần đủ 32 bit mỗi số không.

