$(function () {
  var root = document.documentElement;
  var toggle = $("#theme-toggle");

  function refreshIcon() {
    var dark = root.getAttribute("data-theme") === "dark";
    toggle.find("i").attr("class", dark ? "fa fa-sun-o" : "fa fa-moon-o");
  }

  refreshIcon();

  toggle.on("click", function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch (e) {}
    refreshIcon();
  });

  $(".markdown-body pre").each(function () {
    var pre = this;
    var btn = $(
      '<button type="button" class="copy-code" aria-label="Copy"><i class="fa fa-clipboard" aria-hidden="true"></i></button>'
    );

    function flash(ok) {
      btn.find("i").attr("class", ok ? "fa fa-check" : "fa fa-times");
      setTimeout(function () {
        btn.find("i").attr("class", "fa fa-clipboard");
      }, 1500);
    }

    btn.on("click", function () {
      var code = pre.querySelector("code");
      var text = (code || pre).innerText;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
          function () {
            flash(true);
          },
          function () {
            flash(false);
          }
        );
      } else {
        var area = document.createElement("textarea");
        area.value = text;
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        try {
          document.execCommand("copy");
          flash(true);
        } catch (e) {
          flash(false);
        }
        document.body.removeChild(area);
      }
    });

    $(pre).append(btn);
  });
});

// ---------- nút đổi ngôn ngữ ----------
// Chỉ hiện trên trang thật sự có bản dịch. Bấm vào là ghi lựa chọn xuống
// localStorage, và từ đó máy không đoán nữa: lựa chọn của người đọc luôn thắng.
$(function () {
  var I = window.__I18N;
  if (!I || !I.hasTranslation) return;

  var btn = $("#lang-toggle");
  var other = I.current === "vi" ? "en" : "vi";
  btn.text(other.toUpperCase())
     .attr("title", other === "en" ? "Read in English" : "Đọc bản tiếng Việt")
     .removeAttr("hidden");

  btn.on("click", function () {
    try { localStorage.setItem("lang", other); } catch (e) {}
    location.href = other === "en" ? I.enPath : I.viPath;
  });
});
