    (() => {
      "use strict";

      const STORAGE_KEY = "ilikui-study-manager-v1";
      const THEME_KEY = "ilikui-study-manager-theme";
      const GOAL_KEY = "ilikui-study-manager-weekly-goal-v1";
      const $ = (selector) => document.querySelector(selector);
      const form = $("#record-form");
      const titleInput = $("#title");
      const categoryInput = $("#category");
      const minutesInput = $("#minutes");
      const dateInput = $("#date");
      const notesInput = $("#notes");
      const list = $("#record-list");
      const formStatus = $("#form-status");
      const listStatus = $("#list-status");
      const categoryFilter = $("#category-filter");
      const searchInput = $("#search");
      const sortInput = $("#sort");
      let editingId = null;
      let storageAvailable = true;
      let records = loadRecords();
      let weeklyGoal = loadWeeklyGoal();

      function todayLocal() {
        const now = new Date();
        const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
        return local.toISOString().slice(0, 10);
      }

      function validRecord(item) {
        if (!item || typeof item.id !== "string" || !item.id.trim() ||
            typeof item.title !== "string" || !item.title.trim() ||
            typeof item.category !== "string" || typeof item.notes !== "string" ||
            typeof item.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(item.date) ||
            !Number.isInteger(item.minutes) || item.minutes < 0 || item.minutes > 1440) {
          return false;
        }
        const parsedDate = new Date(item.date + "T00:00:00Z");
        return Number.isFinite(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === item.date;
      }

      function normalizeRecord(item) {
        const now = new Date().toISOString();
        return {
          id: item.id.trim(),
          title: item.title.trim(),
          category: item.category.trim(),
          minutes: item.minutes,
          date: item.date,
          notes: item.notes,
          createdAt: typeof item.createdAt === "string" && item.createdAt ? item.createdAt : now,
          updatedAt: typeof item.updatedAt === "string" && item.updatedAt ? item.updatedAt :
            (typeof item.createdAt === "string" && item.createdAt ? item.createdAt : now)
        };
      }

      function loadRecords() {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw === null) return [];
          const parsed = JSON.parse(raw);
          if (!Array.isArray(parsed)) throw new Error("数据格式不是数组");
          return parsed.filter(validRecord).map(normalizeRecord)
        } catch (error) {
          storageAvailable = false;
          console.error("读取本地记录失败：", error);
          return [];
        }
      }

      function loadWeeklyGoal() {
        try {
          const saved = Number(localStorage.getItem(GOAL_KEY));
          return Number.isInteger(saved) && saved >= 1 && saved <= 10080 ? saved : 300;
        } catch {
          return 300;
        }
      }

      function persist(nextRecords) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRecords));
          storageAvailable = true;
          return true;
        } catch (error) {
          storageAvailable = false;
          console.error("保存本地记录失败：", error);
          setStatus(formStatus, "保存失败：浏览器可能禁用了本地存储或存储空间不足。请先导出已有数据。", "error");
          return false;
        }
      }

      function setStatus(element, message, kind = "") {
        element.textContent = message;
        element.className = "status" + (kind ? " " + kind : "");
      }

      function makeId() {
        if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
          return globalThis.crypto.randomUUID();
        }
        return "record-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
      }

      function uniqueCategories() {
        return [...new Set(records.map((item) => item.category.trim()).filter(Boolean))]
          .sort((a, b) => a.localeCompare(b, "zh-CN"));
      }

      function renderCategoryFilter() {
        const previous = categoryFilter.value;
        categoryFilter.replaceChildren(new Option("全部分类", ""));
        for (const category of uniqueCategories()) {
          categoryFilter.add(new Option(category, category));
        }
        if ([...categoryFilter.options].some((option) => option.value === previous)) {
          categoryFilter.value = previous;
        }
      }

      function getVisibleRecords() {
        const query = searchInput.value.trim().toLocaleLowerCase();
        const category = categoryFilter.value;
        const visible = records.filter((item) => {
          const matchesCategory = !category || item.category === category;
          const haystack = [item.title, item.category, item.notes].join(" ").toLocaleLowerCase();
          return matchesCategory && (!query || haystack.includes(query));
        });
        const sort = sortInput.value;
        visible.sort((a, b) => {
          if (sort === "oldest") return a.date.localeCompare(b.date);
          if (sort === "minutes") return b.minutes - a.minutes || b.date.localeCompare(a.date);
          if (sort === "title") return a.title.localeCompare(b.title, "zh-CN");
          return b.date.localeCompare(a.date) || b.updatedAt.localeCompare(a.updatedAt);
        });
        return visible;
      }

      function localDateKey(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return year + "-" + month + "-" + day;
      }

      function renderAnalytics() {
        const weeklyChart = $("#weekly-chart");
        const categoryChart = $("#category-chart");
        if (!weeklyChart || !categoryChart) return;

        const today = new Date();
        const days = [];
        for (let offset = 6; offset >= 0; offset -= 1) {
          const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset);
          const key = localDateKey(day);
          const minutes = records.filter((item) => item.date === key)
            .reduce((sum, item) => sum + item.minutes, 0);
          days.push({ key, label: new Intl.DateTimeFormat("zh-CN", { month: "numeric", day: "numeric" }).format(day), minutes });
        }

        const weeklyMax = Math.max(30, ...days.map((day) => day.minutes));
        const weeklyFragment = document.createDocumentFragment();
        for (const day of days) {
          const item = document.createElement("div");
          item.className = "day-column";
          const value = document.createElement("span");
          value.className = "bar-value";
          value.textContent = day.minutes + " 分";
          const track = document.createElement("div");
          track.className = "bar-track";
          const bar = document.createElement("div");
          bar.className = "day-bar";
          bar.style.height = Math.max(day.minutes > 0 ? 4 : 0, day.minutes / weeklyMax * 100) + "%";
          track.append(bar);
          const label = document.createElement("span");
          label.className = "day-label";
          label.textContent = day.label;
          item.setAttribute("aria-label", day.key + "：学习 " + day.minutes + " 分钟");
          item.append(value, track, label);
          weeklyFragment.append(item);
        }
        weeklyChart.replaceChildren(weeklyFragment);

        const totals = new Map();
        for (const record of records) {
          const category = record.category.trim() || "未分类";
          totals.set(category, (totals.get(category) || 0) + record.minutes);
        }
        const ranked = [...totals.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh-CN")).slice(0, 5);
        categoryChart.replaceChildren();
        if (ranked.length === 0) {
          const empty = document.createElement("p");
          empty.className = "chart-empty";
          empty.textContent = "添加学习记录后，这里会显示专题分布。";
          categoryChart.append(empty);
          return;
        }
        const categoryMax = Math.max(1, ...ranked.map((item) => item[1]));
        const categoryFragment = document.createDocumentFragment();
        for (const [name, minutes] of ranked) {
          const row = document.createElement("div");
          row.className = "category-row";
          const labelLine = document.createElement("div");
          labelLine.className = "category-label-line";
          const label = document.createElement("span");
          label.className = "category-name";
          label.textContent = name;
          const value = document.createElement("span");
          value.className = "category-value";
          value.textContent = minutes + " 分";
          const track = document.createElement("div");
          track.className = "category-track";
          const bar = document.createElement("div");
          bar.className = "category-bar";
          bar.style.width = minutes / categoryMax * 100 + "%";
          track.append(bar);
          labelLine.append(label, value);
          row.append(labelLine, track);
          row.setAttribute("aria-label", name + "：累计学习 " + minutes + " 分钟");
          categoryFragment.append(row);
        }
        categoryChart.append(categoryFragment);
      }

      function renderGoalAndStreak() {
        const today = new Date();
        const todayNumber = Math.floor(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) / 86400000);
        const dayNumbers = [...new Set(records.map((item) => {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(item.date)) return null;
          const timestamp = Date.parse(item.date + "T00:00:00Z");
          return Number.isFinite(timestamp) ? Math.floor(timestamp / 86400000) : null;
        }).filter((value) => value !== null && value <= todayNumber))].sort((a, b) => a - b);
        let longest = 0;
        let run = 0;
        let previous = null;
        for (const day of dayNumbers) {
          run = previous !== null && day === previous + 1 ? run + 1 : 1;
          longest = Math.max(longest, run);
          previous = day;
        }
        let current = 0;
        if (dayNumbers.length) {
          const latest = dayNumbers[dayNumbers.length - 1];
          if (latest === todayNumber || latest === todayNumber - 1) {
            current = 1;
            for (let i = dayNumbers.length - 1; i > 0; i -= 1) {
              if (dayNumbers[i] - dayNumbers[i - 1] !== 1) break;
              current += 1;
            }
          }
        }
        $("#current-streak").textContent = String(current);
        $("#longest-streak").textContent = String(longest);

        const cutoff = localDateKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6));
        const todayKey = localDateKey(today);
        const weekMinutes = records.filter((item) => item.date >= cutoff && item.date <= todayKey)
          .reduce((sum, item) => sum + item.minutes, 0);
        const percent = Math.floor(weekMinutes / weeklyGoal * 100);
        $("#weekly-goal").value = String(weeklyGoal);
        $("#goal-progress-label").textContent = weekMinutes.toLocaleString("zh-CN") + " / " + weeklyGoal.toLocaleString("zh-CN") + " 分钟";
        $("#goal-progress-percent").textContent = percent + "%";
        $("#goal-progress-bar").style.width = Math.min(100, percent) + "%";
        $("#goal-progress").setAttribute("aria-valuenow", String(Math.min(100, percent)));
        $("#goal-progress").setAttribute("aria-valuetext", weekMinutes + " 分钟，共 " + weeklyGoal + " 分钟目标");
        if (percent >= 100) setStatus($("#goal-status"), "目标达成！保持节奏，也记得给自己留点休息时间。", "success");
        else setStatus($("#goal-status"), "还差 " + Math.max(0, weeklyGoal - weekMinutes) + " 分钟达到本周目标。");
      }

      function renderTopicExportOptions() {
        const select = $("#topic-export-select");
        const previous = select.value;
        select.replaceChildren(new Option("请选择专题", ""));
        const categories = uniqueCategories();
        if (records.some((item) => !item.category.trim())) categories.push("未分类");
        for (const category of categories) select.add(new Option(category, category));
        if ([...select.options].some((option) => option.value === previous)) select.value = previous;
      }

      function exportTopicMarkdown() {
        const category = $("#topic-export-select").value;
        if (!category) {
          setStatus($("#topic-export-status"), "请先选择一个专题。", "error");
          return;
        }
        const topicRecords = records.filter((item) => (item.category.trim() || "未分类") === category)
          .sort((a, b) => a.date.localeCompare(b.date) || (a.createdAt || "").localeCompare(b.createdAt || "") || a.id.localeCompare(b.id));
        if (!topicRecords.length) {
          setStatus($("#topic-export-status"), "这个专题目前没有可导出的记录。", "error");
          return;
        }
        const totalMinutes = topicRecords.reduce((sum, item) => sum + item.minutes, 0);
        const lines = [
          "# " + category + "｜学习专题复盘",
          "",
          "- 导出日期：" + todayLocal(),
          "- 记录数量：" + topicRecords.length,
          "- 累计学习：" + totalMinutes + " 分钟",
          "",
          "## 学习记录",
          ""
        ];
        for (const item of topicRecords) {
          lines.push("### " + item.date + "｜" + item.title, "", "- 学习时长：" + item.minutes + " 分钟", "");
          if (item.notes.trim()) lines.push(item.notes.trim(), "");
          else lines.push("（尚未填写复盘内容）", "");
          lines.push("---", "");
        }
        lines.push("## 后续思考", "", "- 这个专题最重要的三个结论是什么？", "- 哪些问题还没有解决？", "- 下一步要验证或实践什么？", "");
        const blob = new Blob(["\uFEFF", lines.join("\n")], { type: "text/markdown;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = category.replace(/[\\\\/:*?"<>|]/g, "-") + "-专题复盘-" + todayLocal() + ".md";
        document.body.append(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
        setStatus($("#topic-export-status"), "已导出「" + category + "」专题，共 " + topicRecords.length + " 条记录。", "success");
      }

      function render() {
        renderCategoryFilter();
        const visible = getVisibleRecords();
        list.replaceChildren();
        $("#visible-count").textContent = visible.length + " 条";
        $("#total-count").textContent = records.length.toLocaleString("zh-CN");
        $("#topic-count").textContent = uniqueCategories().length.toLocaleString("zh-CN");
        $("#minutes-count").textContent = records.reduce((sum, item) => sum + item.minutes, 0).toLocaleString("zh-CN");
        renderAnalytics();
        renderGoalAndStreak();
        renderTopicExportOptions();

        if (visible.length === 0) {
          const empty = document.createElement("div");
          empty.className = "empty";
          empty.textContent = records.length ? "没有找到符合条件的记录，试试调整搜索词或分类。" : "这里还没有记录。创建第一条学习记录，让知识开始积累。";
          list.append(empty);
          return;
        }

        const fragment = document.createDocumentFragment();
        for (const record of visible) {
          const article = document.createElement("article");
          article.className = "entry";
          const top = document.createElement("div");
          top.className = "entry-top";
          const headingWrap = document.createElement("div");
          const heading = document.createElement("h3");
          heading.textContent = record.title;
          const meta = document.createElement("div");
          meta.className = "meta";
          const date = document.createElement("span");
          date.textContent = record.date || "未设置日期";
          const minutes = document.createElement("span");
          minutes.textContent = record.minutes + " 分钟";
          meta.append(date, minutes);
          headingWrap.append(heading, meta);
          top.append(headingWrap);
          if (record.category) {
            const tag = document.createElement("span");
            tag.className = "tag";
            tag.textContent = record.category;
            top.append(tag);
          }
          article.append(top);
          if (record.notes) {
            const note = document.createElement("p");
            note.textContent = record.notes;
            article.append(note);
          }
          const actions = document.createElement("div");
          actions.className = "entry-actions";
          const edit = document.createElement("button");
          edit.type = "button"; edit.className = "btn"; edit.textContent = "编辑";
          edit.dataset.action = "edit"; edit.dataset.id = record.id;
          const remove = document.createElement("button");
          remove.type = "button"; remove.className = "btn danger"; remove.textContent = "删除";
          remove.dataset.action = "delete"; remove.dataset.id = record.id;
          actions.append(edit, remove);
          article.append(actions);
          fragment.append(article);
        }
        list.append(fragment);
      }

      function resetForm() {
        editingId = null;
        form.reset();
        dateInput.value = todayLocal();
        minutesInput.value = "30";
        $("#editor-title").textContent = "新建学习记录";
        $("#editor-mode").textContent = "新记录";
        $("#save-btn").textContent = "保存记录";
        $("#cancel-edit").textContent = "重置";
        setStatus(formStatus, "");
      }

      function startEdit(id) {
        const record = records.find((item) => item.id === id);
        if (!record) return;
        editingId = id;
        titleInput.value = record.title;
        categoryInput.value = record.category;
        minutesInput.value = String(record.minutes);
        dateInput.value = record.date;
        notesInput.value = record.notes;
        $("#editor-title").textContent = "编辑学习记录";
        $("#editor-mode").textContent = "编辑中";
        $("#save-btn").textContent = "保存修改";
        $("#cancel-edit").textContent = "取消编辑";
        setStatus(formStatus, "正在编辑记录。");
        titleInput.focus();
        $("#editor-panel").scrollIntoView({ behavior: "smooth", block: "start" });
      }

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const title = titleInput.value.trim();
        const category = categoryInput.value.trim();
        const minutes = Number(minutesInput.value);
        const date = dateInput.value;
        const notes = notesInput.value.trim();

        if (!title) {
          setStatus(formStatus, "请填写学习主题。", "error");
          titleInput.focus();
          return;
        }
        if (!Number.isInteger(minutes) || minutes < 0 || minutes > 1440) {
          setStatus(formStatus, "学习时长必须是 0 到 1440 之间的整数。", "error");
          minutesInput.focus();
          return;
        }
        if (!date || Number.isNaN(Date.parse(date + "T00:00:00"))) {
          setStatus(formStatus, "请选择有效的学习日期。", "error");
          dateInput.focus();
          return;
        }

        const now = new Date().toISOString();
        const previous = records;
        const existing = editingId ? records.find((item) => item.id === editingId) : null;
        const record = {
          id: editingId || makeId(), title, category, minutes, date, notes,
          createdAt: existing?.createdAt || now, updatedAt: now
        };
        const next = existing
          ? records.map((item) => item.id === editingId ? record : item)
          : [record, ...records];

        if (!persist(next)) return;
        records = next;
        render();
        resetForm();
        setStatus(formStatus, existing ? "修改已保存。" : "新记录已保存。", "success");
        setStatus(listStatus, "当前数据已保存到此浏览器。", "success");
      });

      list.addEventListener("click", (event) => {
        if (!(event.target instanceof Element)) return;
        const button = event.target.closest("button[data-action][data-id]");
        if (!button || !list.contains(button)) return;
        const id = button.dataset.id;
        if (button.dataset.action === "edit") {
          startEdit(id);
          return;
        }
        if (button.dataset.action === "delete") {
          const record = records.find((item) => item.id === id);
          if (!record || !window.confirm("确定删除这条学习记录吗？")) return;
          const next = records.filter((item) => item.id !== id);
          if (!persist(next)) return;
          records = next;
          if (editingId === id) resetForm();
          render();
          setStatus(listStatus, "记录已删除。", "success");
        }
      });

      [searchInput, categoryFilter, sortInput].forEach((control) => {
        control.addEventListener(control === searchInput ? "input" : "change", render);
      });

      $("#goal-form").addEventListener("submit", (event) => {
        event.preventDefault();
        const value = Number($("#weekly-goal").value);
        if (!Number.isInteger(value) || value < 1 || value > 10080) {
          setStatus($("#goal-status"), "每周目标请输入 1 到 10080 之间的整数分钟。", "error");
          return;
        }
        try {
          localStorage.setItem(GOAL_KEY, String(value));
          weeklyGoal = value;
          renderGoalAndStreak();
          setStatus($("#goal-status"), "每周目标已保存。");
        } catch (error) {
          setStatus($("#goal-status"), "目标无法保存：浏览器本地存储不可用。", "error");
        }
      });
      $("#export-topic-btn").addEventListener("click", exportTopicMarkdown);

      $("#focus-add").addEventListener("click", () => {
        resetForm();
        titleInput.focus();
        $("#editor-panel").scrollIntoView({ behavior: "smooth", block: "start" });
      });
      $("#cancel-edit").addEventListener("click", resetForm);
      $("#clear-search").addEventListener("click", () => {
        searchInput.value = "";
        categoryFilter.value = "";
        sortInput.value = "newest";
        render();
        setStatus(listStatus, "筛选条件已清除。");
      });

      $("#theme-toggle").addEventListener("click", () => {
        const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
        document.documentElement.dataset.theme = nextTheme;
        try { localStorage.setItem(THEME_KEY, nextTheme); } catch (error) {
          console.warn("主题设置无法保存", error);
        }
      });

      $("#export-btn").addEventListener("click", () => {
        const payload = {
          schemaVersion: 1,
          exportedAt: new Date().toISOString(),
          records
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "study-records-" + todayLocal() + ".json";
        document.body.append(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
        setStatus(listStatus, "已生成 JSON 导出文件。", "success");
      });

      $("#import-btn").addEventListener("click", () => $("#import-file").click());
      $("#import-file").addEventListener("change", async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
          const parsed = JSON.parse(await file.text());
          const imported = Array.isArray(parsed) ? parsed : parsed.records;
          if (!Array.isArray(imported) || !imported.every(validRecord)) {
            throw new Error("文件不是受支持的学习记录 JSON，或存在无效记录。");
          }
          const normalizedImported = imported.map(normalizeRecord);
          const mode = window.confirm("点击“确定”合并导入（同 ID 覆盖）；点击“取消”将替换当前全部记录。");
          let next;
          if (mode) {
            const map = new Map(records.map((item) => [item.id, item]));
            normalizedImported.forEach((item) => map.set(item.id, item));
            next = [...map.values()];
          } else {
            next = normalizedImported;
          }
          if (!persist(next)) return;
          records = next;
          resetForm();
          render();
          setStatus(listStatus, "导入完成，共 " + normalizedImported.length + " 条记录。", "success");
        } catch (error) {
          console.error(error);
          setStatus(listStatus, "导入失败：" + (error instanceof Error ? error.message : "文件读取错误"), "error");
        } finally {
          event.target.value = "";
        }
      });

      try {
        const savedTheme = localStorage.getItem(THEME_KEY);
        const preferred = window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        document.documentElement.dataset.theme = savedTheme || preferred;
      } catch {
        document.documentElement.dataset.theme = "light";
      }

      dateInput.value = todayLocal();
      render();
      if (!storageAvailable) {
        setStatus(listStatus, "本地数据读取失败或存储不可用。当前展示的记录可能不完整，请检查浏览器设置并从备份导入。", "error");
      }
    })();
