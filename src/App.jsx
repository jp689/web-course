import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Header from "./components/Header";
import CourseList from "./components/CourseList";
import Footer from "./components/Footer";
import useDebounce from "./hooks/useDebounce";
import useLocalStorage from "./hooks/useLocalStorage";

const LOCAL_STORAGE_KEY = "react-course-manager";
const CATEGORY_OPTIONS = [
  "前端基础",
  "后端开发",
  "数据结构",
  "项目实战",
  "工具效率",
];

const defaultCourses = [
  {
    id: 1,
    title: "React 基础入门",
    desc: "学习 JSX、组件拆分、props 与 useState 的基本使用方式。",
    category: "前端基础",
    isStudying: true,
  },
  {
    id: 2,
    title: "Node.js 接口开发",
    desc: "理解服务端路由、接口设计以及前后端联调的常见流程。",
    category: "后端开发",
    isStudying: false,
  },
  {
    id: 3,
    title: "算法与数据结构",
    desc: "通过数组、链表、栈和队列训练编程思维与问题拆解能力。",
    category: "数据结构",
    isStudying: false,
  },
];

function createEmptyForm() {
  return {
    title: "",
    desc: "",
    category: CATEGORY_OPTIONS[0],
  };
}

function App() {
  const [courses, setCourses, isHydrated] = useLocalStorage(
    LOCAL_STORAGE_KEY,
    defaultCourses
  );
  const [form, setForm] = useState(createEmptyForm());
  const [searchKeyword, setSearchKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("全部");
  const [editingId, setEditingId] = useState(null);
  const [errorText, setErrorText] = useState("");
  const [noticeText, setNoticeText] = useState("");
  const titleInputRef = useRef(null);
  const debouncedSearchKeyword = useDebounce(searchKeyword, 300);

  useEffect(() => {
    if (!noticeText) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setNoticeText("");
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [noticeText]);

  const totalCount = courses.length;
  const focusTitleInput = useCallback(() => {
    titleInputRef.current?.focus();
  }, []);

  const resetForm = useCallback(() => {
    setForm(createEmptyForm());
    setEditingId(null);
    setErrorText("");
    focusTitleInput();
  }, [focusTitleInput]);

  const handleFormChange = useCallback((event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errorText) {
      setErrorText("");
    }
  }, [errorText]);

  const validateCourse = useCallback((nextForm) => {
    if (!nextForm.title.trim()) {
      setErrorText("课程名称不能为空");
      return false;
    }

    if (!nextForm.desc.trim()) {
      setErrorText("课程简介不能为空");
      return false;
    }

    return true;
  }, []);

  const handleLearn = useCallback(
    (id) => {
      let notice = "";

      setCourses((prev) => {
        const selectedCourse = prev.find((course) => course.id === id);

        if (!selectedCourse) {
          return prev;
        }

        notice = selectedCourse.isStudying
          ? `已暂停学习《${selectedCourse.title}》`
          : `开始学习《${selectedCourse.title}》`;

        return prev.map((course) =>
          course.id === id
            ? { ...course, isStudying: !course.isStudying }
            : course
        );
      });

      if (notice) {
        setNoticeText(notice);
      }
    },
    [setCourses]
  );

  const handleSubmit = useCallback(
    (event) => {
    event.preventDefault();

      if (!validateCourse(form)) {
      return;
    }

      const nextCourse = {
        title: form.title.trim(),
        desc: form.desc.trim(),
        category: form.category,
      };

      if (editingId !== null) {
        setCourses((prev) =>
          prev.map((course) =>
            course.id === editingId ? { ...course, ...nextCourse } : course
          )
        );
        setNoticeText(`已更新课程《${nextCourse.title}》`);
      } else {
        setCourses((prev) => [
          {
            id: Date.now(),
            ...nextCourse,
            isStudying: false,
          },
          ...prev,
        ]);
        setNoticeText(`已新增课程《${nextCourse.title}》`);
      }

      resetForm();
    },
    [editingId, form, resetForm, setCourses, validateCourse]
  );

  const handleDeleteCourse = useCallback(
    (id) => {
      let removedCourse = null;

      setCourses((prev) => {
        removedCourse = prev.find((course) => course.id === id) ?? null;
        return prev.filter((course) => course.id !== id);
      });

      if (editingId === id) {
        resetForm();
      }

      if (removedCourse) {
        setNoticeText(`已删除课程《${removedCourse.title}》`);
      }
    },
    [editingId, resetForm, setCourses]
  );

  const handleEditCourse = useCallback((course) => {
    setForm({
      title: course.title,
      desc: course.desc,
      category: course.category,
    });
    setEditingId(course.id);
    setErrorText("");
    setNoticeText(`正在编辑《${course.title}》`);
    focusTitleInput();
  }, [focusTitleInput]);

  const filteredCourses = useMemo(() => {
    const normalizedKeyword = debouncedSearchKeyword.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesKeyword =
        normalizedKeyword === "" ||
        course.title.toLowerCase().includes(normalizedKeyword) ||
        course.desc.toLowerCase().includes(normalizedKeyword);

      const matchesCategory =
        categoryFilter === "全部" || course.category === categoryFilter;

      return matchesKeyword && matchesCategory;
    });
  }, [categoryFilter, courses, debouncedSearchKeyword]);

  const studyingCount = useMemo(
    () => courses.filter((course) => course.isStudying).length,
    [courses]
  );
  const filteredCount = useMemo(() => filteredCourses.length, [filteredCourses]);

  return (
    <div className="app-shell">
      <div className="app">
        <Header
          title="React 课程实验页面"
          totalCount={totalCount}
          studyingCount={studyingCount}
        />

        <section className="panel editor-panel">
          <div className="panel-head">
            <div>
              <h2>{editingId !== null ? "编辑课程" : "新增课程"}</h2>
              <p>
                {isHydrated
                  ? "通过受控组件管理输入内容，并自动同步本地课程数据。"
                  : "正在读取本地课程数据，请稍候..."}
              </p>
            </div>
            {noticeText && <span className="notice">{noticeText}</span>}
          </div>

          <form className="course-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label className="field">
                <span>课程名称</span>
                <input
                  ref={titleInputRef}
                  type="text"
                  name="title"
                  placeholder="请输入课程名称"
                  value={form.title}
                  onChange={handleFormChange}
                />
              </label>

              <label className="field">
                <span>课程分类</span>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleFormChange}
                >
                  {CATEGORY_OPTIONS.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field field--full">
                <span>课程简介</span>
                <textarea
                  name="desc"
                  rows="4"
                  placeholder="请输入课程简介"
                  value={form.desc}
                  onChange={handleFormChange}
                />
              </label>
            </div>

            {errorText && <p className="error-text">{errorText}</p>}

            <div className="form-actions">
              <button type="submit" className="primary-btn">
                {editingId !== null ? "保存修改" : "添加课程"}
              </button>
              {editingId !== null && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={resetForm}
                >
                  取消编辑
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="panel toolbar-panel">
          <div className="toolbar">
            <label className="field">
              <span>搜索课程（300ms 防抖）</span>
              <input
                type="text"
                placeholder="按名称或简介实时搜索（已做防抖优化）"
                value={searchKeyword}
                onChange={(event) => setSearchKeyword(event.target.value)}
              />
            </label>

            <p className="toolbar-note">
              支持实时搜索、分类筛选和本地存储恢复，筛选结果已通过
              useMemo 进行缓存。
            </p>

            <label className="field">
              <span>分类筛选</span>
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
              >
                <option value="全部">全部</option>
                {CATEGORY_OPTIONS.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <strong>{totalCount}</strong>
              <span>课程总数</span>
            </div>
            <div className="stat-card">
              <strong>{filteredCount}</strong>
              <span>当前展示</span>
            </div>
            <div className="stat-card">
              <strong>{studyingCount}</strong>
              <span>学习中</span>
            </div>
          </div>
        </section>

        <CourseList
          courses={filteredCourses}
          onLearn={handleLearn}
          onDelete={handleDeleteCourse}
          onEdit={handleEditCourse}
        />

        <Footer />
      </div>
    </div>
  );
}

export default App;
