function Header(props) {
  return (
    <header className="header">
      <div>
        <p className="eyebrow">Course Manager</p>
        <h1>{props.title}</h1>
        <p className="header-desc">
          使用 React Hooks、props、受控组件与列表渲染完成课程管理实验。
        </p>
      </div>

      <div className="header-summary">
        <div>
          <strong>{props.totalCount}</strong>
          <span>全部课程</span>
        </div>
        <div>
          <strong>{props.studyingCount}</strong>
          <span>学习中</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
