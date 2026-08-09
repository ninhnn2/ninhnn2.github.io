---
sort: 23
image: /assets/images/og-study-ai-v2.jpg
---

# Demo: từ FP32 tới INT4 tới silicon

> Thuộc loạt [AI cho kỹ sư nhúng](/study_ai/). Số lấy từ chính
> `firmware/model/model.bin` đã commit, sinh bằng
> [`src/trace_quant.py`](https://github.com/ninhnn2/machineai/blob/main/src/trace_quant.py).

Câu "INT4 tiết kiệm bộ nhớ" ai cũng nói được. Trang này cho bạn nhìn thấy nó **lấy
đi cái gì**, trên đúng hàng weight của token `cat` trong model đang chạy.

<div id="q"></div>

<script>
/*
  Số do trace_quant.py sinh, dùng chính export.py:quant_pack của repo chứ không
  viết lại phép lượng tử. Script còn giải nén một hàng từ model.bin trên đĩa theo
  đúng cách deq_row() trong llm.h làm, rồi so với bản Python; chênh lệch phải bằng 0.

  LƯU Ý: chỉ dùng comment khối, trình nén gộp script vào một dòng.
*/
var Q = {"config":{"d_model":128,"vocab":4096,"group":128,"bits":4,"row":708,"row_label":"tok_emb[708] = ' cat'"},"row":{"fp32":[0.17001,-0.14819,-0.07534,0.03893,0.04372,0.01977,-0.09311,-0.07667,-0.1027,-0.04915,-0.05137,-0.06267,0.15318,0.05195,-0.16665,0.02849,-0.10261,0.07262,-0.07958,0.06016,0.0147,-0.0391,0.04294,-0.04609,-0.01078,0.02022,-0.10905,-0.11728,-0.05574,-0.0484,0.07509,-0.11326],"codes":[7,-6,-3,2,2,1,-4,-3,-4,-2,-2,-2,6,2,-6,1,-4,3,-3,2,1,-2,2,-2,0,1,-4,-5,-2,-2,3,-4],"dq":[0.18169,-0.15573,-0.07787,0.05191,0.05191,0.02596,-0.10382,-0.07787,-0.10382,-0.05191,-0.05191,-0.05191,0.15573,0.05191,-0.15573,0.02596,-0.10382,0.07787,-0.07787,0.05191,0.02596,-0.05191,0.05191,-0.05191,-0.0,0.02596,-0.10382,-0.12978,-0.05191,-0.05191,0.07787,-0.10382],"err":[0.01167,0.00754,0.00253,0.01298,0.00819,0.00619,0.01071,0.0012,0.00112,0.00276,0.00054,0.01076,0.00255,4e-05,0.01092,0.00254,0.00121,0.00524,0.00171,0.00825,0.01125,0.01281,0.00897,0.00582,0.01078,0.00574,0.00523,0.0125,0.00383,0.00351,0.00277,0.00944]},"group0":{"scale":0.025955,"absmax":0.18168,"step":0.025955,"zeroed":14,"of":128},"sweep":[{"bits":2,"group":16,"rms":0.089483,"rel":0.56991,"bytes_per_weight":0.375,"mb_28m":10.84},{"bits":2,"group":32,"rms":0.10238,"rel":0.65204,"bytes_per_weight":0.3125,"mb_28m":9.03},{"bits":2,"group":64,"rms":0.117623,"rel":0.74912,"bytes_per_weight":0.2812,"mb_28m":8.13},{"bits":2,"group":128,"rms":0.125664,"rel":0.80034,"bytes_per_weight":0.2656,"mb_28m":7.68},{"bits":2,"group":256,"rms":0.125664,"rel":0.80034,"bytes_per_weight":0.2578,"mb_28m":7.45},{"bits":3,"group":16,"rms":0.026973,"rel":0.17179,"bytes_per_weight":0.5,"mb_28m":14.45},{"bits":3,"group":32,"rms":0.032609,"rel":0.20768,"bytes_per_weight":0.4375,"mb_28m":12.64},{"bits":3,"group":64,"rms":0.036165,"rel":0.23033,"bytes_per_weight":0.4062,"mb_28m":11.74},{"bits":3,"group":128,"rms":0.038052,"rel":0.24235,"bytes_per_weight":0.3906,"mb_28m":11.29},{"bits":3,"group":256,"rms":0.038052,"rel":0.24235,"bytes_per_weight":0.3828,"mb_28m":11.06},{"bits":4,"group":16,"rms":0.012071,"rel":0.07688,"bytes_per_weight":0.625,"mb_28m":18.06},{"bits":4,"group":32,"rms":0.01353,"rel":0.08617,"bytes_per_weight":0.5625,"mb_28m":16.26},{"bits":4,"group":64,"rms":0.014804,"rel":0.09428,"bytes_per_weight":0.5312,"mb_28m":15.35},{"bits":4,"group":128,"rms":0.016414,"rel":0.10454,"bytes_per_weight":0.5156,"mb_28m":14.9},{"bits":4,"group":256,"rms":0.016414,"rel":0.10454,"bytes_per_weight":0.5078,"mb_28m":14.68},{"bits":8,"group":16,"rms":0.000658,"rel":0.00419,"bytes_per_weight":1.125,"mb_28m":32.51},{"bits":8,"group":32,"rms":0.000753,"rel":0.0048,"bytes_per_weight":1.0625,"mb_28m":30.71},{"bits":8,"group":64,"rms":0.000862,"rel":0.00549,"bytes_per_weight":1.0312,"mb_28m":29.8},{"bits":8,"group":128,"rms":0.000941,"rel":0.00599,"bytes_per_weight":1.0156,"mb_28m":29.35},{"bits":8,"group":256,"rms":0.000941,"rel":0.00599,"bytes_per_weight":1.0078,"mb_28m":29.13}],"checks":{"giai_nen_kieu_C_vs_python":0.0,"model_bin_tren_dia_vs_python":0.0},"checks_pass":true};

(function () {
  var d = Q, C = d.config;
  var f = function (v, n) { return Number(v).toFixed(n === undefined ? 4 : n); };

  var css = "<style>" +
    "#q{margin:1.4em 0}" +
    ".qb{border:1px solid var(--qb,#d0d7de);border-radius:8px;padding:12px 14px;margin:10px 0}" +
    ".qb h4{margin:0 0 6px;font-size:.95em}" +
    ".qt{width:100%;border-collapse:collapse;font-family:ui-monospace,Menlo,monospace;font-size:.8em}" +
    ".qt th{text-align:right;padding:3px 7px;color:#57606a;font-weight:600;border-bottom:1px solid var(--qb,#d0d7de)}" +
    ".qt td{text-align:right;padding:2px 7px}" +
    ".qt td:first-child,.qt th:first-child{text-align:left;color:#57606a}" +
    ".qkill{background:rgba(207,34,46,.14);border-radius:3px}" +
    ".qeq{font-family:ui-monospace,Menlo,monospace;font-size:.85em;background:var(--qbg,#f6f8fa);padding:7px 10px;border-radius:6px;margin:6px 0}" +
    ".qsw td,.qsw th{padding:3px 9px;text-align:right;font-family:ui-monospace,Menlo,monospace;font-size:.82em}" +
    ".qsw tr.on{background:rgba(3,102,214,.13);font-weight:600}" +
    ".qnote{font-size:.85em;color:#57606a;border-left:3px solid #1a7f37;padding:8px 12px;margin-top:12px}" +
    ".qchain{font-family:ui-monospace,Menlo,monospace;font-size:.85em;line-height:1.9}" +
    "html[data-theme=\"dark\"] #q{--qb:#30363d;--qbg:#161b22}" +
    "</style>";

  var R = d.row, n = R.fp32.length;
  var rows = "";
  for (var i = 0; i < n; i++) {
    var dead = R.dq[i] === 0 && R.fp32[i] !== 0;
    rows += "<tr" + (dead ? ' class="qkill"' : "") + "><td>" + i + "</td><td>" +
            f(R.fp32[i], 5) + "</td><td>" + R.codes[i] + "</td><td>" +
            f(R.dq[i], 5) + "</td><td>" + f(R.err[i], 5) + "</td></tr>";
  }

  var sw = "";
  d.sweep.forEach(function (s) {
    var on = (s.bits === 4 && s.group === C.group);
    sw += "<tr" + (on ? ' class="on"' : "") + "><td>" + s.bits + "</td><td>" + s.group +
          "</td><td>" + f(s.rms, 6) + "</td><td>" + f(s.bytes_per_weight, 4) +
          "</td><td>" + f(s.mb_28m, 1) + " MB</td></tr>";
  });

  var g = d.group0;
  document.getElementById("q").innerHTML = css +
    '<div class="qb"><h4>1. Một nhóm 128 weight bị nén thế nào</h4>' +
    '<div class="qeq">scale = max|w| / 7 = ' + g.absmax + " / 7 = " + f(g.scale, 6) +
    "<br>code &nbsp;= round(w / scale), kẹp trong [-7, +7]" +
    "<br>w&#770; &nbsp;&nbsp;&nbsp;= code &#215; scale</div>" +
    "<p>Cả nhóm dùng chung <b>một</b> scale, và scale đó do giá trị lớn nhất trong " +
    "nhóm quyết định. INT4 chỉ có 15 mức, nên bước lượng tử là " + f(g.scale, 6) +
    ": mọi weight nhỏ hơn nửa bước đó bị làm tròn về <b>đúng 0</b>. " +
    "Trong cả nhóm 128 weight có <b>" + g.zeroed + "</b> giá trị biến mất như vậy; " +
    "bảng dưới hiện 32 giá trị đầu, những dòng tô đỏ là các weight bị nghiền về 0.</p></div>" +

    '<div class="qb"><h4>2. 32 giá trị đầu của ' + C.row_label + "</h4>" +
    '<table class="qt"><tr><th>i</th><th>FP32 gốc</th><th>code int4</th>' +
    "<th>sau giải nén</th><th>sai số</th></tr>" + rows + "</table></div>" +

    '<div class="qb"><h4>3. Đổi số bit và kích thước nhóm thì được gì, mất gì</h4>' +
    '<table class="qt qsw"><tr><th>bit</th><th>group</th><th>RMS lỗi</th>' +
    "<th>byte/weight</th><th>model 28.9M</th></tr>" + sw + "</table>" +
    "<p>Dòng tô xanh là cấu hình repo đang dùng. Giảm từ 4 bit xuống 2 bit tiết " +
    "kiệm được một nửa dung lượng nhưng lỗi tăng khoảng 8 lần, nên 4 bit là chỗ " +
    "dừng chứ không phải giới hạn kỹ thuật.</p></div>" +

    '<div class="qb"><h4>4. Và rồi nó chạy trên silicon</h4>' +
    '<div class="qchain">nn.Linear(x)<br>&nbsp;&nbsp;= W &#183; x<br>' +
    "&nbsp;&nbsp;= matvec_q() trong llm.h<br>" +
    "&nbsp;&nbsp;= dot product lặp lại nhiều lần<br>" +
    "&nbsp;&nbsp;= nhân-cộng (MAC) rất nhiều lần</div>" +
    "<p>Chuỗi này kết thúc ở phần cứng, và mỗi loại silicon gọi bước cuối bằng một " +
    "tên khác: <b>Tensor Core</b> của NVIDIA, <b>C7x + MMA</b> của TI, " +
    "<b>Hexagon</b> của Qualcomm, hay chỉ là vòng <code>for</code> vô hướng trên " +
    "Xtensa của ESP32-S3. Cùng một phép toán, khác cách xếp mạch.</p>" +
    "<p>Đó cũng là lý do INT4 quan trọng với thiết bị nhúng hơn hẳn với GPU: bước " +
    "chậm nhất không phải phép nhân, mà là <b>đọc weight từ bộ nhớ</b>. Giảm 4 lần " +
    "số byte phải đọc thì giảm gần 4 lần thời gian.</p></div>" +

    '<div class="qnote"><b>Kiểm chứng:</b> hàng weight ở bảng 2 được giải nén từ ' +
    "chính <code>firmware/model/model.bin</code> đã commit, theo đúng cách " +
    "<code>deq_row()</code> trong <code>llm.h</code> làm, rồi so với bản dequantize " +
    "bên PyTorch. Chênh lệch <b>" +
    (d.checks.model_bin_tren_dia_vs_python === 0 ? "0, khớp từng byte" : d.checks.model_bin_tren_dia_vs_python) +
    "</b>. Nên những con số bạn thấy đúng là những con số con chip đọc, " +
    "không phải một bản mô phỏng gần đúng.</div>";
})();
</script>

## Chỗ đáng dừng lại

Nhìn cột **sai số** ở bảng 2, và để ý những dòng tô đỏ.

Weight `-0.00033` bị nén thành `0`. Không phải vì nó quá nhỏ so với chính nó, mà vì
nó nằm chung nhóm với một weight lớn hơn 500 lần. Scale của cả nhóm do giá trị lớn
nhất quyết định, và INT4 chỉ có 15 mức để chia. Mọi thứ dưới nửa bước lượng tử biến
mất.

Đó là toàn bộ lý do **kích thước nhóm** tồn tại như một tham số. Nhóm nhỏ thì mỗi
scale phục vụ ít weight hơn nên bám sát hơn, nhưng phải lưu nhiều scale hơn. Bảng 3
cho bạn đo cái đánh đổi đó bằng số thay vì đoán.

## Sinh lại

```bash
cd src && uv run python trace_quant.py \
    --run ../runs/ple-jetson-s0.pt --bin ../firmware/model/model.bin \
    --out ../trace_quant.json
```

Script thoát mã 1 nếu bản giải nén không khớp `model.bin`, nên trang này không thể
hiển thị một model khác với model đang chạy.

---

*Bài viết thuộc loạt [AI cho kỹ sư nhúng](/study_ai/). Góp ý: mở issue tại
[github.com/ninhnn2/machineai](https://github.com/ninhnn2/machineai/issues).*
