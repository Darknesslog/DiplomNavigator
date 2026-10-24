
import { useState } from 'react'
import { Bell } from 'lucide-react'
import './App.css'

type Topic = {
  id: number
  title: string
  direction: string
  supervisor: string
  places: number
  status: 'Открыта' | 'Частично занята' | 'Занята'
}

const initialTopics: Topic[] = [
  {
    id: 1,
    title: 'Анализ пользовательского опыта цифровых сервисов',
    direction: 'Информационные системы',
    supervisor: 'Иван Петров',
    places: 3,
    status: 'Открыта',
  },
  {
    id: 2,
    title: 'Разработка системы управления проектами',
    direction: 'Веб-разработка',
    supervisor: 'Елена Волкова',
    places: 2,
    status: 'Частично занята',
  },
  {
    id: 3,
    title: 'Методы анализа данных в образовательных системах',
    direction: 'Анализ данных',
    supervisor: 'Иван Петров',
    places: 0,
    status: 'Занята',
  },
  {
    id: 4,
    title: 'Интеллектуальная система поддержки принятия решений',
    direction: 'Искусственный интеллект',
    supervisor: 'Ольга Смирнова',
    places: 2,
    status: 'Открыта',
  },
  {
    id: 5,
    title: 'Проектирование интерфейсов информационных систем',
    direction: 'Веб-разработка',
    supervisor: 'Анна Морозова',
    places: 1,
    status: 'Частично занята',
  },
  {
    id: 6,
    title: 'Прогнозирование спроса методами машинного обучения',
    direction: 'Анализ данных',
    supervisor: 'Ольга Смирнова',
    places: 0,
    status: 'Занята',
  },
  {
    id: 7,
    title: 'Разработка корпоративного веб-портала',
    direction: 'Веб-разработка',
    supervisor: 'Дмитрий Орлов',
    places: 4,
    status: 'Открыта',
  },
  {
    id: 8,
    title: 'Автоматизация документооборота кафедры',
    direction: 'Информационные системы',
    supervisor: 'Анна Морозова',
    places: 2,
    status: 'Открыта',
  },
]

const menuItems = [
  { id: 'dashboard', label: 'Дашборд', icon: '▦' },
  { id: 'topics', label: 'Банк тем', icon: '▤' },
  { id: 'supervisor', label: 'Кабинет руководителя', icon: '♙' },
  { id: 'workload', label: 'Нагрузка', icon: '▥' },
  { id: 'reports', label: 'Отчёты', icon: '▧' },
]

const works = [
  {
    student: 'Анна Смирнова',
    initials: 'АС',
    topic: 'Анализ пользовательского опыта цифровых сервисов',
    supervisor: 'Иван Петров',
    status: 'В работе',
    progress: 65,
    date: '12 мая 2027',
  },
  {
    student: 'Михаил Козлов',
    initials: 'МК',
    topic: 'Разработка системы управления проектами',
    supervisor: 'Елена Волкова',
    status: 'На согласовании',
    progress: 35,
    date: '18 мая 2027',
  },
  {
    student: 'Дарья Иванова',
    initials: 'ДИ',
    topic: 'Методы анализа данных в образовательных системах',
    supervisor: 'Иван Петров',
    status: 'В работе',
    progress: 78,
    date: '20 мая 2027',
  },
  {
    student: 'Артём Соколов',
    initials: 'АС',
    topic: 'Интеллектуальная система поддержки принятия решений',
    supervisor: 'Ольга Смирнова',
    status: 'Не начата',
    progress: 10,
    date: '25 мая 2027',
  },
]

const deadlines = [
  { day: '28', month: 'ОКТ', title: 'Утверждение тем ВКР', subtitle: '12 студентов ожидают согласования', type: 'gold' },
  { day: '03', month: 'НОЯ', title: 'Проверка планов работ', subtitle: '8 работ требуют внимания', type: 'blue' },
  { day: '10', month: 'НОЯ', title: 'Промежуточная аттестация', subtitle: 'До завершения 18 дней', type: 'gray' },
]

