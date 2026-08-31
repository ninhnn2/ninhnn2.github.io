---
sort: 1
image: /assets/images/og-study-ai-v2.jpg
---

# Toán cho AI nhúng, bắt đầu từ số 0

Loạt bảy bài dạy đủ phần toán để hiểu một model ngôn ngữ chạy trên chip nhúng.

**Yêu cầu đầu vào: cộng, trừ, nhân, chia, số âm, bình phương, căn bậc hai.** Đúng
chừng đó. Hết lớp 9 là đủ vốn. Mọi thứ khác, kể cả đạo hàm, được xây từ đầu
trong bài.

Không cần biết Python. Không cần biết C, dù ai biết C sẽ thấy quen vì mọi công
thức đều được viết lại thành vòng `for`.

## Vì sao học theo hướng này

Học toán để thi thì đi từ định nghĩa tới định lý tới bài tập. Loạt bài này đi
ngược: bắt đầu bằng một hiện tượng có thật trong model đã train, hỏi vì sao,
rồi mới dựng khái niệm và công thức để trả lời.

Mỗi phép toán đi qua năm chặng:

```
công thức toán  ->  ví dụ số nhỏ tính tay  ->  vòng for trong C
                ->  phần cứng làm nó thế nào  ->  chỗ nó nằm trong model thật
```

Chặng cuối là lý do loạt bài này khác sách giáo khoa. Tích vô hướng không dừng ở
`Σ aᵢbᵢ`, nó đi tiếp tới lệnh MAC của DSP và tới attention.

## Bảy bài

| Bài | Nội dung | Ra tới đâu |
|---|---|---|
| [1. Vector và tích vô hướng](/study_ai/toan/01-vector-va-tich-vo-huong) | vector, cộng trừ, tích vô hướng, độ dài, chuẩn hoá, khoảng cách, cosine | lệnh MAC, bộ lọc FIR |
| [2. Ma trận](/study_ai/toan/02-ma-tran) | shape, chuyển vị, MATVEC, MATMUL, đếm phép tính | GEMM, vì sao xử lý theo lô nhanh hơn |
| [3. Rút gọn và softmax](/study_ai/toan/03-rut-gon-va-softmax) | phép từng phần tử, rút gọn, RMSNorm, hàm kích hoạt, exp, log, softmax | tràn số và cách sửa |
| [4. Attention](/study_ai/toan/04-attention) | Linear, Q K V, `QKᵀ`, che tương lai, nhiều head | vì sao câu dài đắt |
| [5. Đạo hàm và cách model học](/study_ai/toan/05-dao-ham-va-hoc) | đạo hàm, đạo hàm riêng, gradient, quy tắc dây chuyền, gradient descent, loss | vì sao train tốn RAM hơn chạy |
| [6. Lượng tử hoá](/study_ai/toan/06-luong-tu-hoa) | scale, int4, sai số, đóng gói nibble | nhân cộng số nguyên trên chip nhúng |
| [7. FLOPs và băng thông](/study_ai/toan/07-hieu-nang) | FLOPs, cường độ số học, băng thông | memory-bound hay compute-bound |

Đọc theo thứ tự. Bài sau dùng lại bài trước, và bài 4 dùng lại cả ba bài đầu.

## Hình vẽ cũng sinh từ số thật

Mỗi bài có một hình hình học, đặt ngay sau phần cơ chế mà nó minh hoạ:

| Bài | Hình | Việc nó giải thích trong LLM |
|---|---|---|
| 1 | góc và độ dài của hai cặp từ | vì sao đo nghĩa bằng cosine chứ không bằng tích vô hướng thô |
| 2 | chiếu vector lên một hướng | mỗi hàng của ma trận đo phần của `x` nằm dọc theo hướng của hàng đó |
| 3 | ba vector về đường tròn đơn vị | RMSNorm bỏ độ lớn, giữ hướng |
| 4 | điểm trung bình có trọng số | attention chọn chỗ đứng giữa các vector Value |
| 5 | tiếp tuyến trên parabol loss | đạo hàm là độ dốc, và bước đi tỉ lệ với độ dốc |
| 6 | trục số 15 vạch của int4 | sai số là đoạn tới vạch gần nhất |
| 7 | roofline với ba bậc đo thật | vì sao bậc đọc ít byte hơn lại chạy chậm hơn |

Toạ độ trong hình được **tính từ công thức**, không đặt tay. Hình bài 1 lấy độ
dài và góc thẳng từ checkpoint, nên nó vẽ đúng tỉ lệ của model thật. Hình bài 7
lấy ba điểm từ kết quả `make -C samples/cpu run`.

