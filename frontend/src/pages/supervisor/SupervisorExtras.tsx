import { NotificationsPage } from '../notifications/NotificationsPage';
import { Palette, Contrast, Type, Eye, Sun, Moon, CheckCircle2, Users, BookOpen, LayoutGrid, CircleHelp, ArrowRight } from 'lucide-react';
import { SupervisorSearch } from './SupervisorSearch';
import { fetchSupervisorHelp } from '../../shared/api/supervisorHelp';
import { useEffect, useState } from 'react';
import type { Appearance, SupervisorNotification } from '../../entities/user/supervisorAccount';
import { markNotificationRead } from '../../shared/api/supervisorAccount';
import { fetchSupervisorDashboard } from '../../shared/api/supervisorDashboard';
import { fetchSupervisorTopics } from '../../shared/api/supervisorTopics';
import './SupervisorExtras.css';
const levels = ['Пониженная', 'Стандартная', 'Повышенная', 'Высокая', 'Максимальная'];
export function SupervisorSettings({ value, onChange }: { value: Appearance; onChange: (v: Appearance) => void }) { return <section className="sx"><h1>Настройки</h1><p>Настройте внешний вид и удобство работы с системой. Изменения сохраняются автоматически.</p><div className="sx-grid"><article><h2><Palette aria-hidden="true" />Внешний вид</h2><div className="sx-kicker">Тема интерфейса</div><div className="sx-options">{(['light', 'dark'] as const).map(t => <button key={t} aria-pressed={value.theme === t} onClick={() => onChange({ ...value, theme: t })}>{t === 'light' ? <Sun /> : <Moon />}<span>{t === 'light' ? 'Светлая' : 'Тёмная'}</span>{value.theme === t && <CheckCircle2 className="sx-check" />}</button>)}</div></article><article><h2><Contrast aria-hidden="true" />Контрастность</h2><div className="sx-kicker">Уровень контрастности</div><div className="sx-levels" aria-label="Контрастность временно недоступна">{levels.map((l, i) => <div key={l} className={i === 1 ? 'sx-level current' : 'sx-level'}><span className="sx-dot" /><span>{l}</span><small>{i === 1 ? 'по умолчанию' : i === 0 ? '−1' : `+${i - 1}`}</small></div>)}</div><p>Настройка контрастности временно недоступна.</p></article><article><h2><Type aria-hidden="true" />Размер текста</h2><div className="sx-kicker">Размер шрифта</div>{(['normal', 'large', 'largest'] as const).map((f, i) => <button className="sx-font" key={f} aria-pressed={value.font === f} onClick={() => onChange({ ...value, font: f })}><span><strong>{['Стандартный', 'Увеличенный', 'Крупный'][i]}</strong><small>{['Для большинства пользователей', 'Для удобного чтения длинных текстов', 'Для пользователей со слабым зрением'][i]}</small></span>{value.font === f && <CheckCircle2 />}</button>)}</article><article><h2><Eye aria-hidden="true" />Предпросмотр</h2><div className="sx-kicker">Визуальный пример · стандартная (0)</div><div className="sx-preview"><div className="sx-preview-card"><h3>Пример карточки</h3><p>Так выглядит основной текст системы.</p><input placeholder="Введите значение" aria-label="Пример поля" /><div className="sx-primary">Основная кнопка</div><div className="sx-selected">✓ Активный пункт меню</div></div></div></article></div></section> }
export function SupervisorNotifications({ items, onChange, onOpenStudent, loadError }: {
    items: SupervisorNotification[];
    onChange: (items: SupervisorNotification[]) => void;
    onOpenStudent: (id: number) => void;
    loadError?: string;
}) {
    return (
        <NotificationsPage
            items={items}
            onMarkRead={async id => onChange(await markNotificationRead(id))}
            onOpenStudent={onOpenStudent}
            loadError={loadError}
        />
    );
}
export function SupervisorHelp({ onOpenStudent, onNavigate, onOpenTopic }: { onOpenTopic: (id: number) => void; onOpenStudent: (id: number) => void; onNavigate: (page: string) => void }) {
  const [q, setQ] = useState('');
  const [faq, setFaq] = useState<string[][]>([]);
  const [students, setStudents] = useState<{ id: number; name: string; group: string }[]>([]);
  const [topics, setTopics] = useState<{ id: number; title: string; category: string }[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  useEffect(() => { let active = true; Promise.all([fetchSupervisorDashboard(), fetchSupervisorTopics(), fetchSupervisorHelp()]).then(([d, t, f]) => { if (active) { setFaq(f); setStudents(d.students); setTopics(t) } }).catch(() => { if (active) setError('Не удалось загрузить данные поиска') }).finally(() => { if (active) setLoading(false) }); return () => { active = false } }, []);
  const normalize = (s: string) => s.toLocaleLowerCase('ru').replace(/ё/g, 'е').trim();
  const words = (s: string) => normalize(s).split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  const terms = words(q);
  const score = (s: string) => { const tokens = words(s); if (!terms.length || !terms.every(term => tokens.some(token => token.startsWith(term)))) return 0; return normalize(s) === normalize(q) ? 3 : normalize(s).startsWith(normalize(q)) ? 2 : 1 };
  type Result = { key: string; label: string; description?: string; action: () => void };
  const chooseFaq = (a: string) => { setExpanded(a); setShow(false); setQ(''); requestAnimationFrame(() => document.getElementById(`sx-faq-${faq.findIndex(([title]) => title === a)}`)?.scrollIntoView({ block: 'nearest' })) };
  const groups = [
    { title: 'Студенты', icon: Users, items: students.map(s => ({ key: String(s.id), label: s.name, description: s.group, action: () => onOpenStudent(s.id) })) },
    { title: 'Темы', icon: BookOpen, items: topics.map(t => ({ key: String(t.id), label: t.title, description: t.category, action: () => onOpenTopic(t.id) })) },
    { title: 'Разделы и страницы', icon: LayoutGrid, items: [['students', 'Мои студенты'], ['applications', 'Мои темы'], ['reports', 'Отчёты'], ['dashboard', 'Главная'], ['notifications', 'Уведомления'], ['settings', 'Настройки']].map(([key, label]) => ({ key, label, action: () => onNavigate(key) })) },
    { title: 'Статьи и инструкции', icon: CircleHelp, items: faq.map(([a, b]) => ({ key: a, label: a, description: b, action: () => chooseFaq(a) })) }
  ].map(g => ({ ...g, items: (g.items as Result[]).map(i => ({ ...i, rank: score(i.label) })).filter(i => i.rank > 0).sort((a, b) => b.rank - a.rank) })).filter(g => g.items.length);
  const visible = show && terms.join('').length >= 2;
  const first = groups.flatMap(g => g.items).sort((a, b) => b.rank - a.rank)[0];
  return <section className="sx sx-help"><h1>Помощь</h1><p>Инструкции по работе с системой и ответы на частые вопросы.</p>
    <div className="sx-help-search" onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setShow(false) }} onKeyDown={e => { if (e.key === 'Escape') setShow(false); if (e.key === 'Enter' && e.target instanceof HTMLInputElement && visible && first) { e.preventDefault(); setShow(false); first.action() } }}>
      <SupervisorSearch value={q} onChange={v => { setQ(v); setShow(true) }} onFocus={() => setShow(true)} onEscape={() => setShow(false)} placeholder="Поиск студентов, тем и инструкций" />
      {visible && <div className="sx-search-results sx-search-list" aria-label="Результаты поиска">
        {loading ? <p role="status">Загрузка…</p> : error ? <p role="status">{error}</p> : groups.length ? groups.map(g => <section key={g.title}><h3>{g.title}</h3>{g.items.map(i => <button type="button" key={i.key} onClick={() => { setShow(false); i.action() }}><span className="sx-result-icon"><g.icon /></span><span className="sx-result-copy"><strong>{i.label}</strong>{i.description && <small>{i.description}</small>}</span><ArrowRight className="sx-result-arrow" /></button>)}</section>) : <div className="sx-search-empty" role="status"><strong>Ничего не найдено</strong><p>Попробуйте другое имя, название темы или ключевое слово из вопроса.</p></div>}
      </div>}
    </div>{error && <p role="alert">{error}</p>}{faq.map(([a, b], index) => <details id={`sx-faq-${index}`} key={a} open={expanded === a}><summary onClick={e => { e.preventDefault(); setExpanded(expanded === a ? null : a) }}>{a}</summary><div className="sx-faq-body"><p>{b}</p></div></details>)}
  </section>
}
