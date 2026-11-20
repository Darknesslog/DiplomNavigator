import { useState } from 'react'
import { StatCard } from '../components/Display'

export function SupervisorCabinet() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Все статусы')

  const [students, setStudents] = useState([
    {
      id: 1,
      name: 'Александр Иванов',
      group: 'ИС-41',
      topic: 'Разработка системы управления дипломными проектами',
      progress: 75,
      status: 'В работе',
      deadline: '15.05.2027',
    },
    {
      id: 2,
      name: 'Мария Смирнова',
      group: 'ИС-41',
      topic: 'Анализ данных для поддержки принятия решений',
      progress: 45,
      status: 'В работе',
      deadline: '20.05.2027',
    },
    {
      id: 3,
      name: 'Дмитрий Козлов',
      group: 'ПИ-42',
      topic: 'Разработка веб-приложения для кафедры',
      progress: 100,
      status: 'На проверке',
      deadline: '10.05.2027',
    },
    {
      id: 4,
      name: 'Екатерина Волкова',
      group: 'ИС-41',
      topic: 'Применение машинного обучения в образовании',
      progress: 20,
      status: 'Не начата',
      deadline: '25.05.2027',
    },
    {
      id: 5,
      name: 'Артём Соколов',
      group: 'ПИ-42',
      topic: 'Проектирование информационной системы кафедры',
      progress: 60,
      status: 'В работе',
      deadline: '18.05.2027',
    },
  ])

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.topic.toLowerCase().includes(search.toLowerCase()) ||
      student.group.toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === 'Все статусы' || student.status === statusFilter

    return matchesSearch && matchesStatus
  })

  function changeStatus(id: number, status: string) {
    setStudents((current) =>
      current.map((student) =>
        student.id === id ? { ...student, status } : student,
      ),
    )
  }

  const averageProgress = Math.round(
    students.reduce((sum, student) => sum + student.progress, 0) /
    students.length,
  )

  const inProgress = students.filter(
    (student) => student.status === 'В работе',
  ).length

  const onReview = students.filter(
    (student) => student.status === 'На проверке',
  ).length

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <div className="eyebrow">РАБОЧЕЕ ПРОСТРАНСТВО</div>
          <h1>Кабинет руководителя</h1>
          <p>Студенты, темы и контроль выполнения работ.</p>
        </div>
        <div className="supervisor-profile">
          <div className="avatar">ИП</div>
          <div>
            <strong>Иван Петров</strong>
            <span>Научный руководитель</span>
          </div>
        </div>
      </div>

      <div className="stats-grid supervisor-stats">
        <StatCard
          label="Всего студентов"
          value={students.length}
          detail="Закреплено за вами"
          icon="users"
        />
        <StatCard
          label="В работе"
          value={inProgress}
          detail="Работы в процессе"
          icon="file"
        />
        <StatCard
          label="На проверке"
          value={onReview}
          detail="Ожидают проверки"
          icon="check"
        />
        <StatCard
          label="Средний прогресс"
          value={`${averageProgress}%`}
          detail="По всем студентам"
          icon="chart"
        />
      </div>

      <section className="panel supervisor-panel">
        <div className="panel-heading supervisor-list-heading">
          <div>
            <h2>Мои студенты</h2>
            <p>Список закреплённых дипломных проектов</p>
          </div>
          <span className="result-count">
            {filteredStudents.length} из {students.length}
          </span>
        </div>

        <div className="topic-filters supervisor-filters">
          <div className="search-box supervisor-search">
            <span>⌕</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Поиск по студенту, группе или теме..."
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option>Все статусы</option>
            <option>Не начата</option>
            <option>В работе</option>
            <option>На проверке</option>
            <option>Завершена</option>
          </select>
        </div>

        <div className="table-scroll">
          <table className="data-table supervisor-table">
            <thead>
              <tr>
                <th>СТУДЕНТ</th>
                <th>ТЕМА ПРОЕКТА</th>
                <th>ПРОГРЕСС</th>
                <th>СТАТУС</th>
                <th>ДЕДЛАЙН</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>
                    <div className="student-cell">
                      <div className="avatar small-avatar">
                        {student.name
                          .split(' ')
                          .map((part) => part[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <div>
                        <strong>{student.name}</strong>
                        <span>{student.group}</span>
                      </div>
                    </div>
                  </td>
                  <td className="student-topic">{student.topic}</td>
                  <td>
                    <div className="progress-cell">
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>
                      <span>{student.progress}%</span>
                    </div>
                  </td>
                  <td>
                    <select
                      className="status-select"
                      value={student.status}
                      onChange={(event) =>
                        changeStatus(student.id, event.target.value)
                      }
                    >
                      <option>Не начата</option>
                      <option>В работе</option>
                      <option>На проверке</option>
                      <option>Завершена</option>
                    </select>
                  </td>
                  <td className="deadline-cell">{student.deadline}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredStudents.length === 0 && (
            <div className="empty-state">
              <h3>Ничего не найдено</h3>
              <p>Попробуйте изменить запрос или фильтр.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
