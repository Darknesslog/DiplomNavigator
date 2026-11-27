import { StudentProfileMenu } from './StudentProfileMenu';
import { Bell, Briefcase, FilePenLine, GraduationCap, Headphones, List, PanelLeftClose, Pin, Settings } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import type { Appearance } from '../../entities/user/supervisorAccount';
import '../../pages/supervisor/SupervisorExtras.css';
import '../Layout/Layout.css';
export function StudentLayout({ children, page, navigate, appearance, onLogout, hasWork }: {
    children: ReactNode;
    page: string;
    navigate: (p: string) => void;
    appearance: Appearance;
    onLogout: () => void;
    hasWork: boolean;
}) {
    const [collapsed, setCollapsed] = useState(false);
    const [pinned, setPinned] = useState(false);
    const items = [{ key: 'catalog', label: 'Каталог тем', Icon: List }, { key: 'my-work', label: 'Моя работа', Icon: Briefcase }, ...(hasWork ? [{ key: 'stages', label: 'Этапы ВКР', Icon: List }] : []), { key: 'applications', label: 'Мои заявки', Icon: FilePenLine }, { key: 'notifications', label: 'Уведомления', Icon: Bell }, { key: 'support', label: 'Поддержка', Icon: Headphones }, { key: 'settings', label: 'Настройки', Icon: Settings }];
    return <div data-theme={appearance.theme} data-font={appearance.font} className={`sup-shell student-shell ${collapsed ? 'sup-collapsed' : ''}`}>
        <aside className={`sup-sidebar ${pinned ? 'sup-pinned' : ''}`}>
            <div className="sup-brand">
                <span className="sup-brand-icon">
                    <GraduationCap size={23}/>
                </span>
                {!collapsed && <strong>ДипломНавигатор
                </strong>}
            </div>
            <div className="sup-controls">
                <button title={collapsed ? 'Развернуть' : 'Свернуть'} aria-expanded={!collapsed} onClick={() => setCollapsed(!collapsed)}>
                    <PanelLeftClose size={15}/>
                    {!collapsed && 'Свернуть'}
                </button>
                {!collapsed && <button aria-pressed={pinned} onClick={() => setPinned(!pinned)}>
                    <Pin size={15}/>
                    {pinned ? 'Открепить' : 'Закрепить'}
                </button>}
            </div>
            <nav>
                {items.map(({ key, label, Icon }) => <button key={key} title={label} className={page === key ? 'active' : ''} onClick={() => navigate(key)}>
                    <Icon size={23}/>
                    {!collapsed && label}
                </button>)}
            </nav>
        </aside>
        <div className="sup-main">
            <header className="sup-header">
                <StudentProfileMenu onLogout={onLogout} />
            </header>
            <main className="sup-content">
                {children}
            </main>
        </div>
    </div>;
}
