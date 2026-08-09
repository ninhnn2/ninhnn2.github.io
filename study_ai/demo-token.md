---
sort: 20
image: /assets/images/og-study-ai-v2.jpg
---

# Demo: mổ bụng một token

> Thuộc loạt [AI cho kỹ sư nhúng](/study_ai/). Mọi con số trên trang này lấy từ
> checkpoint thật `ple-jetson-s0.pt`, sinh bằng
> [`src/trace_token.py`](https://github.com/ninhnn2/machineai/blob/main/src/trace_token.py),
> không có số nào dựng sẵn. Bấm vào từng khối để xem số và công thức của nó.

Model nhận câu `The cat sat on the` và phải đoán token kế tiếp. Dưới đây là đúng
những gì xảy ra bên trong, từng bước một.

<div id="demo"></div>

<script>
/*
  Dữ liệu là JSON do trace_token.py xuất ra. Script đó tự kiểm 4 điều trước khi
  ghi file, trong đó quan trọng nhất là bảng attention tự tính phải khớp
  F.scaled_dot_product_attention của PyTorch. Kết quả kiểm hiện ở cuối trang.

  LƯU Ý: chỉ dùng comment khối. Trình nén của theme gộp script vào một dòng,
  comment một dòng sẽ nuốt hết code phía sau.
*/
var TRACE = {"prompt":"The cat sat on the","checkpoint":"ple-jetson-s0.pt","config":{"d_model":128,"n_layers":6,"n_heads":4,"head_dim":32,"vocab":4096,"ple_dim":64},"tokens":[{"id":382,"text":"The"},{"id":708,"text":" cat"},{"id":1387,"text":" sat"},{"id":346,"text":" on"},{"id":263,"text":" the"}],"layer":0,"head":0,"embedding":{"vector":[-0.12251,-0.13912,-0.03628,0.11081,-0.09539,0.04148,-0.09169,0.07355,0.01269,-0.11539,0.13749,0.1141,-0.15409,-0.11035,-0.1186,0.12097,0.14785,-0.07205,-0.11662,-0.06358,0.07998,0.09479,-0.12585,-0.13587,-0.0914,0.09584,-0.09489,-0.1181,0.08712,-0.13413,-0.03979,-0.10137,0.0464,-0.06988,0.09727,-0.05981,0.09258,-0.11893,-0.13861,0.1355,0.12126,0.10871,0.12315,-0.02562,-0.14831,0.10779,0.11134,0.14817,0.15094,-0.16993,0.00513,0.17352,0.10329,0.15915,-0.17274,0.1081,0.064,-0.10824,-0.07962,-0.09376,0.04492,0.067,0.07657,0.0747,-0.06085,-0.10899,-0.1152,0.13206,-0.03641,-0.10284,0.11805,-0.05792,0.07271,-0.11093,0.04112,0.1213,0.08314,-0.13561,-0.14098,-0.02933,-0.15495,0.17842,0.12635,-0.04984,0.11905,0.04383,0.10488,-0.16838,-0.14106,-0.07148,0.14239,0.00192,-0.05692,0.01594,-0.02013,-0.15185,-0.06859,-0.10709,0.15409,-0.15737,-0.0634,-0.00453,0.09466,-0.15467,-0.11582,-0.09148,0.12739,0.10456,-0.11163,0.10355,0.0891,0.12805,-0.0922,0.16311,0.14096,0.16572,-0.03413,0.03884,-0.0753,0.09844,-0.12618,0.14054,-0.07072,-0.1188,0.16771,0.03671,-0.07053,0.08439],"norm":1.2273,"macs":0,"note":"tra bảng, không nhân gì cả"},"qkv":{"q":[-5.27363,-2.32938,-2.39999,0.74523,2.18764,-0.08864,2.8125,-0.3673,-3.42896,-0.50892,0.54897,-0.02813,0.11011,0.09983,-0.97319,0.75057,1.03371,2.54934,-0.63412,2.85092,-0.51828,-3.15063,-1.61757,-2.66464,-0.50868,-1.0585,-1.42095,-0.13966,-1.30937,1.09049,1.46501,1.29346],"k":[-0.82131,-1.00197,-1.8823,1.34313,1.48624,-0.16852,1.02685,-1.95595,-1.53401,-1.67862,0.52589,-0.36832,0.12925,-0.35336,-0.15235,0.67124,-1.93417,1.1189,-0.29828,1.01681,-0.97788,-1.80808,-1.24029,-0.96377,1.30422,-2.03547,-0.08458,0.75257,0.40031,1.04984,0.92371,1.33617],"v":[-0.21705,-0.01989,0.28499,0.0578,0.19233,-0.31484,-0.00207,-0.09937,0.00079,-0.19332,0.10134,-0.05453,0.2436,0.20347,0.38466,-0.36584,-0.15602,-0.20597,0.09955,-0.03648,0.17816,-0.03976,-0.0849,-0.47066,0.1041,-0.01897,0.00413,0.48351,-0.00749,-0.06819,0.13251,-0.13206],"macs":49152,"shape_W":[384,128]},"attention":{"scores":[1.18616,-2.07381,-7.51376,11.54532,8.13671],"weights":[3e-05,0.0,0.0,0.96794,0.03203],"out":[0.22079,-0.26081,0.37156,-0.17101,-0.14965,0.12922,-0.23928,0.24122,-0.36847,0.09028,0.19971,0.39811,-0.07632,-0.27461,0.33969,-0.11377,0.24756,0.22477,0.19298,0.33806,-0.06767,0.30799,0.63432,0.00139,0.28855,0.17921,-0.29508,-0.29495,0.24226,-0.02395,-0.23371,0.23545],"scale":0.17678,"macs":320},"hidden":{"vector":[-0.10632,-0.13996,-0.09205,0.12962,-0.12664,0.01481,-0.18084,0.08761,-0.01389,-0.05476,0.10282,-0.04432,-0.10549,-0.07186,-0.10723,0.19578,0.01449,-0.00863,-0.1719,0.03054,0.1472,0.06574,-0.07211,-0.16416,-0.10215,0.08125,-0.12346,-0.09298,0.04126,-0.03324,0.0602,-0.0432,-0.08872,-0.06323,0.10372,-0.0259,0.17826,-0.12879,-0.069,0.10146,0.10017,-0.01665,0.08886,0.06532,-0.20325,-0.00657,-0.06191,-0.05197,0.05237,-0.06629,-0.03568,0.13413,0.07316,0.17573,-0.22776,0.05679,-0.04539,-0.03363,0.07094,0.0741,-0.03236,0.03695,0.10653,0.0226,-0.05451,-0.08181,-0.04499,0.06691,-0.08041,-0.18286,0.10201,0.03043,0.10226,-0.10732,0.03929,0.05028,0.08788,-0.05039,-0.08631,-0.02867,-0.07289,0.21605,0.08128,0.05649,0.19002,0.09271,0.02698,-0.12909,-0.09405,-0.00879,0.04581,-0.18752,0.10565,0.00553,-0.11106,-0.11638,0.00224,-0.11253,0.14047,0.03684,-0.03105,0.02184,-0.00846,0.02794,-0.14404,-0.06369,0.0037,-0.02868,-0.05224,-0.02116,0.09914,0.07017,-0.13179,0.18516,0.11099,0.07965,-0.08089,0.01822,-0.03264,0.12916,-0.07989,0.08704,-0.004,-0.1884,0.04732,0.07575,-0.02938,0.10218],"norm":1.0945},"logits":{"topk":[{"id":1458,"text":" table","logit":8.7003,"prob":0.128677},{"id":1233,"text":" grass","logit":8.5205,"prob":0.107501},{"id":2238,"text":" couch","logit":8.4595,"prob":0.101134},{"id":1361,"text":" floor","logit":8.0637,"prob":0.068081},{"id":962,"text":" ground","logit":7.8643,"prob":0.055773},{"id":1007,"text":" bed","logit":7.6835,"prob":0.04655},{"id":4092,"text":" porch","logit":7.6687,"prob":0.045864},{"id":1983,"text":" bench","logit":7.3513,"prob":0.033392},{"id":1851,"text":" chair","logit":6.6672,"prob":0.016847},{"id":3729,"text":" sofa","logit":6.6483,"prob":0.016532},{"id":1409,"text":" window","logit":6.4295,"prob":0.013283},{"id":1081,"text":" slide","logit":6.3616,"prob":0.012411}],"vocab":4096,"macs":524288,"min":-8.27,"max":8.7},"temperature":{"0.1":[0.795171,0.131699,0.071519,0.001367,0.000186,3.1e-05,2.6e-05,1e-06,0.0,0.0,0.0,0.0],"0.8":[0.188238,0.150348,0.1393,0.08494,0.0662,0.052811,0.051841,0.034865,0.014825,0.014479,0.011014,0.010118],"1.5":[0.044479,0.039454,0.037881,0.029096,0.025474,0.022582,0.02236,0.018096,0.011468,0.011325,0.009788,0.009355]},"checks":{"qkv_thu_cong_vs_pytorch":0.0,"attention_thu_cong_vs_sdpa":1.19e-07,"tong_hang_softmax_lech_1":5.96e-08,"logits_lap_lai":0.0},"checks_pass":true};

(function () {
  var d = TRACE, C = d.config;
  var fmt = function (v, n) { return Number(v).toFixed(n === undefined ? 4 : n); };
  var esc = function (s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/ /g, "\u00b7"); };

  function vecRow(arr, n) {
    var out = [], k = Math.min(n, arr.length);
    for (var i = 0; i < k; i++) out.push(fmt(arr[i]));
    return "[" + out.join(", ") + (arr.length > k ? ", ... " + arr.length + " giá trị]" : "]");
  }

  function bars(items, max, cls) {
    var h = '<table class="dm-bars">';
    for (var i = 0; i < items.length; i++) {
      var w = max > 0 ? (items[i].v / max * 100) : 0;
      h += '<tr><td class="dm-lbl">' + esc(items[i].k) + '</td>' +
           '<td class="dm-bar"><span class="' + (cls || "") + '" style="width:' + w.toFixed(1) + '%"></span></td>' +
           '<td class="dm-num">' + items[i].t + '</td></tr>';
    }
    return h + "</table>";
  }

  var toks = d.tokens.map(function (t) { return t.text; });
  var attnItems = d.attention.weights.map(function (w, i) {
    return { k: toks[i], v: w, t: fmt(w) };
  });
  var topItems = d.logits.topk.map(function (t) {
    return { k: t.text, v: t.prob, t: fmt(t.prob) + "  (logit " + fmt(t.logit, 2) + ")" };
  });

  var stages = [
    { id: "tok", name: "1. Tokenize", sub: "chữ thành số",
      eq: 'BPE: "The cat sat on the" -> ' + d.tokens.length + " token",
      code: "data/bpe4096.json",
      body: '<table class="dm-tbl"><tr><th>vị trí</th><th>token</th><th>id</th></tr>' +
            d.tokens.map(function (t, i) {
              return "<tr><td>" + i + "</td><td><code>" + esc(t.text) + "</code></td><td>" + t.id + "</td></tr>";
            }).join("") + "</table>" +
            "<p>Từ đây trở đi model không còn thấy chữ nào nữa, chỉ còn " +
            d.tokens.length + " con số.</p>" },

    { id: "emb", name: "2. Embedding", sub: "số thành vector",
      eq: "x = tok_emb[id]      (tra bảng, KHÔNG nhân gì cả)",
      code: "model.py:200  self.tok_emb(idx)",
      body: "<p>Token cuối <code>" + esc(toks[toks.length - 1]) + "</code> (id " +
            d.tokens[d.tokens.length - 1].id + ") trở thành một vector " + C.d_model + " chiều:</p>" +
            "<pre>" + vecRow(d.embedding.vector, 8) + "\n\nnorm = " + d.embedding.norm + "</pre>" +
            "<p><b>0 phép nhân.</b> Đây là tra bảng, không phải phép tính. Chính vì vậy " +
            "bảng PLE 25 triệu tham số nằm được trong flash chậm mà gần như không tốn thời gian.</p>" },

    { id: "qkv", name: "3. Q, K, V", sub: "ba câu hỏi từ cùng một vector",
      eq: "Q,K,V = W · x        W: [" + d.qkv.shape_W[0] + " x " + d.qkv.shape_W[1] + "]",
      code: "model.py:98  self.qkv(x).split(C, dim=2)",
      body: "<pre>Q = " + vecRow(d.qkv.q, 6) + "\nK = " + vecRow(d.qkv.k, 6) +
            "\nV = " + vecRow(d.qkv.v, 6) + "</pre>" +
            "<p>Một phép nhân ma trận-vector: <b>" + d.qkv.macs.toLocaleString() +
            " phép nhân-cộng</b> cho riêng bước này. Đây chính là <code>matvec_q()</code> " +
            "trong <code>llm.h</code>, và là dot product của bài 1 lặp lại " +
            d.qkv.shape_W[0] + " lần.</p>" },

    { id: "attn", name: "4. Attention", sub: "token này nhìn vào đâu",
      eq: "w = softmax(Q·K\u1d40 / \u221a" + C.head_dim + ")      scale = " + d.attention.scale,
      code: "model.py:104  F.scaled_dot_product_attention",
      body: "<p>Điểm thô trước softmax, của token cuối so với từng token trước đó:</p>" +
            "<pre>" + d.attention.scores.map(function (s, i) {
              return esc(toks[i]).padEnd(8) + fmt(s, 3);
            }).join("\n") + "</pre>" +
            "<p>Sau softmax thành trọng số, cộng lại đúng bằng 1:</p>" +
            bars(attnItems, Math.max.apply(null, d.attention.weights), "dm-blue") +
            "<p><b>Đây là con số đáng nhìn nhất trang này.</b> Token <code>" +
            esc(toks[toks.length - 1]) + "</code> dồn " +
            (Math.max.apply(null, d.attention.weights) * 100).toFixed(1) +
            "% sự chú ý vào <code>" + esc(toks[d.attention.weights.indexOf(Math.max.apply(null, d.attention.weights))]) +
            "</code>. Không ai lập trình điều đó, nó tự nổi lên khi train.</p>" },

    { id: "hid", name: "5. Hidden state", sub: "suy nghĩ của model về câu này",
      eq: "x = x + attn(x);  x = x + ffn(x)      (residual)",
      code: "model.py:137  Block.forward",
      body: "<pre>" + vecRow(d.hidden.vector, 8) + "\n\nnorm = " + d.hidden.norm + "</pre>" +
            "<p>Vẫn là " + C.d_model + " chiều như embedding, nhưng đã đi qua " +
            "1 trong " + C.n_layers + " lớp. Đây là vector <b>thay đổi mỗi lần chạy</b> " +
            "(activation), khác hẳn weight vốn đứng yên, xem bài 2.</p>" },

    { id: "log", name: "6. Logits", sub: "chấm điểm toàn bộ từ vựng",
      eq: "logits = head · x      [" + C.vocab + "] điểm số",
      code: "model.py:206  self.head(x)",
      body: "<p>Bước tốn nhất: <b>" + d.logits.macs.toLocaleString() +
            " phép nhân-cộng</b>, gấp " + Math.round(d.logits.macs / d.qkv.macs) +
            " lần bước Q/K/V. Trên ESP32 đây là chỗ nghẽn băng thông.</p>" +
            "<p>Dải điểm: " + d.logits.min + " tới " + d.logits.max +
            ". Cao nhất trong " + C.vocab.toLocaleString() + " lựa chọn:</p>" +
            bars(topItems, d.logits.topk[0].prob, "dm-green") },

    { id: "smp", name: "7. Sampling", sub: "model KHÔNG chọn từ",
      eq: "p = softmax(logits / T)",
      code: "model.py generate()",
      body: '<p>Model chỉ xuất ra ' + C.vocab.toLocaleString() + ' con số. Việc chọn ' +
            'token nào là một bước RIÊNG, nằm ngoài mạng nơ-ron. Nhiệt độ T quyết định ' +
            'phân bố phẳng hay nhọn:</p>' +
            '<p><label>T = <span id="dm-t">0.8</span> </label>' +
            '<input id="dm-slider" type="range" min="0" max="2" step="1" value="1"></p>' +
            '<div id="dm-temp"></div>' },
  ];

  var css = "<style>" +
    "#demo{margin:1.5em 0}" +
    ".dm-stage{border:1px solid var(--dm-b,#d0d7de);border-radius:8px;margin:8px 0;overflow:hidden}" +
    ".dm-head{display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;background:var(--dm-bg,#f6f8fa)}" +
    ".dm-head:hover{background:var(--dm-bh,#eef1f4)}" +
    ".dm-name{font-weight:650}.dm-sub{color:#6a737d;font-size:.9em}" +
    ".dm-caret{margin-left:auto;color:#6a737d}" +
    ".dm-body{padding:12px 14px;display:none;border-top:1px solid var(--dm-b,#d0d7de)}" +
    ".dm-stage.open .dm-body{display:block}" +
    ".dm-eq{font-family:ui-monospace,Menlo,monospace;font-size:.9em;background:var(--dm-bg,#f6f8fa);padding:8px 10px;border-radius:6px;margin-bottom:8px}" +
    ".dm-code{font-size:.82em;color:#6a737d;margin-bottom:10px}" +
    ".dm-bars{width:100%;border-collapse:collapse;margin:6px 0}" +
    ".dm-bars td{padding:2px 6px;border:0;vertical-align:middle}" +
    ".dm-lbl{font-family:ui-monospace,Menlo,monospace;font-size:.85em;white-space:nowrap;width:1%}" +
    ".dm-bar{width:99%}.dm-bar span{display:block;height:14px;border-radius:3px;background:#0366d6}" +
    ".dm-bar span.dm-green{background:#1a7f37}" +
    ".dm-num{font-family:ui-monospace,Menlo,monospace;font-size:.82em;white-space:nowrap;width:1%;color:#57606a}" +
    ".dm-tbl{font-size:.9em}.dm-tbl th,.dm-tbl td{padding:3px 10px}" +
    ".dm-arrow{text-align:center;color:#8b949e;font-size:1.1em;line-height:1}" +
    ".dm-check{font-size:.85em;color:#57606a;border-left:3px solid #1a7f37;padding:8px 12px;margin-top:14px}" +
    "html[data-theme=\"dark\"] #demo{--dm-b:#30363d;--dm-bg:#161b22;--dm-bh:#1c2430}" +
    "</style>";

  var h = css;
  for (var i = 0; i < stages.length; i++) {
    var s = stages[i];
    h += '<div class="dm-stage" id="st-' + s.id + '">' +
         '<div class="dm-head"><span class="dm-name">' + s.name + '</span>' +
         '<span class="dm-sub">' + s.sub + '</span><span class="dm-caret">+</span></div>' +
         '<div class="dm-body"><div class="dm-eq">' + s.eq + '</div>' +
         '<div class="dm-code">code: ' + s.code + '</div>' + s.body + '</div></div>';
    if (i < stages.length - 1) h += '<div class="dm-arrow">&#8595;</div>';
  }

  var ck = d.checks;
  h += '<div class="dm-check"><b>Kiểm chứng tự động</b> (trace_token.py chạy trước khi ghi file):' +
       '<br>Q,K,V tự nhân tay so với PyTorch: sai lệch ' + ck.qkv_thu_cong_vs_pytorch +
       '<br>Attention tự tính so với scaled_dot_product_attention: ' + ck.attention_thu_cong_vs_sdpa +
       '<br>Tổng mỗi hàng softmax lệch 1: ' + ck.tong_hang_softmax_lech_1 +
       '<br>Chạy lại forward cho cùng logits: ' + ck.logits_lap_lai +
       '<br>Lệch dưới 2e-05 thì script mới chịu ghi file. Bảng attention bạn thấy ở trên ' +
       'vì vậy là bảng thật của model, không phải bản dựng lại gần đúng.</div>';

  document.getElementById("demo").innerHTML = h;

  var heads = document.querySelectorAll("#demo .dm-head");
  for (var j = 0; j < heads.length; j++) {
    heads[j].addEventListener("click", function () {
      var st = this.parentNode;
      st.classList.toggle("open");
      st.querySelector(".dm-caret").textContent = st.classList.contains("open") ? "\u2212" : "+";
    });
  }

  var TS = ["0.1", "0.8", "1.5"];
  function drawTemp(i) {
    var t = TS[i], ps = d.temperature[t];
    document.getElementById("dm-t").textContent = t;
    var items = d.logits.topk.map(function (tk, n) {
      return { k: tk.text, v: ps[n], t: fmt(ps[n]) };
    });
    document.getElementById("dm-temp").innerHTML = bars(items, Math.max.apply(null, ps));
  }
  var sl = document.getElementById("dm-slider");
  sl.addEventListener("input", function () { drawTemp(parseInt(this.value, 10)); });
  drawTemp(1);
  document.getElementById("st-attn").classList.add("open");
  document.querySelector("#st-attn .dm-caret").textContent = "\u2212";
})();
</script>

## Sinh lại trang này

```bash
cd src && uv run python trace_token.py \
    --run ../runs/ple-jetson-s0.pt --tokenizer ../data/bpe4096.json \
    --prompt "The cat sat on the" --out ../trace.json
```

Script thoát mã 1 nếu bất kỳ phép kiểm nào lệch quá `2e-05`, nên không thể vô tình
đăng một trang có số sai.

---

*Bài viết thuộc loạt [AI cho kỹ sư nhúng](/study_ai/). Góp ý: mở issue tại
[github.com/ninhnn2/machineai](https://github.com/ninhnn2/machineai/issues).*
