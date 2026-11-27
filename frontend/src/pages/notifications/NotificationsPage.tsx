import { useState } from 'react';
import type { Notification } from '../../shared/api/notifications';
import '../supervisor/SupervisorExtras.css';

type Filter = 'all' | 'new' | 'read';
const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'Все' },
    { key: 'new', label: 'Новые' },
    { key: 'read', label: 'Прочитанные' },
];

interface Props {
    items: Notification[];
    onMarkRead: (id: number) => Promise<void>;
    onOpenStudent?: (id: number) => void;
    loadError?: string;
    loading?: boolean;
}

export function NotificationsPage({ items, onMarkRead, onOpenStudent, loadError, loading }: Props) {
    const [filter, setFilter] = useState<Filter>('all');
    const [ascending, setAscending] = useState(false);
    const [expanded, setExpanded] = useState<number | null>(null);
    const [error, setError] = useState('');
    const matches = (item: Notification, key: Filter) =>
        key === 'all' || (key === 'read' ? item.is_read : !item.is_read);
    const rows = items.filter(item => matches(item, filter)).sort((a, b) =>
        (ascending ? 1 : -1) * a.date.localeCompare(b.date)
    );
    async function read(id: number) {
        setError('');
        try {
            await onMarkRead(id);
        } catch {
            setError('Не удалось обновить уведомление');
        }
    }
    return (
        <section className="sx">
            <h1>Уведомления</h1>
            <div className="sx-tabs">
                {filters.map(({ key, label }) => (
                    <button key={key} aria-pressed={filter === key} onClick={() => setFilter(key)}>
                        {label} ({items.filter(item => matches(item, key)).length})
                    </button>
                ))}
                <button onClick={() => setAscending(value => !value)}>По дате {ascending ? '↑' : '↓'}</button>
            </div>
            {(error || loadError) && <p role="alert">{error || loadError}</p>}
            {loading && <p role="status">Загрузка…</p>}
            {rows.map(item => (
                <article key={item.id} className={`sx-notification ${item.is_read ? '' : 'sx-unread'}`}>
                    <div className="sx-between">
                        <strong className="sx-notification-title">{item.title}</strong>
                        <small>{new Date(item.date).toLocaleString('ru-RU')}</small>
                    </div>
                    <p>{item.message}</p>
                    {expanded === item.id && (
                        <div className="sx-notification-details">
                            <p>{item.details}</p>
                            {onOpenStudent && item.studentId !== undefined && (
                                <button onClick={() => onOpenStudent(item.studentId!)}>Открыть профиль</button>
                            )}
                        </div>
                    )}
                    <div className="sx-between sx-notification-footer">
                        <button aria-expanded={expanded === item.id} onClick={() => setExpanded(expanded === item.id ? null : item.id)}>
                            {expanded === item.id ? 'Свернуть' : 'Подробнее →'}
                        </button>
                        {item.is_read ? <small>Прочитано</small> : <button onClick={() => void read(item.id)}>Отметить прочитанным</button>}
                    </div>
                </article>
            ))}
            {!rows.length && !loadError && !loading && <p>Нет уведомлений</p>}
        </section>
    );
}