function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Все статусы')
  const [topics, setTopics] = useState<Topic[]>(initialTopics)
  const [topicSearch, setTopicSearch] = useState('')
  const [directionFilter, setDirectionFilter] = useState('Все направления')
  const [supervisorFilter, setSupervisorFilter] = useState('Все руководители')
  const [topicStatusFilter, setTopicStatusFilter] = useState('Все статусы')
  const [showTopicForm, setShowTopicForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDirection, setNewDirection] = useState('Веб-разработка')
  const [newSupervisor, setNewSupervisor] = useState('Иван Петров')
  const [newPlaces, setNewPlaces] = useState('2')
  const [formError, setFormError] = useState('')

  const currentPage = menuItems.find((item) => item.id === activePage)

  const filteredWorks = works.filter((work) => {
    const matchesSearch =
      `${work.student} ${work.topic} ${work.supervisor}`
        .toLowerCase()
        .includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === 'Все статусы' || work.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const directions = [...new Set(topics.map((topic) => topic.direction))]
  const supervisors = [...new Set(topics.map((topic) => topic.supervisor))]

  const filteredTopics = topics.filter((topic) => {
    const matchesSearch =
      `${topic.title} ${topic.direction} ${topic.supervisor}`
        .toLowerCase()
        .includes(topicSearch.toLowerCase())

    const matchesDirection =
      directionFilter === 'Все направления' ||
      topic.direction === directionFilter

    const matchesSupervisor =
      supervisorFilter === 'Все руководители' ||
      topic.supervisor === supervisorFilter

    const matchesStatus =
      topicStatusFilter === 'Все статусы' ||
      topic.status === topicStatusFilter

    return matchesSearch && matchesDirection && matchesSupervisor && matchesStatus
  })

  function addTopic(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!newTitle.trim()) {
      setFormError('Введите название темы.')
      return
    }

    const places = Number(newPlaces)

    if (!Number.isInteger(places) || places < 0 || places > 99) {
      setFormError('Количество мест должно быть целым числом от 0 до 99.')
      return
    }

    const newTopic: Topic = {
      id: Math.max(0, ...topics.map((topic) => topic.id)) + 1,
      title: newTitle.trim(),
      direction: newDirection,
      supervisor: newSupervisor,
      places,
      status: places === 0 ? 'Занята' : 'Открыта',
    }

    setTopics((previous) => [newTopic, ...previous])
    setTopicSearch('')
    setDirectionFilter('Все направления')
    setSupervisorFilter('Все руководители')
    setTopicStatusFilter('Все статусы')
    setNewTitle('')
    setNewPlaces('2')
    setFormError('')
    setShowTopicForm(false)
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">Д</div>
          <div>
            <div className="brand-name">ДипломНавигатор</div>
            <div className="brand-caption">Управление ВКР</div>
          </div>
        </div>

        <div className="workspace-label">РАБОЧЕЕ ПРОСТРАНСТВО</div>

        <nav className="navigation">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => setActivePage(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.id === 'topics' && (
                <span className="nav-count">{topics.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="semester-card">
            <div className="semester-label">ТЕКУЩИЙ ПЕРИОД</div>
            <div className="semester-title">2026–2027</div>
            <div className="semester-subtitle">Учебный год</div>
            <div className="semester-progress"><span /></div>
            <div className="semester-foot">
              <span>Осенний семестр</span>
              <span>42%</span>
            </div>
          </div>

          <button
            className="profile"
            onClick={() => window.alert('Профиль пользователя — демонстрационный экран')}
          >
            <div className="avatar profile-avatar">АК</div>
            <div className="profile-info">
              <strong>Александр К.</strong>
              <span>Заведующий кафедрой</span>
            </div>
            <span className="profile-menu">···</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Кафедра</span>
            <span className="breadcrumb-divider">/</span>
            <strong>{currentPage?.label ?? 'Дашборд'}</strong>
          </div>

          <div className="topbar-actions">
            <button
              className="icon-button notification-button"
              aria-label="Уведомления"
              onClick={() => window.alert('Новых уведомлений пока нет')}
            >
              <Bell size={18} />
              <span className="notification-dot" />
            </button>
          </div>
        </header>

        {activePage === 'dashboard' && (
          <Dashboard
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            filteredWorks={filteredWorks}
            setActivePage={setActivePage}
          />
        )}

        {activePage === 'topics' && (
          <div className="page-content">
            <section className="page-heading">
              <div>
                <div className="eyebrow">УПРАВЛЕНИЕ ТЕМАМИ ВКР</div>
                <h1>Банк тем</h1>
                <p className="page-description">
                  Каталог дипломных тем и доступных мест для студентов.
                </p>
              </div>
              <button
                className="primary-button"
                onClick={() => {
                  setFormError('')
                  setShowTopicForm(true)
                }}
              >
                <span>＋</span> Добавить тему
              </button>
            </section>

            <section className="stats-grid topic-stats">
              <StatCard
                label="Всего тем"
                value={String(topics.length)}
                detail="В текущем каталоге"
                change="Все направления"
                icon="▤"
                accent="blue"
              />
              <StatCard
                label="Открытые темы"
                value={String(topics.filter((topic) => topic.status === 'Открыта').length)}
                detail="Есть свободные места"
                change="Можно выбрать"
                icon="✓"
                accent="gold"
              />
              <StatCard
                label="Частично заняты"
                value={String(topics.filter((topic) => topic.status === 'Частично занята').length)}
                detail="Остались доступные места"
                change="Проверьте остаток"
                icon="↗"
                accent="purple"
              />
              <StatCard
                label="Занятые темы"
                value={String(topics.filter((topic) => topic.status === 'Занята').length)}
                detail="Нет свободных мест"
                change="Набор закрыт"
                icon="—"
                accent="red"
              />
            </section>

            <section className="panel topic-catalog">
              <div className="panel-heading topic-catalog-heading">
                <div>
                  <h2>Каталог тем</h2>
                  <p>Ищите, фильтруйте и управляйте доступностью тем.</p>
                </div>
                <span className="catalog-total">{filteredTopics.length} из {topics.length}</span>
              </div>

              <div className="topic-filters">
                <label className="search-box topic-search">
                  <span>⌕</span>
                  <input
                    value={topicSearch}
                    onChange={(event) => setTopicSearch(event.target.value)}
                    placeholder="Поиск по названию, направлению или руководителю"
                    aria-label="Поиск тем"
                  />
                  {topicSearch && (
                    <button
                      type="button"
                      className="clear-search"
                      onClick={() => setTopicSearch('')}
                      aria-label="Очистить поиск"
                    >
                      ×
                    </button>
                  )}
                </label>

                <select
                  className="filter-select"
                  value={directionFilter}
                  onChange={(event) => setDirectionFilter(event.target.value)}
                  aria-label="Фильтр по направлению"
                >
                  <option>Все направления</option>
                  {directions.map((direction) => (
                    <option key={direction}>{direction}</option>
                  ))}
                </select>

                <select
                  className="filter-select"
                  value={supervisorFilter}
                  onChange={(event) => setSupervisorFilter(event.target.value)}
                  aria-label="Фильтр по руководителю"
                >
                  <option>Все руководители</option>
                  {supervisors.map((supervisor) => (
                    <option key={supervisor}>{supervisor}</option>
                  ))}
                </select>

                <select
                  className="filter-select"
                  value={topicStatusFilter}
                  onChange={(event) => setTopicStatusFilter(event.target.value)}
                  aria-label="Фильтр по доступности"
                >
                  <option>Все статусы</option>
                  <option>Открыта</option>
                  <option>Частично занята</option>
                  <option>Занята</option>
                </select>
              </div>

              <div className="table-scroll">
                <table className="topics-table">
                  <thead>
                    <tr>
                      <th>НАЗВАНИЕ ТЕМЫ</th>
                      <th>НАПРАВЛЕНИЕ</th>
                      <th>РУКОВОДИТЕЛЬ</th>
                      <th>СВОБОДНЫЕ МЕСТА</th>
                      <th>СТАТУС</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTopics.map((topic) => (
                      <tr key={topic.id}>
                        <td>
                          <div className="topic-title-cell">
                            <div className="topic-row-icon">▤</div>
                            <div className="topic-title-info">
                              <strong>{topic.title}</strong>
                              <span>Тема ВКР · #{String(topic.id).padStart(3, '0')}</span>
                            </div>
                          </div>
                        </td>
                        <td><span className="direction-tag">{topic.direction}</span></td>
                        <td className="supervisor-cell">{topic.supervisor}</td>
                        <td>
                          <span className={`places-count ${topic.places === 0 ? 'no-places' : ''}`}>
                            {topic.places}
                          </span>
                        </td>
                        <td><TopicStatusBadge status={topic.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredTopics.length === 0 && (
                  <div className="empty-state">
                    Темы не найдены. Измени поисковый запрос или фильтры.
                  </div>
                )}
              </div>

              <div className="table-bottom">
                <span>Демонстрационный каталог. Данные пока не сохраняются на сервере.</span>
                <button
                  className="text-button"
                  onClick={() => {
                    setTopicSearch('')
                    setDirectionFilter('Все направления')
                    setSupervisorFilter('Все руководители')
                    setTopicStatusFilter('Все статусы')
                  }}
                >
                  Сбросить фильтры
                </button>
              </div>
            </section>
          </div>
        )}

        {activePage === 'supervisor' ? (
          <SupervisorCabinet />
        ) : activePage === 'workload' ? (
          <WorkloadPage />
        ) : activePage === 'reports' ? (
          <ReportsPage />
        ) : activePage !== 'dashboard' && activePage !== 'topics' ? (
          <div className="placeholder-page">
            <div className="placeholder-icon">✦</div>
            <h2>Раздел в разработке</h2>
            <p>Этот экран добавим на следующем этапе.</p>
          </div>
        ) : null}

      </main>

      {showTopicForm && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowTopicForm(false)
          }}
        >
          <section
            className="topic-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="topic-modal-title"
          >
            <div className="modal-heading">
              <div>
                <div className="eyebrow">БАНК ТЕМ</div>
                <h2 id="topic-modal-title">Новая тема ВКР</h2>
                <p>Заполни основные сведения о теме.</p>
              </div>
              <button
                className="modal-close"
                onClick={() => setShowTopicForm(false)}
                aria-label="Закрыть"
              >
                ×
              </button>
            </div>

            <form onSubmit={addTopic}>
              <label className="form-field">
                <span>Название темы <b>*</b></span>
                <input
                  autoFocus
                  value={newTitle}
                  onChange={(event) => setNewTitle(event.target.value)}
                  placeholder="Например, Разработка веб-приложения"
                  maxLength={180}
                  required
                />
              </label>

              <label className="form-field">
                <span>Направление</span>
                <select
                  value={newDirection}
                  onChange={(event) => setNewDirection(event.target.value)}
                >
                  <option>Веб-разработка</option>
                  <option>Информационные системы</option>
                  <option>Анализ данных</option>
                  <option>Искусственный интеллект</option>
                </select>
              </label>

              <label className="form-field">
                <span>Научный руководитель</span>
                <select
                  value={newSupervisor}
                  onChange={(event) => setNewSupervisor(event.target.value)}
                >
                  <option>Иван Петров</option>
                  <option>Елена Волкова</option>
                  <option>Ольга Смирнова</option>
                  <option>Анна Морозова</option>
                  <option>Дмитрий Орлов</option>
                </select>
              </label>

              <label className="form-field">
                <span>Количество свободных мест</span>
                <input
                  type="number"
                  min="0"
                  max="99"
                  step="1"
                  value={newPlaces}
                  onChange={(event) => setNewPlaces(event.target.value)}
                  required
                />
              </label>

              {formError && <p className="form-error">{formError}</p>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowTopicForm(false)}
                >
                  Отмена
                </button>
                <button type="submit" className="primary-button">
                  Добавить тему
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}

function Dashboard({
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

function StatCard({ label, value, detail, change, icon, accent }: {
  label: string; value: string; detail: string; change: string; icon: string; accent: string
}) {
  return (
    <div className="stat-card">
      <div className="stat-top"><span className="stat-label">{label}</span><span className={`stat-icon ${accent}`}>{icon}</span></div>
      <div className="stat-value">{value}</div>
      <div className="stat-detail">{detail}</div>
      <div className={`stat-change ${accent}`}>{change}</div>
    </div>
  )
}

function LegendItem({ color, label, value }: { color: string; label: string; value: string }) {
  return <div className="legend-item"><span className={`legend-dot ${color}`} /><span className="legend-label">{label}</span><strong>{value}</strong></div>
}

function WorkloadRow({ name, initials, students, hours, color }: {
  name: string; initials: string; students: number; hours: number; color: string
}) {
  return (
    <div className="workload-row">
      <div className={`avatar workload-avatar ${color}`}>{initials}</div>
      <div className="workload-person"><strong>{name}</strong><span>{students} студентов</span></div>
      <div className="workload-meter"><div className="workload-track"><span className={color} style={{ width: `${Math.min(hours, 120) / 120 * 100}%` }} /></div><span className={hours > 100 ? 'over-limit' : ''}>{hours}%</span></div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const className = status === 'В работе' ? 'in-progress' : status === 'На согласовании' ? 'pending' : 'not-started'
  return <span className={`status-badge ${className}`}>{status}</span>
}

function TopicStatusBadge({ status }: { status: Topic['status'] }) {
  const className = status === 'Открыта' ? 'topic-open' : status === 'Частично занята' ? 'topic-partial' : 'topic-full'
  return <span className={`topic-status ${className}`}><span />{status}</span>
}

export default App


function SupervisorCabinet() {
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


function WorkloadPage() {
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


function ReportsPage() {
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
