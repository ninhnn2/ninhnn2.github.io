---
sort: 21
image: /assets/images/og-study-ai-v2.jpg
---

# TinyStories: bộ dữ liệu dạy model này viết văn

> Thuộc loạt [AI cho kỹ sư nhúng](/study_ai/). Mọi con số đo trên chính file
> `data/tinystories_slice.txt` 315 MB, không lấy từ bài báo gốc.

Mọi chương trong loạt bài đều nhắc tới TinyStories, nhưng chưa chương nào mở nó ra
xem có gì bên trong. Chương này làm việc đó, bằng số đo trên chính file 315 MB đang
nằm trong `data/` của bạn.

Lý do đáng bỏ thời gian: khi bạn thay dữ liệu của mình vào (xem cuối chương), thứ
quyết định model học được hay không nằm ở những đặc điểm dưới đây, chứ không nằm ở
dung lượng.

## Nó trông như thế nào

Một truyện điển hình, lấy nguyên văn từ file:

```
Once upon a time, in a peaceful town, there lived a little boy named Tim. Tim
loved to run and play outside. One day, Tim saw a race in the park. He was
excited and wanted to join the race.

Tim went to his friend, Sarah, and said, "Let's start the race!" Sarah smiled
and said, "Yes, let's go!" They lined up with the other kids and waited for the
race to begin. When they heard the word "Go!", they started running as fast as
they could.

Tim and Sarah ran with all their speed, laughing and having fun. They could feel
the wind in their hair as they raced to the finish line. In the end, Tim won the
race and Sarah came in second. They were both so happy and proud of themselves.
```

Đọc xong bạn thấy ngay ba đặc điểm, và cả ba đều là lựa chọn có chủ ý:

- **Câu ngắn**, trung vị 9 từ.
- **Từ vựng hẹp**, toàn từ một đứa trẻ 4 tuổi biết.
- **Cấu trúc lặp**: có nhân vật, có sự kiện, có kết. Gần như truyện nào cũng vậy.

