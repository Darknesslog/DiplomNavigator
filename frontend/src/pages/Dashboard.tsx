import { StatCard, LegendItem, WorkloadRow, StatusBadge } from '../components/Display'
import { works, deadlines } from '../demo/data'

export function Dashboard({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  filteredWorks,
  setActivePage,
}: {
  search: string
  setSearch: (value: string) => void
  statusFilter: string
  setStatusFilter: (value: string) => void
  filteredWorks: typeof works
  setActivePage: (value: string) => void
}) {
  return (
    <div className="page-content">
      <section className="page-heading">
        <div>
          <div className="eyebrow">ПОНЕДЕЛЬНИК, 26 ОКТЯБРЯ</div>
          <h1>Дашборд кафедры</h1>
          <p className="page-description">
            Общая картина по выпускным работам и учебной нагрузке.
          </p>
        </div>
        <button className="primary-button" onClick={() => setActivePage('reports')}>
          <span>↗</span> Сформировать отчёт
        </button>
      </section>

      <section className="stats-grid">
        <StatCard label="Всего студентов" value="128" detail="На выпускном курсе" change="+12 за семестр" icon="♙" accent="blue" />
        <StatCard label="Темы утверждены" value="96" detail="Из 128 работ" change="75% от общего числа" icon="✓" accent="gold" />
        <StatCard label="В работе" value="84" detail="Работы в активной стадии" change="12 требуют внимания" icon="↗" accent="purple" />
        <StatCard label="Перегрузка" value="3" detail="Преподавателя выше лимита" change="Нужно перераспределение" icon="!" accent="red" />
      </section>

      <section className="overview-grid">
        <div className="panel status-panel">
          <div className="panel-heading">
            <div><h2>Статусы выпускных работ</h2><p>Распределение по текущему этапу</p></div>
            <button className="text-button" onClick={() => setActivePage('topics')}>Банк тем <span>→</span></button>
          </div>
          <div className="status-total"><strong>128</strong><span>работ всего</span></div>
          <div className="status-bar">
            <span className="segment segment-green" style={{ width: '24%' }} />
            <span className="segment segment-blue" style={{ width: '42%' }} />
            <span className="segment segment-gold" style={{ width: '19%' }} />
            <span className="segment segment-gray" style={{ width: '15%' }} />
          </div>
          <div className="status-legend">
            <LegendItem color="green" label="Завершена" value="31" />
            <LegendItem color="blue" label="В работе" value="54" />
            <LegendItem color="gold" label="На согласовании" value="24" />
            <LegendItem color="gray" label="Не начата" value="19" />
          </div>
        </div>

        <div className="panel workload-panel">
          <div className="panel-heading">
            <div><h2>Нагрузка руководителей</h2><p>Занятость от установленного лимита</p></div>
            <button className="more-button" onClick={() => setActivePage('workload')} aria-label="Перейти к нагрузке">→</button>
          </div>
          <div className="workload-list">
            <WorkloadRow name="Иван Петров" initials="ИП" students={12} hours={85} color="blue" />
            <WorkloadRow name="Елена Волкова" initials="ЕВ" students={9} hours={68} color="gold" />
            <WorkloadRow name="Ольга Смирнова" initials="ОС" students={14} hours={108} color="red" />
          </div>
          <button className="panel-footer-link" onClick={() => setActivePage('workload')}>Открыть распределение нагрузки <span>→</span></button>
        </div>
      </section>

      <section className="panel works-panel">
        <div className="panel-heading works-heading">
          <div><h2>Последние работы</h2><p>Контроль статусов и ближайших сроков</p></div>
          <button className="text-button" onClick={() => setActivePage('topics')}>Все работы <span>→</span></button>
        </div>
        <div className="table-toolbar">
          <div className="search-box">
            <span>⌕</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Поиск студента, темы или руководителя" aria-label="Поиск работ" />
            {search && <button className="clear-search" onClick={() => setSearch('')}>×</button>}
          </div>
          <select className="filter-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Фильтр по статусу">
            <option>Все статусы</option><option>В работе</option><option>На согласовании</option><option>Не начата</option>
          </select>
        </div>
        <div className="table-scroll">
          <table>
            <thead><tr><th>СТУДЕНТ / ТЕМА</th><th>РУКОВОДИТЕЛЬ</th><th>СТАТУС</th><th>ПРОГРЕСС</th><th>ДЕДЛАЙН</th></tr></thead>
            <tbody>
              {filteredWorks.map((work) => (
                <tr key={work.student}>
                  <td><div className="student-cell"><div className="avatar student-avatar">{work.initials}</div><div className="student-info"><strong>{work.student}</strong><span>{work.topic}</span></div></div></td>
                  <td className="supervisor-cell">{work.supervisor}</td>
                  <td><StatusBadge status={work.status} /></td>
                  <td><div className="progress-cell"><div className="progress-track"><span style={{ width: `${work.progress}%` }} /></div><span>{work.progress}%</span></div></td>
                  <td className="deadline-cell">{work.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredWorks.length === 0 && <div className="empty-state">По вашему запросу ничего не найдено.</div>}
        </div>
        <div className="table-bottom"><span>Показано {filteredWorks.length} из {works.length} демонстрационных работ</span><button className="text-button" onClick={() => { setSearch(''); setStatusFilter('Все статусы') }}>Сбросить фильтры</button></div>
      </section>

      <section className="panel deadlines-panel">
        <div className="panel-heading"><div><h2>Ближайшие события</h2><p>Что требует внимания кафедры</p></div><button className="text-button" onClick={() => setActivePage('reports')}>Все события <span>→</span></button></div>
        <div className="deadline-list">
          {deadlines.map((deadline) => (
            <div className="deadline-item" key={deadline.title}>
              <div className={`deadline-date ${deadline.type}`}><strong>{deadline.day}</strong><span>{deadline.month}</span></div>
              <div className="deadline-info"><strong>{deadline.title}</strong><span>{deadline.subtitle}</span></div>
              <span className="deadline-arrow">→</span>
            </div>
          ))}
        </div>
      </section>
      <footer className="page-footer"><span>ДипломНавигатор · Демонстрационный прототип</span><span>Данные учебного года 2026–2027 являются тестовыми</span></footer>
    </div>
  )
}
