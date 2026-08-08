---
sort: 1
---

# 1. Vector — dữ liệu trong AI

> Bài 1 trong loạt [AI cho kỹ sư nhúng](/study_ai/). Mọi đoạn code và mọi con số trong bài
> đều lấy từ repo [**PLE TinyLM**](https://github.com/ninhnn2/machineai) — mô hình
> 28,9 triệu tham số chạy trên ESP32-S3. Clone repo về rồi đọc song song sẽ hiệu quả
> hơn hẳn đọc chay.

Mọi thứ AI xử lý — một từ, một token, một pixel, một đoạn âm thanh — trước khi vào
mạng nơ-ron đều bị ép về **một dãy số thực có độ dài cố định**. Dãy số đó là vector.
Chương này xây lại trực giác vector từ đúng chỗ bạn đã có (mảng `float[]`, xử lý tín
hiệu số), rồi cho bạn xem một vector thật, đã học được nghĩa, lấy ra từ chính model
của repo đó.

## 1.0 Vì sao AI phải dùng vector

Trước khi định nghĩa vector, hỏi câu quan trọng hơn: vì sao phải có nó?

Với CPU, chuỗi `"cat"` chỉ là ba byte:

```c
char s[] = "cat";   // 99 97 116 — ba con số, không hơn
```

Ba byte đó nói được `'c'` đứng trước `'a'`, và hết. Nó **không** nói được điều mà
mọi tác vụ ngôn ngữ đều cần:

```
cat gần dog hơn là gần airplane
```

Tệ hơn: thước đo duy nhất có sẵn trên byte — hiệu mã ASCII — xếp hạng **tuỳ tiện so
với nghĩa**. Theo nó, hàng xóm gần nhất của `cat` là `car`, `cab`, `bat` (lệch đúng
1 mã), còn `cat` với `kitten` thì xa tít. Mã ASCII chỉ là **nhãn**: khoảng cách giữa
hai nhãn không mang thông tin gì về nội dung.

Vector giải quyết đúng chỗ đó — gán cho mỗi token một điểm trong không gian D chiều
sao cho **khoảng cách hình học mang nghĩa**. Sau khi train, không gian ấy (vẽ rất
thô, đây là hình chiếu 2D tưởng tượng) trông thế này:

```
        wolf ●
     dog ●
   cat ●
                                    ● airplane
                                 ● engine
                              ● wing
```

`cat`, `dog`, `wolf` tụm một chỗ; `airplane`, `engine`, `wing` tụm chỗ khác. Không
ai xếp bằng tay — gradient descent (chương 4) đẩy chúng về đó vì chúng xuất hiện
trong cùng loại ngữ cảnh.

Nhớ một câu: **vector không phải cách lưu dữ liệu gọn hơn, nó là cách biểu diễn
khiến "giống nhau" trở thành một phép toán tính được** (§1.3). Đó là toàn bộ lý do
nó tồn tại. Lưu ý hình trên chỉ để lấy trực giác: không gian thật là 96, 128, 768
hay 4096 chiều — không vẽ ra giấy được (bài tập 3).

## 1.1 Vector là gì

Bắt đầu bằng một dòng bạn đã gõ hàng nghìn lần:

```c
float v[128];
```

Nếu bạn viết C, bạn đã dùng vector hàng nghìn lần rồi — chỉ là chưa ai gọi nó bằng
cái tên đó. Dòng trên **chính là** một vector 128 chiều. Không có lớp bọc nào,
không có kiểu dữ liệu đặc biệt: một vector D chiều là một mảng D số thực, hết.

Toán học nhìn đúng dòng đó theo một cách khác, và cách nhìn này sẽ có ích ngay ở
đoạn dưới: coi 128 con số là toạ độ của **một điểm trong không gian 128 chiều** —
hoặc một mũi tên từ gốc toạ độ tới điểm đó — viết `v = [v0, v1, ..., v_{D-1}]`. Hai
cách nhìn, cùng một vùng nhớ.

Nó không khác gì buffer mẫu bạn dùng cho FIR filter hay FFT. Điểm khác duy nhất:
trong DSP, chỉ số của mảng thường mang nghĩa *thời gian* (`x[n]` = mẫu tại thời điểm
n). Trong AI, chỉ số mang nghĩa **một chiều đặc trưng học được** — không ai biết
trước chiều thứ 37 nghĩa là gì, mạng tự học ra cách dùng nó.

Giờ nhìn hai vector này:

```
a = [   1,    1,    1]
b = [1000, 1000, 1000]
```

Không cần công thức nào, bạn thấy ngay đúng hai điều. Thứ nhất, chúng **chỉ về cùng
một phía**: `b` chẳng qua là `a` nhân 1000, ba thành phần vẫn bằng nhau y hệt. Thứ
hai, `b` **dài hơn `a` rất nhiều**.

Đó cũng chính là hai đại lượng duy nhất mô tả một vector, và toán học đặt tên cho
chúng:

```
magnitude (độ lớn, norm)  = √(v0² + v1² + ... + v_{D-1}²)         -- "vector này dài cỡ nào"
direction (hướng)         = v / magnitude(v)                        -- "vector này trỏ về đâu", đã chuẩn hoá độ dài = 1
```

Thay số vào: `magnitude(a) = √3 ≈ 1.73` còn `magnitude(b) = 1000·√3 ≈ 1732` — lệch
đúng 1000 lần, trong khi hướng không đổi một chút nào. Hai đại lượng **độc lập
nhau**: đổi cái này không đụng tới cái kia.

Đây đúng là cặp tín hiệu bạn gặp mỗi ngày: cùng dạng sóng, khác biên độ. Magnitude ở
đây chính là năng lượng tín hiệu, còn RMS = `magnitude/√D` là biên độ hiệu dụng —
chia cho `√D` để con số không phụ thuộc việc bạn lấy 128 hay 1024 mẫu.

Normalize (`v / ‖v‖`) là bước ép mọi vector về cùng biên độ để **chỉ còn lại hướng**:

```
trước normalize                    sau normalize
                                   (cả hai nằm trên đường tròn bán kính 1)
      ● b   (dài)
    ● a     (ngắn)                       ● a ≡ b   (trùng khít)
  ╱                                    ╱
 gốc                                  gốc
```

Vì `a` và `b` chỉ khác biên độ, sau normalize chúng **trùng khít** nhau. Đó chính là
lý do cosine similarity (§1.3) — vốn là dot product của hai vector đã normalize —
phản ánh "giống nhau" tốt hơn dot product thô.

Mối liên hệ giữa `magnitude` và **RMS** ở trên không phải trùng hợp:
[`RMSNorm`](https://github.com/ninhnn2/machineai/blob/main/docs/02-hieu-model.md#rmsnorm-modelpy64)
— khối chuẩn hoá xuất hiện ở *mọi* lớp của transformer trong repo này — chính là
phép chia vector cho một đại lượng rất gần `magnitude`:

```python
# src/model.py:71
return self.weight * x * torch.rsqrt(x.pow(2).mean(-1, keepdim=True) + self.eps)
#                              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
#                              đây là 1/RMS(x), không phải 1/magnitude(x) —
#                              chia cho mean thay vì sum nên không phụ thuộc D
```

## 1.2 Vector biểu diễn gì trong AI

| Tên gọi | Vector của cái gì | Chiều dài điển hình | Ở repo này |
|---|---|---|---|
| **Token embedding** | một mảnh từ (token) | 96–4096 | `tok_emb.weight[id]` — [`model.py:156`](https://github.com/ninhnn2/machineai/blob/main/src/model.py#L156) |
| **Word embedding** | một từ trọn vẹn (tiền-BPE, hiếm dùng nay) | 300 (Word2Vec cổ điển) | không dùng trong repo |
| **Hidden state** | trạng thái của model tại 1 token, 1 lớp | = `d_model` | `s->x[D]` trong [`llm.h`](https://github.com/ninhnn2/machineai/blob/main/firmware/common/llm.h) |
| **Feature vector** | đặc trưng tổng quát của một đối tượng | tuỳ bài toán | — |
| **Image feature** | đặc trưng của 1 ảnh/vùng ảnh (sau CNN/ViT) | 512–2048 | không có trong repo (repo này là text) |
| **Audio feature** | đặc trưng của 1 khung âm thanh (MFCC, mel-spectrogram) | 13–128 | không có trong repo |

**Điểm chung của tất cả:** ban đầu là số ngẫu nhiên (`nn.init.normal_`,
[`model.py:195`](https://github.com/ninhnn2/machineai/blob/main/src/model.py#L195)), và **học được nghĩa qua gradient descent**
(chương 4). Không ai lập trình "chiều số 37 nghĩa là giống mèo" — nó tự nổi lên vì
xuất hiện lặp lại trong dữ liệu train.

### "Embedding 96 chiều nghĩa là 96 cái gì?"

Câu hỏi hay gặp nhất. Nếu embedding chỉ có 5 chiều và **giả sử** mỗi chiều mang một
nghĩa sạch sẽ, nó sẽ trông như:

```
cat = [ 0.9 ,  0.8 ,  0.1 ,  0.0 ,  0.6 ]
        furry  pet    fly    swim   cute      <- nhãn do TA gán vào sau, model không có
```

Hình dung này giúp bắt đầu, nhưng thực tế **không** như vậy, và ba điểm sau phải
hiểu đúng ngay:

- không chiều nào được lập trình sẵn tên gì — các nhãn ở trên chỉ là chú thích của
  con người, model không lưu chúng ở đâu cả;
- một khái niệm ("là động vật") thường trải trên **nhiều chiều cùng lúc**, và ngược
  lại một chiều thường **gánh nhiều khái niệm trộn lẫn** — buộc phải thế, vì D = 96
  nhỏ hơn rất nhiều so với số khái niệm cần biểu diễn trong TinyStories;
- hệ quả thực dụng: đọc riêng `emb[id][37]` gần như vô nghĩa. Chỉ **cả vector so với
  cả vector khác** (§1.3) mới cho ra con số đọc được.

### Thực hành 1 — nhìn một embedding thật đã học được nghĩa

**Chuẩn bị trước.** Hai file mà script dưới đây cần đều **đã được commit sẵn trong
repo**, clone về là chạy được ngay, không phải train lại:

```
data/bpe4096.json          tokenizer BPE 4096 từ vựng
runs/ple-jetson-s0.pt      checkpoint đã train (14 MB)
```

Nếu bạn muốn **tự sinh lại** — để đổi cấu hình, hoặc chỉ để xem quá trình train diễn
ra thế nào — thì hai lệnh sau tạo ra đúng hai file trên:

```bash
# ở thư mục gốc repo
uv run python data/prepare.py --vocab 4096          # -> data/bpe4096.json + train/val.bin
cd src && uv run python train.py --arm ple --vocab 4096 \
    --steps 2000 --tag jetson --seed 0              # -> runs/ple-jetson-s0.pt
```

Đây đúng là hai bước `prepare` + `train` trong [`firmware/jetson/run.sh`](https://github.com/ninhnn2/machineai/blob/main/firmware/jetson/run.sh),
chỉ bỏ phần container. Không cần GPU NVIDIA: [`train.py:20`](https://github.com/ninhnn2/machineai/blob/main/src/train.py#L20)
tự chọn **MPS** trên máy Mac Apple Silicon, `cuda` nếu có, không thì CPU. Đo thật:
21,3 phút trên MacBook Pro M3. Nếu chạy script mà gặp
`Exception: No such file or directory (os error 2)` ở dòng `Tokenizer.from_file`, tức
là bạn đang thiếu đúng hai file trên — chạy lại hai lệnh này.

Lấy embedding của vài từ và đo độ giống nhau (§1.3):

```bash
cd src && uv run python3 - <<'EOF'
import torch, torch.nn.functional as F
from tokenizers import Tokenizer

tok = Tokenizer.from_file("../data/bpe4096.json")
ck = torch.load("../runs/ple-jetson-s0.pt", map_location="cpu", weights_only=False)
emb = ck["state"]["tok_emb.weight"]          # [4096, 128] — 4096 vector 128 chiều
print("embedding shape:", tuple(emb.shape))

def tid(w): return tok.encode(" " + w).ids[0]
def cos(a, b): return F.cosine_similarity(emb[a:a+1], emb[b:b+1]).item()

# --- nhìn tận mắt MỘT vector, trước khi đo nó ---
torch.set_printoptions(precision=4, sci_mode=False, linewidth=88)
i = tid("cat")
print("token id =", i)
print(emb[i][:16])                                  # 16 trong 128 chiều
print(f"magnitude = {emb[i].norm():.4f}   std = {emb[i].std():.4f}")

pairs = [("cat","dog"), ("cat","puppy"), ("king","queen"), ("happy","sad"),
         ("cat","the"), ("cat","king")]
for a, b in pairs:
    print(f"{a:6s} vs {b:6s}: cos = {cos(tid(a), tid(b)):+.3f}")
EOF
```

Kết quả đo được thật — một lần chạy duy nhất, trên MacBook Pro M3 (MPS):

```
embedding shape: (4096, 128)
token id = 708
tensor([ 0.1700, -0.1482, -0.0753,  0.0389,  0.0437,  0.0198, -0.0931, -0.0767, -0.1027,
        -0.0491, -0.0514, -0.0627,  0.1532,  0.0520, -0.1667,  0.0285])
magnitude = 0.8086   std = 0.0710
cat    vs dog   : cos = +0.704
cat    vs puppy : cos = +0.498
king   vs queen : cos = +0.694
happy  vs sad   : cos = +0.616
cat    vs the   : cos = -0.137
cat    vs king  : cos = +0.249
```

**Có thể bạn hơi thất vọng.** Nhìn 16 số đó, bạn không đọc ra được gì cả — không có
số nào nói "mèo", không số nào nói "động vật". Cảm giác hụt hẫng đó hoàn toàn đúng,
và bản thân nó chính là bài học.

Embedding không giống một `struct` trong C, nơi mỗi field có tên riêng và đọc phát
hiểu ngay. Nó ngược lại: đấy là toàn bộ những gì model biết về token `cat` ở tầng
embedding — không từ điển, không luật, không một câu `if` nào — và **một embedding
chỉ có nghĩa khi đem so với embedding khác**. Ba điều cụ thể đọc được từ đống số
trên:

- **Giá trị nhỏ và quanh 0** (std 0.071, biên độ ±0.18). Đúng như mong đợi: chúng
  khởi tạo từ `nn.init.normal_` rồi bị gradient descent nắn dần, chứ không ai gán
  tay. Không có số nào "đặc biệt" cả.
- **Từng số riêng lẻ vô nghĩa với con người.** `emb[708][1] = -0.1482` không có nghĩa
  là "mèo", cũng không có nghĩa là "động vật" — đúng như đã cảnh báo ở §1.2, chiều
  thứ 1 không mang tên gì, và nghĩa của `cat` trải trên cả 128 chiều.
- **Cả vector thì có nghĩa.** `magnitude = 0.8086` là độ dài của mũi tên này trong
  không gian 128 chiều (§1.1) — và chính hướng của nó, chứ không phải độ dài, là thứ
  làm `cos(cat, dog) = +0.704` ở ngay dưới.

Cách hình dung để mang theo cả chương: **mỗi embedding là một điểm trong không gian
128 chiều**, và bảng `tok_emb.weight` là 4096 điểm nằm rải trong đó. Những token
dùng trong ngữ cảnh giống nhau bị gradient descent kéo về gần nhau; đó chính là bức
tranh ở §1.0, chỉ khác là bây giờ bạn đã nhìn thấy toạ độ thật của một điểm.

Và đây là lý do quy trình làm việc với embedding **không bao giờ là đọc từng phần
tử**. Toạ độ riêng lẻ không đọc được, nhưng *khoảng cách giữa hai điểm* thì đọc được
ngay — nên câu hỏi luôn được đặt ở dạng so sánh, và công cụ trả lời là cosine
similarity (§1.3), đúng sáu dòng bạn vừa in ra.

Từ đây trở đi, **mọi thứ transformer làm đều chỉ là biến đổi những vector như thế
này**: Linear chiếu nó (§1.4), Attention so nó với các vector khác bằng dot product
(§1.3), RMSNorm chia nó cho độ lớn của chính nó (§1.1). Không có bước nào quay lại
với chữ `c-a-t` nữa — chuỗi ký tự chết ngay tại bảng embedding, và từ đó chỉ còn số.

Số của bạn sẽ **không trùng tới chữ số thứ ba**, kể cả khi dùng đúng `--seed 0`. Lần
train gốc của tài liệu này chạy trên CUDA cho `cat/dog +0.705`, `king/queen +0.726`,
`cat/king +0.222` — so với bảng MPS ở trên thì lệch tới **0.032** ở cặp lệch nhiều
nhất. Chỉ cần thứ tự phép cộng float khác nhau giữa hai backend là đủ. Cái **tái lập
được** ở đây là thứ hạng và dấu của 6 cặp, không phải giá trị tuyệt đối; đọc
embedding luôn phải đọc theo kiểu so sánh tương đối như vậy.

Đọc kết quả: `cat`/`dog` gần nhau (cùng là động vật nuôi, xuất hiện trong ngữ cảnh
giống nhau). `cat`/`the` gần như trực giao, còn hơi âm — một từ nội dung (content
word) và một từ chức năng (function word) hiếm khi thay thế được cho nhau trong
câu. `happy`/`sad` **gần nhau dù nghĩa trái ngược** — bài học quan trọng: cosine
similarity của embedding đo **"xuất hiện trong ngữ cảnh giống nhau"**, không đo
"nghĩa giống nhau". Đừng nhầm hai thứ đó.

Vì sao lại thế, cụ thể: trong TinyStories, `happy` và `sad` rơi vào gần như đúng
cùng một bộ khung câu.

```
The cat is happy.          The cat is sad.
The dog is happy.          The dog is sad.
The child is happy.        The child is sad.
```

Model chỉ được train để **đoán token kế tiếp**. Với ngữ cảnh `The cat is ___`, cả
`happy` lẫn `sad` đều là đáp án hợp lệ, nên gradient descent (chương 4) kéo hai
embedding về cùng một vùng — vùng "tính từ trạng thái đứng sau `is`". Trái nghĩa là
quan hệ **ngữ nghĩa**; thứ model học được là quan hệ **phân phối** (distributional).
Diễn đạt cho chính xác: cosine cao không có nghĩa "đồng nghĩa", nó có nghĩa "thay
thế được cho nhau trong câu".

## 1.3 Khoảng cách giữa các vector

Có lẽ bạn đã viết đoạn code này vài trăm lần rồi:

```c
float a[] = {1, 2, 3};
float b[] = {4, 5, 6};

float sum = 0;
for (int i = 0; i < 3; i++)
    sum += a[i] * b[i];
```

Vòng lặp làm đúng hai việc: **nhân từng cặp phần tử**, rồi **cộng dồn tất cả lại**.

```
1×4 =  4
2×5 = 10
3×6 = 18
            ↓
    4 + 10 + 18 = 32
```

Toán học gọi phép tính đó là **dot product** (tích vô hướng). Đến giờ mới cần công
thức, và công thức chỉ là vòng `for` trên viết gọn lại:

```
dot(a,b)     = Σ aᵢbᵢ = ‖a‖ ‖b‖ cos(θ)     θ = góc giữa hai vector
```

Vế trái là đoạn code bạn vừa đọc. **Vế phải mới là chỗ bất ngờ**: đúng phép nhân-cộng
rẻ tiền đó, không thêm gì cả, lại đo được **góc** giữa hai vector. Một vòng `for` ba
dòng trả lời được câu "hai thứ này giống nhau tới đâu" — đó là lý do nó nằm trong mọi
lớp của mọi mạng nơ-ron.

Và bạn cũng đã viết đúng vòng lặp này trong bộ lọc FIR: `y[n] = Σ h[k]·x[n-k]` chính
là dot product giữa vector hệ số `h` và cửa sổ tín hiệu. Attention (chương 6) không
làm gì khác — hàng triệu dot product giữa vector "query" và vector "key" — chỉ khác
chỗ cả hai vector đều **học được** thay vì thiết kế bằng tay như hệ số FIR.

Từ đúng công thức đó sinh ra ba phép đo, ba câu hỏi khác nhau — chọn sai phép đo là
lỗi hay gặp nhất:

| Phép đo | Công thức | Đo cái gì | Dùng khi |
|---|---|---|---|
| **Dot product** | `Σ aᵢbᵢ` | vừa hướng vừa độ lớn | bên trong attention, bên trong mọi lớp Linear |
| **Cosine similarity** | `dot(a,b) / (‖a‖‖b‖)` | **chỉ hướng**, bỏ qua độ lớn | so sánh nghĩa của 2 embedding, tìm kiếm semantic |
| **Euclidean distance** | `√Σ(aᵢ-bᵢ)²` | khoảng cách thật trong không gian | clustering, k-NN, khi độ lớn có ý nghĩa vật lý |

**Vì sao dot product thô không dùng để so "giống nhau":** một vector dài (magnitude
lớn) sẽ cho dot product lớn với mọi thứ, kể cả thứ không liên quan — độ lớn "che"
mất thông tin hướng. Cosine similarity chia cho magnitude của cả hai để loại bỏ
nhiễu đó, chỉ còn lại góc.

### Thực hành 2 — so ba phép đo trên cùng một cặp vector

```python
import torch
a = torch.tensor([3.0, 4.0])          # magnitude 5
b = torch.tensor([6.0, 8.0])          # cùng hướng với a, magnitude 10
c = torch.tensor([4.0, -3.0])         # vuông góc với a

print("dot(a,b)   =", torch.dot(a, b).item())      # 3*6+4*8 = 50 -- LỚN, dễ hiểu lầm là "khác nhau nhiều"
print("cos(a,b)   =", torch.cosine_similarity(a, b, dim=0).item())  # 1.0 -- ĐÚNG: cùng hướng
print("dist(a,b)  =", torch.dist(a, b).item())      # 5.0
print("dot(a,c)   =", torch.dot(a, c).item())      # 0 -- vuông góc, không liên quan
print("cos(a,c)   =", torch.cosine_similarity(a, c, dim=0).item())  # 0.0
```

`a` và `b` cùng hướng (b = 2a) nên **cosine = 1.0 dù chúng khác hẳn về độ lớn** —
đúng cái ta muốn khi so nghĩa hai embedding, vì độ lớn của embedding thường chỉ phản
ánh tần suất xuất hiện của token, không phải "độ mạnh" của nghĩa.

## 1.4 Projection — chiếu vector

Đặt một câu hỏi rất thực dụng trước, chưa cần công thức nào:

> Có một vector `x`. Làm sao biết nó **giống hướng A tới mức nào**?

Bạn đã có sẵn câu trả lời từ §1.3: lấy dot product của `x` với A. Số càng lớn thì
càng giống hướng đó, bằng 0 là vuông góc — không liên quan gì nhau.

Và đó **chính xác là việc một lớp `nn.Linear` làm**, lặp lại hàng nghìn lần. Mỗi
hàng `wᵢ` của ma trận trọng số là **một hướng**. Mỗi số ở đầu ra, `yᵢ = dot(wᵢ, x)`,
trả lời **một câu hỏi**: "x giống hướng `wᵢ` bao nhiêu?". Một lớp Linear là cả một
bộ câu hỏi như thế, hỏi cùng một lúc.

Viết gọn lại thì đúng là công thức bạn đã gặp ở mọi nơi:

```
y = Wx
```

Về mặt hình học, `dot(wᵢ, x)` là **độ dài hình chiếu của `x` lên hướng `wᵢ`** (sai
khác một hệ số `‖wᵢ‖`) — và từ đó suy ra phép tách một vector thành phần song song
với một hướng cho trước và phần vuông góc còn lại:

```
thành phần song song:  a_∥ = (dot(a,b) / dot(b,b)) · b
thành phần vuông góc:  a_⊥ = a - a_∥
```

Đây không phải kiến thức trang trí: cách nghĩ "mỗi hàng weight là một câu hỏi về
hướng" sẽ dùng lại nguyên vẹn ở chương 3 (Matrix Multiplication) và chương 6
(Attention — Q·K chính là "token này giống câu hỏi kia bao nhiêu?").

## 1.5 Tensor — vector tổng quát hoá

```
Scalar   :  5                         hạng 0 (không chiều)     — 1 con số
Vector   :  [5, 2, 9]                 hạng 1                   — 1 mảng
Matrix   :  [[5,2],[9,1]]             hạng 2                   — bảng 2 chiều
Tensor 3D:  [batch, seq, dim]         hạng 3                   — 1 batch câu, mỗi câu 1 chuỗi vector
Tensor 4D:  [batch, channel, H, W]    hạng 4                   — ảnh (CNN dùng dạng này)
```

Trong `firmware/common/llm.h`, mọi tensor được lưu **phẳng** (flat array) — đúng
cách bạn đã quen trong C, không có class `Tensor` nào ở tầng runtime:

```c
// llm.h:57 — ple_table thật ra là tensor 2D [V, L*P], nhưng lưu là 1 mảng byte phẳng
QT ple_table;           // [V, L*P]

// truy cập hàng r (= token id) của tensor 2D [rows, cols]:
const uint8_t *row = t->codes + (size_t)r * t->row_bytes;   // llm.h:87
//                                          ^^^^^^^^^^^^ = cols * kích_thước_1_phần_tử
```

`shape` (`[rows, cols]`) chỉ tồn tại ở tầng Python/PyTorch để bạn suy luận; ở tầng C
nó biến mất, chỉ còn lại **stride** — bước nhảy con trỏ để đi từ hàng này sang hàng
kia. Đây chính là con đường bạn sẽ đi mỗi khi debug: PyTorch nói "shape sai", C nói
"đọc nhầm offset" — cùng một lỗi, hai cách nhìn.

### Tensor nhìn từ C: chỉ là bốn thứ đi cùng nhau

Tensor không phải cấu trúc dữ liệu kỳ lạ. Bóc ra, nó đúng là:

```
tensor = pointer (vùng nhớ)  +  shape  +  stride  +  dtype
```

Trong C thuần, một khai báo chỉ cho bạn phần đầu:

```c
float *buffer;      // biết dữ liệu ở đâu, không biết đọc nó thành hình gì
```

ba phần còn lại nằm trong đầu bạn — hoặc trong comment `// [V, L*P]`. Nhưng repo này
đã tự viết lại đủ cả bốn, chính là struct `QT`:

```c
// llm.h:27 — một "tensor descriptor" viết tay, không cần framework nào
typedef struct {
  const uint8_t  *codes;   // pointer: vùng nhớ (int4 đóng gói 2 giá trị/byte)
  const uint16_t *scales;  // pointer: scale fp16 theo từng nhóm
  int rows, cols,          // shape
      group, n_groups,     // dtype: int4 group-wise, mỗi nhóm `group` phần tử
      row_bytes;           // stride: bước nhảy 1 hàng = ceil(cols/2), xem bài tập 4
} QT;
```

PyTorch lưu đúng bốn thứ đó, chỉ là tự động. Nhờ vậy cùng một vùng nhớ diễn giải
được thành vector, matrix hay tensor 4D bằng `.view()`/`.reshape()` mà **không chép
lại byte nào** — và cũng vì vậy `.transpose()` chỉ đổi stride, để lại một tensor
*non-contiguous*, thứ sẽ cắn bạn khi export sang `model.bin` (chương 2).

## Bài tập

1. Chạy lại Thực hành 1 với 5 cặp từ khác trong TinyStories (`little`, `big`,
   `garden`, `forest`, `mom`, `dad`...). Cặp nào bạn dự đoán đúng độ giống nhau,
   cặp nào bất ngờ?
2. Tính bằng tay `magnitude`, rồi `direction`, của vector `[3, 4, 0]`. Kiểm lại bằng
   `torch.norm` và `F.normalize`.
3. `d_model` của cấu hình deploy là 96 ([`RESULTS.md`](https://github.com/ninhnn2/machineai/blob/main/RESULTS.md)). Một
   embedding 96 chiều — bạn **không thể** vẽ nó ra giấy. Đọc trước về PCA/t-SNE (sẽ
   không dùng trong repo này, nhưng là công cụ chuẩn để "nhìn" vector cao chiều) và
   giải thích bằng lời tại sao chiếu xuống 2D luôn làm mất thông tin.
4. Trong `llm.h:87` (`deq_row`), tìm dòng tính `row_bytes`. Giải thích bằng công
   thức vì sao `row_bytes = ceil(cols/2)` cho tensor int4 (2 giá trị/byte).

## Kết chương

Bốn ý phải mang theo sang chương sau:

1. AI ép mọi dữ liệu về vector **để "giống nhau" trở thành phép toán** — không phải
   để lưu cho gọn (§1.0).
2. Một vector có hai đại lượng độc lập: **hướng** và **độ lớn**. Cosine so hướng,
   Euclid so vị trí, dot product trộn cả hai (§1.1, §1.3).
3. Cosine cao nghĩa là **thay thế được cho nhau trong câu**, không phải đồng nghĩa
   (§1.2, `happy`/`sad`).
4. Ở tầng C, tensor tan biến thành `pointer + shape + stride + dtype` (§1.5).

Từ đây nảy ra câu hỏi tự nhiên: **những vector này ở đâu ra?** Có đúng hai loại,
khác nhau hoàn toàn:

| | Weight | Activation (hidden state) |
|---|---|---|
| Sinh ra lúc nào | trong lúc train | trong lúc chạy, cho từng câu |
| Sau khi train | **đứng yên vĩnh viễn** | tạo mới rồi vứt đi, mỗi token một lần |
| Nằm ở đâu trên ESP32-S3 | chỉ đọc — chia giữa SRAM/PSRAM/flash tuỳ kiểu truy cập (§2.3) | phải ghi được → SRAM (`s->x[D]`) |
| Là gì về mặt vai trò | **kiến thức** model đã học | **suy nghĩ** của model về câu này |

Chính sự phân đôi đó giải thích vì sao một model vừa "nhớ" được kiến thức cố định
vừa xử lý linh hoạt từng câu mới — và nó cũng là lý do 28.9M tham số chỉ-đọc có thể
nằm ngoài chip trong khi phần RAM ghi được vẫn vừa một MCU.

→ **Bài tiếp theo: Weight — kiến thức của mô hình.** Vector nào là **cố định**
(weight, học một lần rồi đứng yên) và vector nào **thay đổi mỗi lần chạy**
(activation, hidden state). Bài đang viết; bản nháp đầy đủ có sẵn ở
[`docs/begin_0/02-weight.md`](https://github.com/ninhnn2/machineai/blob/main/docs/begin_0/02-weight.md)
trong repo.

---

*Bài viết thuộc loạt [AI cho kỹ sư nhúng](/study_ai/). Góp ý hoặc báo lỗi: mở issue tại
[github.com/ninhnn2/machineai](https://github.com/ninhnn2/machineai/issues).*
