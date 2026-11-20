import { useState } from 'react'
import { StatCard } from '../components/Display'

export function WorkloadPage() {
  const [search, setSearch] = useState('')

  const teachers = [
    { id: 1, name: 'Иван Петров', department: 'Информационные системы', students: 8, hours: 240, limit: 300 },
    { id: 2, name: 'Елена Волкова', department: 'Веб-разработка', students: 12, hours: 285, limit: 300 },
    { id: 3, name: 'Ольга Смирнова', department: 'Анализ данных', students: 6, hours: 150, limit: 240 },
    { id: 4, name: 'Анна Морозова', department: 'Искусственный интеллект', students: 10, hours: 310, limit: 300 },
    { id: 5, name: 'Дмитрий Орлов', department: 'Информационные системы', students: 5, hours: 120, limit: 240 },
  ]

  const filteredTeachers = teachers.filter((teacher) =>
    teacher.name.toLowerCase().includes(search.toLowerCase()) ||
    teacher.department.toLowerCase().includes(search.toLowerCase())
  )

  const totalStudents = teachers.reduce((sum, teacher) => sum + teacher.students, 0)
  const totalHours = teachers.reduce((sum, teacher) => sum + teacher.hours, 0)
  const overloaded = teachers.filter((teacher) => teacher.hours > teacher.limit).length

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <div className="eyebrow">УПРАВЛЕНИЕ КАФЕДРОЙ</div>
          <h1>Нагрузка преподавателей</h1>
          <p>Распределение студентов и контроль часовых лимитов.</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="Преподавателей" value={teachers.length} detail="В списке кафедры" icon="users" />
        <StatCard label="Всего студентов" value={totalStudents} detail="Закреплено за преподавателями" icon="file" />
        <StatCard label="Общая нагрузка" value={`${totalHours} ч`} detail="Суммарно по кафедре" icon="chart" />
        <StatCard label="Превышен лимит" value={overloaded} detail="Требуют внимания" icon="check" />
      </div>

      <section className="panel workload-panel">
        <div className="panel-heading">
          <div>
            <h2>Список преподавателей</h2>
            <p>Текущая нагрузка и установленные лимиты</p>
          </div>
        </div>

        <div className="workload-search">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Поиск преподавателя или направления..."
          />
        </div>

        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>ПРЕПОДАВАТЕЛЬ</th>
                <th>СТУДЕНТЫ</th>
                <th>ЗАНЯТО ЧАСОВ</th>
                <th>ЛИМИТ</th>
                <th>ЗАГРУЗКА</th>
                <th>СТАТУС</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map((teacher) => {
                const percent = Math.round((teacher.hours / teacher.limit) * 100)
                const isOverloaded = percent > 100
                const isHigh = percent >= 85 && !isOverloaded

                return (
                  <tr key={teacher.id}>
                    <td>
                      <div className="teacher-name">{teacher.name}</div>
                      <div className="teacher-department">{teacher.department}</div>
                    </td>
                    <td>{teacher.students}</td>
                    <td>{teacher.hours} ч</td>
                    <td>{teacher.limit} ч</td>
                    <td>
                      <div className="load-cell">
                        <div className="progress-track load-track">
                          <div
                            className={`progress-fill ${isOverloaded ? 'load-over' : isHigh ? 'load-high' : ''}`}
                            style={{ width: `${Math.min(percent, 100)}%` }}
                          />
                        </div>
                        <span>{percent}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`load-status ${isOverloaded ? 'overloaded' : isHigh ? 'high' : 'normal'}`}>
                        {isOverloaded ? 'Превышение' : isHigh ? 'Высокая' : 'В норме'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filteredTeachers.length === 0 && (
            <div className="empty-state">
              <h3>Преподаватели не найдены</h3>
              <p>Попробуй изменить поисковый запрос.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
