import { StatCard, TopicStatusBadge } from '../components/Display'

export function ReportsPage() {
  const reports = [
    { name: 'Александр Иванов', group: 'ИС-41', topic: 'Система управления дипломами', supervisor: 'Иван Петров', status: 'В работе' },
    { name: 'Мария Смирнова', group: 'ИС-41', topic: 'Анализ данных', supervisor: 'Ольга Смирнова', status: 'В работе' },
    { name: 'Дмитрий Козлов', group: 'ПИ-42', topic: 'Веб-приложение кафедры', supervisor: 'Елена Волкова', status: 'На проверке' },
    { name: 'Екатерина Волкова', group: 'ИС-41', topic: 'Машинное обучение в образовании', supervisor: 'Анна Морозова', status: 'Не начата' },
    { name: 'Артём Соколов', group: 'ПИ-42', topic: 'Информационная система кафедры', supervisor: 'Иван Петров', status: 'Завершена' },
  ]

  const completed = reports.filter((item) => item.status === 'Завершена').length
  const inProgress = reports.filter((item) => item.status === 'В работе').length
  const onReview = reports.filter((item) => item.status === 'На проверке').length
  const notStarted = reports.filter((item) => item.status === 'Не начата').length

  function exportCSV() {
    const headers = ['Студент', 'Группа', 'Тема', 'Руководитель', 'Статус']
    const rows = reports.map((item) => [
      item.name,
      item.group,
      item.topic,
      item.supervisor,
      item.status,
    ])

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(';'))
      .join('\r\n')

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'diplomnavigator-report.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <div className="eyebrow">АНАЛИТИКА КАФЕДРЫ</div>
          <h1>Отчёты</h1>
          <p>Сводная информация по дипломным проектам.</p>
        </div>
        <button className="primary-button" onClick={exportCSV}>
          ↓ Экспорт CSV
        </button>
      </div>

      <div className="stats-grid">
        <StatCard label="Всего работ" value={reports.length} detail="В сводном отчёте" icon="file" />
        <StatCard label="В работе" value={inProgress} detail="Проекты в процессе" icon="chart" />
        <StatCard label="На проверке" value={onReview} detail="Ожидают проверки" icon="check" />
        <StatCard label="Завершено" value={completed} detail="Готовые работы" icon="users" />
      </div>

      <section className="panel reports-panel">
        <div className="panel-heading">
          <div>
            <h2>Сводка по студентам</h2>
            <p>Демонстрационные данные для прототипа</p>
          </div>
        </div>

        <div className="report-breakdown">
          <div><span className="report-dot not-started" />Не начата <strong>{notStarted}</strong></div>
          <div><span className="report-dot in-progress" />В работе <strong>{inProgress}</strong></div>
          <div><span className="report-dot review" />На проверке <strong>{onReview}</strong></div>
          <div><span className="report-dot completed" />Завершена <strong>{completed}</strong></div>
        </div>

        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>СТУДЕНТ</th>
                <th>ГРУППА</th>
                <th>ТЕМА</th>
                <th>РУКОВОДИТЕЛЬ</th>
                <th>СТАТУС</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.group}</td>
                  <td className="report-topic">{item.topic}</td>
                  <td>{item.supervisor}</td>
                  <td><TopicStatusBadge status={item.status === 'Завершена' ? 'Занята' : item.status === 'В работе' ? 'Открыта' : 'Частично занята'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
