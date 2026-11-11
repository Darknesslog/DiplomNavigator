import type { TopicCatalog } from './useTopics'

export function TopicForm({ catalog }: { catalog: TopicCatalog }) {
  const {
    setShowTopicForm,
    newTitle,
    setNewTitle,
    newDirection,
    setNewDirection,
    newSupervisor,
    setNewSupervisor,
    newPlaces,
    setNewPlaces,
    formError,
    addTopic,
  } = catalog
  return (
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
  )
}
