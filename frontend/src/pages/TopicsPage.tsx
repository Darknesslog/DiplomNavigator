import { StatCard, TopicStatusBadge } from '../components/Display'
import type { TopicCatalog } from '../features/topics/useTopics'

export function TopicsPage({ catalog }: { catalog: TopicCatalog }) {
  const {
    topics,
    topicSearch,
    setTopicSearch,
    directionFilter,
    setDirectionFilter,
    supervisorFilter,
    setSupervisorFilter,
    topicStatusFilter,
    setTopicStatusFilter,
    setShowTopicForm,
    setFormError,
    directions,
    supervisors,
    filteredTopics,
  } = catalog
  return (
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
  )
}
