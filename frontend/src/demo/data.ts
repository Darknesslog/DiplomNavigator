/** Local fixtures for the UI prototype, separate from server contracts. */
export type Topic = {
  id: number
  title: string
  direction: string
  supervisor: string
  places: number
  status: 'Открыта' | 'Частично занята' | 'Занята'
}

export const initialTopics: Topic[] = [
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

export const menuItems = [
  { id: 'dashboard', label: 'Дашборд', icon: '▦' },
  { id: 'topics', label: 'Банк тем', icon: '▤' },
  { id: 'supervisor', label: 'Кабинет руководителя', icon: '♙' },
  { id: 'workload', label: 'Нагрузка', icon: '▥' },
  { id: 'reports', label: 'Отчёты', icon: '▧' },
]

export const works = [
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

export const deadlines = [
  { day: '28', month: 'ОКТ', title: 'Утверждение тем ВКР', subtitle: '12 студентов ожидают согласования', type: 'gold' },
  { day: '03', month: 'НОЯ', title: 'Проверка планов работ', subtitle: '8 работ требуют внимания', type: 'blue' },
  { day: '10', month: 'НОЯ', title: 'Промежуточная аттестация', subtitle: 'До завершения 18 дней', type: 'gray' },
]
