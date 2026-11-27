import { Check, Clock, Lock, Minus, Search, X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
export const labels = { pending: 'На рассмотрении', approved: 'Одобрена', rejected: 'Отклонена', expired: 'Истекла', available: 'Доступна', booked: 'Нет свободных мест', done: 'Выполнено', current: 'Текущий этап', waiting: 'Ожидает', locked: 'Не начато' };
export type Status = keyof typeof labels;
export function StatusBadge({ status }: {
    status: Status;
}) {
    const Icon = status === 'approved' || status === 'available' || status === 'done' ? Check : status === 'rejected' ? X : status === 'booked' ? Lock : status === 'pending' || status === 'waiting' ? Clock : Minus;
    return <span className={`st-badge st-${status}`}>
        <Icon size={14}/>
        {labels[status]}
    </span>;
}
export function shortName(s: string) { const [last, ...rest] = s.split(' '); return `${last} ${rest.map(v => v[0] + '.').join(' ')}`; }
export function Heading({ title, description }: {
    title: string;
    description?: string;
}) {
    return <div className="st-heading">
        <h1>
            {title}
        </h1>
        {description && <p>
            {description}
        </p>}
    </div>;
}
export function SearchBox({ value, onChange, placeholder }: {
    value: string;
    onChange: (s: string) => void;
    placeholder: string;
}) {
    return <label className="st-search">
        <Search size={20}/>
        <input aria-label="Поиск" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}/>
    </label>;
}
export function Filter({ label, value, onChange, options, all = 'Все' }: {
    label: string;
    value: string;
    onChange: (s: string) => void;
    options: string[];
    all?: string;
}) {
    return <label className="st-filter">
        {label}
        <select value={value} onChange={e => onChange(e.target.value)}>
            <option value="">
                {all}
            </option>
            {options.map(v => <option key={v}>
                {v}
            </option>)}
        </select>
    </label>;
}
export function Drawer({ title, onClose, children, footer }: {
    title: string;
    onClose: () => void;
    children: ReactNode;
    footer?: ReactNode;
}) {
    useEffect(() => { const key = (e: KeyboardEvent) => { if (e.key === 'Escape')
        onClose(); }; document.addEventListener('keydown', key); const old = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.removeEventListener('keydown', key); document.body.style.overflow = old; }; }, [onClose]);
    return <div className="st-overlay" onClick={onClose}>
        <section className="st-drawer" role="dialog" aria-modal="true" aria-label={title} onClick={e => e.stopPropagation()}>
            <header>
                <h2>
                    {title}
                </h2>
                <button autoFocus aria-label="Закрыть" className="st-icon" onClick={onClose}>
                    <X />
                </button>
            </header>
            <div className="st-drawer-body">
                {children}
            </div>
            {footer && <footer>
                {footer}
            </footer>}
        </section>
    </div>;
}
