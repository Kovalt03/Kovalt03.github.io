/* 모든 버전이 함께 쓰는 렌더링 코드입니다.
   내용은 각 폴더의 index.html 안 profile 객체에만 들어 있습니다. */

(function () {
  var p = window.profile;
  if (!p) return;

  var esc = function (s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  };
  var has = function (v) {
    return Array.isArray(v) ? v.length > 0 : !!(v && String(v).trim());
  };
  var nl = function (s) { return esc(s).replace(/\n/g, "<br>"); };

  // 모든 줄이 "· "로 시작하면 항목 목록으로. "이름: 내용"이면 이름을 굵게
  function richText(s) {
    var lines = String(s).split("\n");
    var bullet = function (l) { return l.indexOf("· ") === 0; };
    if (lines.length < 2 || !lines.every(bullet)) return nl(s);
    return '<ul class="bullets">' + lines.map(function (l) {
      var body = l.slice(2), k = body.indexOf(": ");
      return "<li>" + (k > 0 ? "<b>" + esc(body.slice(0, k)) + "</b> " + esc(body.slice(k + 2)) : esc(body)) + "</li>";
    }).join("") + "</ul>";
  }

  function detailList(items, extraRows) {
    var rows = (items || []).filter(function (d) { return has(d.text); })
      .map(function (d) {
        return "<div><dt>" + esc(d.label) + "</dt><dd>" + richText(d.text) + "</dd></div>";
      }).join("") + (extraRows || "");
    return rows ? '<dl class="detail">' + rows + "</dl>" : "";
  }

  // links 항목에 icon: "github" | "velog" 를 주면 글자 대신 아이콘으로 표시
  var ICONS = {
    github: '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>',
    velog: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M5 1.5h14A3.5 3.5 0 0 1 22.5 5v14a3.5 3.5 0 0 1-3.5 3.5H5A3.5 3.5 0 0 1 1.5 19V5A3.5 3.5 0 0 1 5 1.5zM6.4 6.5h2.9l2.5 7.6 3.6-7.6h2.3l-4.9 11h-2.6z"/></svg>'
  };

  function linkRow(links, cls) {
    var a = (links || []).filter(function (l) { return has(l.label); })
      .map(function (l) {
        var icon = ICONS[l.icon];
        return '<a href="' + esc(l.href || "#") + '"' +
          (icon ? ' class="icon-link" aria-label="' + esc(l.label) + '" title="' + esc(l.label) + '">' + icon
                : ">" + esc(l.label)) + "</a>";
      }).join("");
    return a ? '<div class="' + cls + '">' + a + "</div>" : "";
  }

  function heroBlock() {
    var edu = p.education || {};
    // 학점은 "4.06 / 4.5"가 쪼개지지 않게 한 덩어리로
    var eduMain = esc(edu.university) + (has(edu.gpa)
      ? (has(edu.university) ? ' <span class="nowrap">· ' : '<span class="nowrap">') + esc(edu.gpa) + "</span>"
      : "");
    var rows = [];
    if (has(eduMain) || has(edu.highschool)) {
      rows.push("<div><dt>학력</dt><dd>" + eduMain +
        (has(edu.highschool) ? '<span class="sub">' + esc(edu.highschool) + "</span>" : "") +
        "</dd></div>");
    }
    if (has(p.certificates)) {
      rows.push("<div><dt>자격</dt><dd>" + p.certificates.map(esc).join("<br>") + "</dd></div>");
    }
    if (has(p.languages)) {
      rows.push("<div><dt>어학</dt><dd>" + p.languages.map(esc).join("<br>") + "</dd></div>");
    }
    if (has(p.email)) {
      rows.push('<div><dt>메일</dt><dd><a href="mailto:' + esc(p.email) + '">' + esc(p.email) + "</a></dd></div>");
    }
    if (has(p.phone)) {
      rows.push('<div><dt>전화</dt><dd><a href="tel:' + esc(String(p.phone).replace(/[^\d+]/g, "")) + '">' +
        esc(p.phone) + "</a></dd></div>");
    }
    // 사진은 photo가 있을 때만 표시
    var avatar = has(p.photo)
      ? '<img class="avatar" src="' + esc(p.photo) + '" alt="' + esc(p.name) + '">'
      : "";

    return '<div class="hero">' + avatar + "<div>" +
      "<h1>" + nl(p.headline) + "</h1>" +
      (has(p.tagline) ? '<p class="tagline">' + esc(p.tagline) + "</p>" : "") +
      (rows.length ? '<dl class="facts">' + rows.join("") + "</dl>" : "") +
      linkRow(p.links, "links") + "</div></div>";
  }

  function skillsBlock() {
    if (!has(p.skills)) return "";
    var cols = p.skills.map(function (g) {
      return "<div><h3>" + esc(g.group) + '</h3><div class="tags">' +
        (g.items || []).map(function (i) {
          return '<span class="tag' + (i.primary ? "" : " light") + '">' + esc(i.name) + "</span>";
        }).join("") + "</div></div>";
    }).join("");
    return '<section id="skills"><h2>' + esc(p.labels.skills) + "</h2>" +
      '<div class="skillgrid">' + cols + "</div>" +
      (has(p.labels.skillNote) ? '<p class="note">' + esc(p.labels.skillNote) + "</p>" : "") +
      "</section>";
  }

  function experienceBlock() {
    if (!has(p.experience)) return "";
    var items = p.experience.map(function (e) {
      var head = [e.company, e.role].filter(has).join(" · ");
      var sub = [e.period, e.team].filter(has).join(" · ");
      var m = e.metric;
      var metric = (m && has(m.after)) ? '<div class="metric">' +
        (has(m.before) ? '<span class="from">' + esc(m.before) + "</span>" : "") +
        "<b>" + esc(m.after) + "</b>" +
        (has(m.caption) ? "<small>" + esc(m.caption) + "</small>" : "") + "</div>" : "";
      return '<div class="entry">' +
        (has(head) ? '<p class="role">' + esc(head) + "</p>" : "") +
        (has(sub) ? '<p class="period">' + esc(sub) + "</p>" : "") +
        metric + detailList(e.details) + "</div>";
    }).join("");
    return '<section id="experience"><h2>' + esc(p.labels.experience) + "</h2>" + items + "</section>";
  }

  // 카드 썸네일용. image 하나 또는 images 배열(최대 4장)
  function imageList(x) {
    return (has(x.images) ? x.images : [x.image]).filter(has);
  }

  /* 프로젝트: 접혀 있으면 카드 격자, 하나를 펼치면 카드는 목록으로 줄고
     그 아래에 상세가 크게 나옵니다. 다시 누르거나 접기를 누르면 카드로 돌아갑니다. */
  function projectsBlock() {
    if (!has(p.projects)) return "";
    var cards = p.projects.map(function (x, i) {
      var num = (i + 1 < 10 ? "0" : "") + (i + 1);
      var imgs = imageList(x);
      // 여러 장이면 카드에 2x2로 모아 보여줌 (정사각형 이미지 기준이라 잘리지 않음)
      var thumb = imgs.length > 1
        ? '<span class="pthumb multi"><span class="pgrid">' + imgs.slice(0, 4).map(function (im) {
            return '<img src="' + esc(im) + '" alt="">';
          }).join("") + "</span></span>"
        : '<span class="pthumb">' + (imgs.length ? '<img src="' + esc(imgs[0]) + '" alt="">' : num) + "</span>";
      return '<li><button type="button" class="pcard" data-i="' + i + '"' +
        ' style="view-transition-name:pcard-' + i + '"' +
        ' aria-expanded="false" aria-controls="project-panel">' +
        thumb +
        '<span class="ptext"><span class="ptitle">' + esc(x.title) + "</span>" +
        (has(x.summary) ? '<span class="psum">' + esc(x.summary) + "</span>" : "") + "</span>" +
        '<span class="chev" aria-hidden="true">&rsaquo;</span></button></li>';
    }).join("");
    return '<section id="projects"><h2>' + esc(p.labels.projects) + "</h2>" +
      '<ul class="pcards">' + cards + "</ul>" +
      '<div class="ppanel" id="project-panel" hidden></div></section>';
  }

  // 상세 목록 마지막 줄: 왼쪽 "링크", 오른쪽에 링크들
  function linkItem(links) {
    var a = linkRow(links, "repo");
    return a ? '<div class="linkrow"><dt>링크</dt><dd>' + a + "</dd></div>" : "";
  }

  function projectDetail(x) {
    return '<div class="ppanel-head"><div><h3>' + esc(x.title) + "</h3>" +
      (has(x.summary) ? "<p>" + esc(x.summary) + "</p>" : "") + "</div>" +
      '<button type="button" class="pclose">접기</button></div>' +
      detailList(x.details, linkItem(x.links));
  }

  function bindProjects() {
    var sec = document.getElementById("projects");
    if (!sec) return;
    var panel = sec.querySelector(".ppanel");
    var cards = sec.querySelectorAll(".pcard");
    var current = -1;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function apply(i) {
      current = i;
      sec.classList.toggle("is-open", i >= 0);
      for (var k = 0; k < cards.length; k++) {
        cards[k].setAttribute("aria-expanded", String(k === i));
        cards[k].classList.toggle("active", k === i);
      }
      panel.innerHTML = i >= 0 ? projectDetail(p.projects[i]) : "";
      panel.hidden = i < 0;
      // 카드가 목록으로 줄면서 섹션 머리가 화면 위로 밀려났으면 다시 보이게
      if (sec.getBoundingClientRect().top < 0) sec.scrollIntoView();
    }

    function go(i) {
      if (document.startViewTransition && !reduce) {
        document.startViewTransition(function () { apply(i); });
      } else {
        apply(i);
      }
    }

    function close() {
      var last = cards[current];
      go(-1);
      if (last) last.focus({ preventScroll: true });
    }

    sec.addEventListener("click", function (e) {
      var card = e.target.closest(".pcard");
      if (card) {
        var i = Number(card.getAttribute("data-i"));
        if (i === current) close(); else go(i);
      } else if (e.target.closest(".pclose")) {
        close();
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && current >= 0) close();
    });
  }

  function aboutBlock() {
    if (!has(p.about)) return "";
    var items = p.about.map(function (a) {
      return "<div><h3>" + esc(a.heading) + "</h3><p>" + nl(a.text) + "</p></div>";
    }).join("");
    return '<section id="about"><h2>' + esc(p.labels.about) + "</h2>" +
      '<div class="about">' + items + "</div></section>";
  }

  // 섹션 순서. profile.order 로 바꿀 수 있습니다. 예: ["skills", "experience", "projects", "about"]
  var order = has(p.order) ? p.order : ["skills", "projects", "experience", "about"];
  var blocks = { skills: skillsBlock, experience: experienceBlock, projects: projectsBlock, about: aboutBlock };
  var navFor = {
    skills: function () { return has(p.skills); },
    experience: function () { return has(p.experience); },
    projects: function () { return has(p.projects); },
    about: function () { return has(p.about); }
  };

  function navBlock() {
    var targets = order.filter(function (k) { return navFor[k] && navFor[k](); })
      .map(function (k) { return ["#" + k, p.labels[k]]; });
    return '<header class="topbar"><span class="mark">' + esc(p.name) + "</span>" +
      (targets.length ? "<nav>" + targets.map(function (t) {
        return '<a href="' + t[0] + '">' + esc(t[1]) + "</a>";
      }).join("") + "</nav>" : "") + "</header>";
  }

  document.title = has(p.name) ? p.name + " — 포트폴리오" : "포트폴리오";
  document.getElementById("app").innerHTML =
    navBlock() + heroBlock() +
    order.map(function (k) { return blocks[k] ? blocks[k]() : ""; }).join("");
  bindProjects();
})();
