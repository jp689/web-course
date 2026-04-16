import CourseCard from "./CourseCard";

function CourseList({ courses, onLearn, onDelete, onEdit }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>课程列表</h2>
          <p>通过 map 进行列表渲染，并把事件处理函数继续传递给子组件。</p>
        </div>
      </div>

      <div className="course-list">
        {courses.length > 0 ? (
          courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onLearn={onLearn}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))
        ) : (
          <div className="empty-box">
            <h3>没有符合条件的课程</h3>
            <p>你可以尝试更换搜索关键词，或者先新增一门课程。</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default CourseList;