Vẽ lại:

```bash
uv run python docs/toan/img/gen_hinh.py docs/toan/img       # tiếng Việt
uv run python docs/toan/img/gen_hinh.py docs/toan/img en    # tiếng Anh
```

Hình tự đổi màu theo giao diện sáng hoặc tối của trình duyệt.

## Mọi con số trong bài đều đo được lại

Không có con số nào chép từ sách. Embedding lấy từ checkpoint đã train trong
repo, sai số lượng tử hoá tính trên weight thật, tốc độ đo trên MacBook Pro M3.

Kiểm toàn bộ bằng một lệnh:

```bash
uv run python docs/toan/tools/so_that.py
```

Script chạy lại từng ví dụ, so với con số đang in trong bài, và **thoát mã 1 nếu
có một chỗ lệch**. Nó đã bắt được ba chỗ sai trong lúc viết loạt bài này.

Xem số của riêng một bài:

```bash
uv run python docs/toan/tools/so_that.py --giai-doan 4
```

Số phần cứng ở bài 7 đo bằng:

```bash
make -C samples/cpu run
```

Máy khác sẽ ra số khác. Đó là điều nên xảy ra, và bài 7 dạy cách đọc số của
chính máy bạn chứ không phải cách nhớ số của máy tôi.

## Khi nào coi là đã hiểu

Đánh dấu được hết những dòng dưới đây thì phần toán coi như xong.

Bài 1 và 2:

- [ ] Giải thích vector bằng một mảng C
- [ ] Tính tích vô hướng bằng tay
- [ ] Viết tích vô hướng bằng C mà không nhìn lại bài
- [ ] Phân biệt nhân từng phần tử với tích vô hướng
- [ ] Giải thích norm và chuẩn hoá
- [ ] Tính cosine, và nói được vì sao không dùng tích vô hướng thô để so giống nhau
- [ ] Đọc được shape, biết khi nào hai ma trận nhân được
- [ ] Tính tay ma trận nhân vector và ma trận nhân ma trận
- [ ] Giải thích vì sao nhân ma trận là nhiều tích vô hướng

Bài 3 và 4:

- [ ] Phân biệt phép từng phần tử với phép rút gọn
- [ ] Tự viết RMSNorm, và nói được vì sao cần hai vòng lặp
- [ ] Giải thích vai trò hàm kích hoạt
- [ ] Tính softmax bằng tay
- [ ] Giải thích mẹo trừ max, và vì sao kết quả không đổi
- [ ] Giải thích Q, K, V
- [ ] Lần được `QKᵀ` bằng shape
- [ ] Nói được vì sao che tương lai dùng âm vô cùng

Bài 5:

- [ ] Giải thích đạo hàm và ý nghĩa dấu của nó
- [ ] Giải thích đạo hàm riêng và gradient
- [ ] Áp dụng quy tắc dây chuyền cho hai tầng
- [ ] Làm tay một bước gradient descent, kiểm loss có giảm không
- [ ] Giải thích cross entropy phạt gì
- [ ] Nói được backpropagation khác gì với việc tính đạo hàm thông thường

Bài 6 và 7:

- [ ] Tính scale và lượng tử hoá một nhóm nhỏ bằng tay
- [ ] Giải thích vì sao sai số không vượt nửa vạch
- [ ] Đếm byte của một hàng ở int4 kèm scale
- [ ] Tính FLOPs của một MATVEC
- [ ] Tính cường độ số học
- [ ] Phân biệt memory-bound với compute-bound, và nói được cách kiểm
- [ ] Nhìn một vòng `for` trong C và nhận ra phép toán AI phía sau

## Phần cố ý không dạy

Ở giai đoạn này chưa cần tích phân, phương trình vi phân, giải tích phức, biến
đổi Laplace, đại số trừu tượng, hay xác suất thống kê nâng cao.

Một nhầm lẫn đáng nói riêng, vì hai thứ trông giống nhau:

```
tích vô hướng:  Σ aᵢbᵢ          cộng dồn rời rạc
tích phân:      ∫ f(x)g(x) dx    cộng dồn liên tục
```

Chúng chung ý tưởng cộng dồn, nhưng model chạy trên số rời rạc trong mảng, nên
thứ cần nắm là vế trái.

## Liên quan

Loạt bài này lo phần toán. Phần kiến trúc model, huấn luyện và triển khai nằm ở
[docs/begin_0/](/study_ai/), bắt đầu từ chương 1 về vector rồi đi tới
Transformer, KV cache và runtime trên ESP32, Jetson và DSP.

