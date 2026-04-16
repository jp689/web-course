import { memo } from "react";

const CourseCard = memo(function CourseCard({
  course,
  onLearn,
  onDelete,
  onEdit,
}) {
  const { id, title, desc, category, isStudying } = course;

  return (
    <article className={`card ${isStudying ? "card--active" : ""}`}>
      <div className="card-top">
        <span className="badge">{category}</span>
        <span className={`status ${isStudying ? "status--active" : ""}`}>
          {isStudying ? "学习中" : "未开始"}
        </span>
      </div>

      <h3>{title}</h3>
      <p>{desc}</p>

      <div className="card-actions">
        <button
          type="button"
          className="primary-btn"
          onClick={() => onLearn(id)}
        >
          {isStudying ? "暂停学习" : "学习"}
        </button>
        <button
          type="button"
          className="secondary-btn"
          onClick={() => onEdit(course)}
        >
          编辑
        </button>
        <button
          type="button"
          className="danger-btn"
          onClick={() => onDelete(id)}
        >
          删除
        </button>
      </div>
    </article>
  );
});

export default CourseCard;
