import { useState } from 'react'
import { Bell } from 'lucide-react'
import { menuItems, works } from './demo/data'
import { Dashboard } from './pages/Dashboard'
import { TopicsPage } from './pages/TopicsPage'
import { SupervisorCabinet } from './pages/SupervisorCabinet'
import { WorkloadPage } from './pages/WorkloadPage'
import { ReportsPage } from './pages/ReportsPage'
import { useTopics } from './features/topics/useTopics'
import { TopicForm } from './features/topics/TopicForm'
import './App.css'

function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Все статусы')
  const catalog = useTopics()
  const { topics, showTopicForm } = catalog

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

        {activePage === 'topics' && <TopicsPage catalog={catalog} />}

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

      {showTopicForm && <TopicForm catalog={catalog} />}
    </div>
  )
}

export default App