Đây không phải văn bản cào từ Internet. Nó do GPT-3.5 và GPT-4 sinh ra theo yêu cầu
"viết truyện chỉ dùng từ mà trẻ 3-4 tuổi hiểu được", trong bài báo của Ronen Eldan
và Yuanzhi Li ở Microsoft Research
([arXiv:2305.07759](https://arxiv.org/abs/2305.07759)).

## Các con số

Đo trên đúng file `data/tinystories_slice.txt` mà `prepare.py` tải về:

| Đại lượng | Giá trị |
|---|---:|
| Dung lượng | 315 MB |
| Số truyện | 344.375 |
| Tổng số từ | 61.185.238 |
| Từ khác nhau | 28.676 |
| Độ dài truyện (trung vị) | 152 từ |
| Độ dài câu (trung vị) | 9 từ |
| Sau khi mã hoá | 78.591.725 token |

Con số đáng chú ý nhất là **28.676 từ khác nhau** trên 61 triệu từ. Để so sánh, một
người bản ngữ trưởng thành nhận biết khoảng 20.000 tới 35.000 từ, còn văn bản cào từ
web thường có hàng triệu chuỗi khác nhau vì lẫn tên riêng, mã lỗi, URL và rác.

Phân bố còn lệch hơn thế:

```
  100 từ hay nhất phủ  60,8% văn bản
  500 từ hay nhất phủ  83,7%
 2000 từ hay nhất phủ  95,6%
 5000 từ hay nhất phủ  99,3%
```

Một model chỉ cần học tốt 2000 từ là xử lý được 95,6% những gì nó gặp. Đó chính là
điều khiến một model 1,5 triệu tham số viết được câu mạch lạc, trong khi cùng số
tham số đó bỏ vào văn bản web sẽ chỉ cho ra cháo chữ.

## Ở tầng token

`prepare.py` mã hoá corpus bằng BPE 4096 từ vựng, ra 78,6 triệu token, tức nén được
**3,98 byte mỗi token**. Đo phân bố trên 20 triệu token đầu:

```
  50 token hay nhất phủ  49,6%
 200 token hay nhất phủ  70,2%
1000 token hay nhất phủ  89,6%
```

15 token phổ biến nhất, kèm tỉ lệ thật:

```
   '.'      7,13%        'Ġa'     2,38%
'Ġand'      3,67%      'Ġwas'     2,02%
'Ġthe'      3,48%       'Ġit'     1,09%
   ','      3,42%      'Ġher'     0,95%
   'Ċ'      3,03%      'ĠShe'     0,92%
 'Ġto'      2,64%       'ĠHe'     0,90%
```

`Ġ` là dấu cách, `Ċ` là xuống dòng. Nửa số token trong corpus chỉ là 50 mẩu này.

Một chi tiết nói lên nhiều điều: **188 trong 4096 token không bao giờ xuất hiện** ở
20 triệu token đầu, và những token hiếm nhất chỉ xuất hiện đúng một lần
(`'Ġtrou'`, `'anch'`, `'Ġcraw'`). Đuôi phân bố mỏng tới mức đó nghĩa là 4096 đã dư
cho corpus này. Vocab lớn hơn sẽ chỉ thêm những mẩu mà model không đủ ví dụ để học.

Trung bình một truyện chiếm **224 token**. Với `seq_len = 512`, mỗi cửa sổ huấn
luyện chứa được khoảng hai truyện trọn vẹn, nên model luôn nhìn thấy đủ mở đầu, thân
và kết trong cùng một lần.

## Vì sao bộ dữ liệu này hợp với model nhỏ

Ba điều kiện phải xảy ra cùng lúc, và TinyStories thoả cả ba:

**Từ vựng hẹp nhưng ngữ pháp đầy đủ.** Model vẫn phải học thì, đại từ, mệnh đề quan
hệ và lời thoại, nhưng không phải học 500.000 danh từ riêng. Dung lượng tham số dồn
hết vào cấu trúc thay vì vào việc ghi nhớ từ.

**Không có tri thức thực tế.** Truyện không chứa ngày tháng, công thức, tên thủ đô.
Model không bị buộc phải nhớ những thứ mà 1,5 triệu tham số không có chỗ chứa. Đây
cũng là lý do model trong repo không trả lời được câu hỏi nào: nó chưa từng thấy một
sự kiện nào để mà nhớ.

**Lặp lại đủ nhiều.** Cùng một khuôn *"One day, X found Y. X was very happy."* xuất
hiện hàng chục nghìn lần với nhân vật và đồ vật khác nhau. Gradient descent cần lặp
để tách được cái bất biến (cấu trúc câu) khỏi cái thay đổi (danh từ).

Điểm thứ ba giải thích một hiện tượng ở [chương 1](01-vector.html): `happy` và `sad`
có cosine cao dù trái nghĩa. Chúng rơi vào đúng cùng một khuôn câu hàng chục nghìn
lần, nên model xếp chúng cạnh nhau.

## Chia train và val

`prepare.py` để 0,5% cuối làm tập validation:

```
train    78.591.725 token
val         394.933 token
```

Từ bản sửa gần đây, các tài liệu được **tráo thứ tự trước khi cắt**. Chi tiết này
nghe vụn vặt nhưng đã từng làm hỏng một thí nghiệm: tập val cắt theo vị trí, nên khi
nối corpus riêng vào cuối file, toàn bộ dữ liệu mới rơi vào validation và không có
chút nào vào training. Model không học được gì, val loss vọt lên, và không có thông
báo lỗi nào.

## Khi bạn thay dữ liệu của mình vào

Đây là phần đáng mang đi. Đối chiếu dữ liệu của bạn với bốn cột mốc dưới đây trước
khi train, sẽ đỡ mất vài giờ chạy vô ích:

| Cần kiểm | TinyStories | Ngưỡng đáng lo |
|---|---:|---|
| Số token | 78,6 triệu | dưới 5 triệu thì model học thuộc lòng thay vì học |
| Từ khác nhau | 28.676 | trên 100.000 thì vocab 4096 sẽ vỡ vụn |
| Nén | 3,98 byte/token | dưới 3 nghĩa là vocab quá nhỏ cho ngôn ngữ đó |
| Độ dài tài liệu | 224 token | dài hơn `seq_len` thì model không bao giờ thấy trọn một tài liệu |

Ba con số đầu do `prepare.py` in ra sẵn. Riêng dòng `compression: X bytes/token` là
dòng đáng nhìn nhất: tiếng Việt mã hoá bằng tokenizer của TinyStories chỉ đạt khoảng
1,5 byte/token vì dấu thanh bị vỡ thành byte thô, và đó là dấu hiệu bắt buộc phải
`--retrain-tokenizer` với vocab lớn hơn.

Lệnh để chạy trên dữ liệu của bạn:

```bash
uv run python data/prepare.py --input /đường/dẫn --vocab 4096 --retrain-tokenizer
```

Muốn biết dữ liệu đó có thật sự vào được model hay không thì dùng bộ mồi kiểm chứng
ở [`data/make_probe.py`](https://github.com/ninhnn2/machineai/blob/main/data/make_probe.py), vì val loss giảm chỉ chứng minh
model học được tiếng, không chứng minh nó học được **dữ liệu của bạn**.

## Bài tập

1. Chạy `uv run python data/prepare.py --vocab 8192` rồi so `compression` với con số
   3,98 của vocab 4096. Vocab gấp đôi có làm số token giảm một nửa không? Vì sao?
2. Đếm số truyện chứa từ `dragon` và số truyện chứa từ `algorithm`. Kết quả nói gì
   về những câu hỏi mà model này không bao giờ trả lời được?
3. Lấy 1000 truyện đầu, tính độ dài trung vị theo token thay vì theo từ. Tỉ số
   token/từ là bao nhiêu, và nó khớp với `compression` ở trên thế nào?

---

*Bài viết thuộc loạt [AI cho kỹ sư nhúng](/study_ai/). Góp ý: mở issue tại
[github.com/ninhnn2/machineai](https://github.com/ninhnn2/machineai/issues).*
