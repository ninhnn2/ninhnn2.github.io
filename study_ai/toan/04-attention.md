---
sort: 5
image: /assets/images/og-study-ai-v2.jpg
---

# Bài 4: Linear, Q K V, và attention

> Giai đoạn 4 của roadmap. Cần bài 1, 2 và 3. Đây là bài ghép mọi thứ lại.
>
> Bài 4 trong loạt [Toán cho AI nhúng](/study_ai/toan/). Mọi con số trong bài đo
> trên MacBook Pro M3 và kiểm bằng `docs/toan/tools/so_that.py` trong repo
> [PLE TinyLM](https://github.com/ninhnn2/machineai), bản gốc của
> [Viacheslav Sierbov (slvDev)](https://x.com/slvDev), giấy phép MIT.

## 4.0 Một câu tiếng Việt và một chỗ mơ hồ

Đọc câu này:

```
Con mèo đuổi con chuột vì nó đói.
```

"Nó" là con mèo hay con chuột?

Người đọc trả lời được ngay: con mèo, vì mèo đuổi chuột chứ chuột không đuổi
mèo, và kẻ đói là kẻ đi săn. Để trả lời, bạn phải **nhìn lại** những từ phía
trước và **cân nhắc từ nào liên quan nhất** với chữ "nó".

Model cũng phải làm đúng việc đó. Khi xử lý chữ "nó", nó phải quyết định nên
nhìn nhiều vào "mèo" hay nhiều vào "chuột".

Câu hỏi: làm sao biến "nhìn lại và cân nhắc từ nào liên quan" thành phép tính?

Câu trả lời là attention, và mọi mảnh của nó đã có trong ba bài trưóc.

```bash
uv run python docs/toan/tools/so_that.py --giai-doan 4
```

## 4.1 Linear: phép biến đổi cơ bản nhất

Trước khi tới attention, cần một khối nhỏ.

```
y = W x + b
```

Trong đó `W` là ma trận weight, `x` là vector vào, `b` là vector bias, `y` là
vector ra. Nhìn kỹ thì `Wx` chính là MATVEC của bài 2, còn `+ b` là phép cộng
từng phần tử của bài 3.

Điểm cần nhớ: **`nn.Linear` trong PyTorch không phải một phép toán mới.** Mở nó
ra chỉ có nhân ma trận và một phép cộng. Khi debug hiệu năng, đừng thấy chữ
`Linear` mà nghĩ đó là hộp đen, nó là MATVEC.

Vai trò của Linear là **chiếu** một vector sang một không gian khác. Vector vào
128 chiều, ma trận `[384, 128]`, vector ra 384 chiều. Cùng thông tin, biểu diễn
khác đi, và cách biểu diễn mới là thứ model học được.

## 4.2 Ba câu hỏi, ba vector

Quay lại chữ "nó" ở đầu bài. Model cần ba thứ khác nhau từ mỗi token:

1. Token này **đang tìm gì**? Với "nó", nó đang tìm một danh từ ở phía trước.
2. Token này **có gì để người khác tìm**? "mèo" có thể chào rằng nó là một danh
   từ chỉ con vật.
3. Nếu được chọn, token này **đóng góp thông tin gì**?

Ba câu hỏi khác nhau nên cần ba biểu diễn khác nhau, và cách tạo ra chúng là ba
phép Linear từ cùng một vector đầu vào:

```
Q = W_q · x       Query,  "tôi đang tìm gì"
K = W_k · x       Key,    "tôi là gì"
V = W_v · x       Value,  "tôi mang thông tin gì"
```

Ba ma trận `W_q`, `W_k`, `W_v` khác nhau, và cả ba đều học được từ dữ liệu.
Không ai gán nghiã cho chúng, model tự tìm ra cách chia vai này trong lúc train.

Trong model của repo này, ba ma trận đó gộp làm một cho nhanh:

```
blocks.0.attn.qkv.weight   shape [384, 128]
```

`384 = 3 × 128`. Một phép MATVEC ra 384 số, rồi cắt làm ba khúc 128 số cho Q, K
và V. Gộp như vậy đọc bộ nhớ một lượt thay vì ba lượt, đúng tinh thần bài 2.

## 4.3 Chấm điểm bằng tích vô hướng

Giờ tới phần chính, và nó chính là bài 1.

Để biết token `i` nên nhìn token `j` bao nhiêu, lấy **tích vô hướng giữa Q của
`i` và K của `j`**:

```
điểm[i, j] = Q[i] · K[j]
```

Nếu "tôi đang tìm gì" của `i` khớp với "tôi là gì" của `j` thì hai vector cùng
hướng, tích vô hướng lớn, điểm cao.

Làm việc này cho mọi cặp `(i, j)` thì được một bảng điểm. Mà "làm tích vô hướng
cho mọi cặp hàng" chính là nhân ma trận của bài 2:

```
S = Q Kᵀ
```

Kiểm shape, dùng kỹ năng ở mục 2.8:

```
Q:  [T, d]
K:  [T, d]
Kᵀ: [d, T]

Q Kᵀ = [T, d] × [d, T] = [T, T]
```

Chữ `ᵀ` ở đó không phải để cho đẹp. Không có nó thì `[T, d] × [T, d]` không khớp
shape và phép nhân không tồn tại.

Kết quả `[T, T]` là một bảng vuông: hàng `i` cột `j` là điểm mà token `i` chấm
cho token `j`.

## 4.4 Chia cho căn bậc hai của số chiều

Trước khi qua softmax, có một bước chia:

```
S = Q Kᵀ / √d_head
```

Model trong repo có `d_model = 128` và 4 head, nên `d_head = 128 / 4 = 32`, và
`1/√32 = 0.1768`.

Vì sao phải chia: tích vô hướng là tổng của `d` số hạng. Càng nhiều chiều thì
tổng càng lớn, đơn giản vì cộng nhiều thứ hơn. Điểm lớn đi vào `exp` của softmax
thì bung ra rất nhanh, và kết quả là xác suất gần như dồn hết vào một token duy
nhất, các token khác thành 0. Model mất khả năng cân nhắc nhiều nguồn cùng lúc.

Chia cho `√d` kéo độ lớn của điểm về mức không phụ thuộc số chiều. Đây là cùng
một ý với việc chia cho `D` trong RMS ở bài 1 và bài 3: xoá ảnh hưởng của số
chiều để con số so được.

## 4.5 Che phần tương lai

Model sinh chữ từ trái sang phải. Khi đang xử lý token thứ 3, nó **không được
phép** nhìn token thứ 4, vì lúc chạy thật token thứ 4 chưa tồn tại.

Cách làm: đặt điểm của những ô đó thành âm vô cùng trước khi qua softmax.

```
S = [ s00  −inf  −inf  −inf ]
    [ s10  s11   −inf  −inf ]
    [ s20  s21   s22   −inf ]
    [ s30  s31   s32   s33  ]
```

Vì sao dùng âm vô cùng chứ không dùng 0: `exp(−inf) = 0`, nên sau softmax những
ô đó có xác suất đúng bằng 0. Nếu đặt điểm bằng 0 thì `exp(0) = 1`, tức token
tương lai vẫn được chú ý một phần.

Kiểm bằng số thật, chạy trong script: hàng 0 sau softmax có `A[0,0] = 1.0` và
`A[0,3] = 0.0`. Token đầu tiên chỉ nhìn được chính nó, đúng như mong đợi.

## 4.6 Softmax rồi trộn Value

Qua softmax theo từng hàng, dùng bản ổn định của bài 3:

```
A = softmax(S)
```

Mỗi hàng giờ cộng lại bằng 1. Hàng `i` là câu trả lời cho "token `i` nên chia sự
chú ý của mình cho các token trước thế nào".

Bước cuối, dùng bảng trọng số đó để trộn các vector Value:

```
O = A V
```

Kiểm shape:

```
A: [T, T]      V: [T, d]
A V = [T, T] × [T, d] = [T, d]
```

Ra đúng shape ban đầu, nên nhiều lớp attention xếp chồng lên nhau được.

Ý nghĩa của phép cuối: output của token `i` là **trung bình có trọng số** của
tất cả Value phía trước, với trọng số là mức chú ý. Token nào được chấm điểm cao
thì đóng góp nhiều vào kết quả.

![Bốn vector Value vẽ từ gốc toạ độ, bốn ngọn của chúng nối thành một tứ giác.
Trọng số attention lần lượt 0.557, 0.092, 0.306 và 0.046, cộng lại bằng 1. Vector
kết quả O nằm bên trong tứ giác, lệch hẳn về phía V0 là vector có trọng số lớn
nhất.](/assets/images/study_ai/toan/attention-trung-binh.svg)

Chỗ cần nhìn: `O` luôn nằm **bên trong** tứ giác nối bốn ngọn V. Nó không thể
rơi ra ngoài, vì mọi trọng số đều không âm và cộng lại đúng bằng 1, đó chính là
hai tính chất mà softmax bảo đảm ở bài 3. Và `O` bị kéo về phía `V0` vì `V0` có
trọng số `0.557`, lớn hơn cả ba cái còn lại cộng lại.

Nói lại bằng chữ: attention không tạo ra thông tin mới, nó **chọn chỗ đứng** ở
giữa những thông tin đã có.

Quay lại chữ "nó" ở đầu bài. Nếu model học tốt, hàng của "nó" sẽ có trọng số cao
ở cột "mèo" và thấp ở cột "chuột", nên vector ra của "nó" mang phần lớn thông
tin của "mèo". Chỗ mơ hồ được giải quyết bằng một bảng số.

## 4.7 Toàn bộ attention trên một trang

```
x                                  vector vào,       [T, D]
  ↓  ba phép Linear (bài 2)
Q, K, V                            ba biểu diễn,     [T, d] mỗi cái
  ↓  nhân ma trận (bài 2)
S = Q Kᵀ                           bảng điểm,        [T, T]
  ↓  chia cho √d (bài 1)
S / √d                             điểm đã cân bằng
  ↓  che tương lai
S đã che                           tam giác dưới
  ↓  softmax từng hàng (bài 3)
A                                  trọng số,         [T, T], mỗi hàng cộng bằng 1
  ↓  nhân ma trận (bài 2)
O = A V                            kết quả,          [T, d]
```

Không có phép toán nào mới. Toàn bộ attention được lắp từ tích vô hướng, nhân ma
trận, chia, và softmax. Đó là lý do ba bài trước phải đi trước bài này.

Trong C, bỏ hết phần lo về batch và head, phần lõi đúng như sau:

```c
for (int i = 0; i < T; i++) {
    for (int j = 0; j <= i; j++) {          // j <= i chính là phép che
        float acc = 0.0f;
        for (int k = 0; k < d; k++)
            acc += Q[i*d+k] * K[j*d+k];     // tích vô hướng, bài 1
        s[j] = acc / sqrtf((float)d);
    }
    softmax(s, i+1);                        // bài 3
    for (int k = 0; k < d; k++) {
        float acc = 0.0f;
        for (int j = 0; j <= i; j++)
            acc += s[j] * V[j*d+k];         // trộn có trọng số
        O[i*d+k] = acc;
    }
}
```

## 4.8 Nhiều head

Thay vì một bảng attention 128 chiều, model chia thành 4 bảng 32 chiều chạy song
song, rồi nối kết quả lại.

```
d_model = 128,  n_heads = 4,  d_head = 32
```

Vì sao đáng làm: một bảng attention chỉ học được một kiểu quan hệ. Bốn bảng học
được bốn kiểu, ví dụ một head chuyên nối đại từ với danh từ, một head chuyên
theo dõi dấu câu. Chi phí gần như không đổi vì tổng số chiều vẫn là 128.

## 4.9 Vì sao câu dài lại đắt

Bảng `S` có shape `[T, T]`, nên số ô của nó là `T²`:

```
T = 512   ->  262.144 ô
T = 1024  ->  1.048.576 ô
```

Câu dài gấp đôi thì bảng lớn gấp bốn. Đây là con số hay bị nói gọn thành
"Transformer là `O(T²)`", và cách nói gọn đó dẫn tới kết luận sai, nên tách rõ:

```
phần Q Kᵀ và phần A V:   O(T² · d)     lớn theo độ dài câu
phần Linear và FFN:      O(T · D²)     lớn theo bề rộng model
```

Vế nào lớn hơn phụ thuộc `T` so với `D`. Model trong repo có `D = 128`, nên chỉ
khi câu vượt khoảng 128 token thì vế bình phương mới bắt đầu chiếm ưu thế. Với
model có `D` vài nghìn thì ngược lại, phần FFN mới là chỗ tốn.

Kết luận thực dụng: đừng thuộc lòng một công thức, hãy thay số của model mình
vào rồi so hai vế.

## 4.10 Tự kiểm

1. `Q` shape `[10, 64]`, `K` shape `[10, 64]`. `QKᵀ` shape gì?
2. Vì sao cần `ᵀ` trong `QKᵀ`?
3. Sau softmax, tổng một hàng của `A` bằng bao nhiêu? Vì sao?
4. Vì sao che tương lai bằng `−inf` mà không phải bằng `0`?
5. `d_model = 512`, `n_heads = 8`. `d_head` bằng bao nhiêu? Chia cho số nào
   trước softmax?
6. Attention có phép toán nào không xuất hiện ở bài 1, 2, 3 không?

Đáp án 1: `[10, 10]`.
Đáp án 3: bằng 1, vì softmax chia cho tổng.
Đáp án 5: `64`, chia cho `√64 = 8`.
Đáp án 6: không có.

## Kết bài

1. **Linear là MATVEC cộng bias**, không phải phép toán mới.
2. **Q, K, V là ba phép chiếu từ cùng một vector**, trả lời ba câu hỏi khác nhau,
   và ba ma trận đó học được chứ không do người gán.
3. **`QKᵀ` là bảng điểm mọi cặp token**, và nó là nhân ma trận của bài 2.
4. **Chia cho `√d` giữ điểm không phình theo số chiều**, cùng ý với chia cho `D`
   trong RMS.
5. **Che tương lai bằng `−inf`** để `exp` biến nó thành xác suất 0 tuyệt đối.
6. **Attention không chứa phép toán mới nào.** Nó là cách lắp bốn thứ đã biết.

Bài 5 chuyển sang câu hỏi khác hẳn: các ma trận weight kia từ đâu ra.

