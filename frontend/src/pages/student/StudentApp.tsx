import { NotificationsPage } from '../notifications/NotificationsPage';
import { fetchNotifications, markNotificationRead, type Notification } from '../../shared/api/notifications';
import { useEffect, useState } from 'react';
import type { StudentData } from '../../entities/student/student';
import type { Appearance } from '../../entities/user/supervisorAccount';
import { fetchStudent } from '../../shared/api/student';
import { StudentLayout } from '../../widgets/StudentLayout/StudentLayout';
import { SupervisorSettings } from '../supervisor/SupervisorExtras';
import { StudentApplicationsPage } from './StudentApplicationsPage';
import { StudentCatalogPage } from './StudentCatalogPage';
import { StudentStagesPage } from './StudentStagesPage';
import { StudentSupportPage } from './StudentSupportPage';
import { StudentWorkPage } from './StudentWorkPage';
import './StudentShared.css';
export function StudentApp({ page, navigate, appearance, onAppearance, onLogout }: {
    page: string;
    navigate: (p: string) => void;
    appearance: Appearance;
    onAppearance: (v: Appearance) => void;
    onLogout: () => void;
}) {
    const [data, setData] = useState<StudentData | null>(null);
    const [error, setError] = useState('');
    useEffect(() => { let active = true; fetchStudent().then(v => { if (active)
        setData(v); }).catch(() => { if (active)
        setError('Не удалось загрузить данные'); }); return () => { active = false; }; }, []);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [notificationsLoading, setNotificationsLoading] = useState(true);
    const [notificationError, setNotificationError] = useState('');
    useEffect(() => {
        fetchNotifications('student').then(setNotifications)
            .catch(() => setNotificationError('Не удалось загрузить уведомления'))
            .finally(() => setNotificationsLoading(false));
    }, []);
    return <StudentLayout page={page} navigate={navigate} appearance={appearance} onLogout={onLogout} hasWork={!!data?.workTopicId}>
        <div className="st-page">
            {error ? <p role="alert">
                {error}
            </p> : !data ? <p>Загрузка…
            </p> : <>
                {page === 'catalog' && <StudentCatalogPage data={data} onUpdate={setData}/>}
                {page === 'applications' && <StudentApplicationsPage data={data}/>}
                {page === 'my-work' && <StudentWorkPage data={data} navigate={navigate}/>}
                {page === 'stages' && <StudentStagesPage data={data} navigate={navigate}/>}
                {page === 'support' && <StudentSupportPage data={data} navigate={navigate}/>}
                {page === 'notifications' && (
                    <NotificationsPage items={notifications} loading={notificationsLoading}
                        loadError={notificationError}
                        onMarkRead={async id => setNotifications(await markNotificationRead('student', id))} />
                )}
            {page === 'settings' && <SupervisorSettings value={appearance} onChange={onAppearance}/>}
        </>}
    </div>
    </StudentLayout>;
}
