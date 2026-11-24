import { readAppearance, saveAppearance } from '../shared/api/supervisorAppearance';
// src/app/App.tsx
import React, { useEffect, useState } from 'react';
import { LoginPage } from '../pages/login/LoginPage';
import { SupervisorStudentsPage } from '../pages/supervisor/SupervisorStudentsPage';
import { Layout } from '../widgets/Layout/Layout';
import { TopicsCatalogPage } from '../pages/catalog/TopicsCatalogPage';
import { MyWorkPage } from '../pages/my-work/MyWorkPage';
import { SupervisorDashboardPage } from '../pages/supervisor/SupervisorDashboardPage';
import { SupervisorTopicsPage } from '../pages/supervisor/SupervisorTopicsPage';
import { SupervisorReportsPage } from '../pages/supervisor/SupervisorReportsPage';
import { ZavkaDashboardPage } from '../pages/zavkaf/ZavkaDashboardPage';
import { ZavkaSupervisorsPage } from '../pages/zavkaf/ZavkaSupervisorsPage';
import { SettingsPage } from '../pages/settings/SettingsPage';

import { SupervisorSettings, SupervisorNotifications, SupervisorHelp } from '../pages/supervisor/SupervisorExtras';
import { fetchSupervisorNotifications } from '../shared/api/supervisorAccount';
import type { SupervisorNotification } from '../entities/user/supervisorAccount';
export const App: React.FC = () => {
  const [appearance, setAppearance] = useState(readAppearance);
  const [notificationError, setNotificationError] = useState('');
  const [notifications, setNotifications] = useState<SupervisorNotification[]>([]);
  const [topicId, setTopicId] = useState<number | null>(null);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [studentOrigin, setStudentOrigin] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<string>('login');
  const [userRole, setUserRole] = useState<'student' | 'nauchruk' | 'zavkaf'>('student');
  const [appliedTopicId, setAppliedTopicId] = useState<number | null>(null);

  useEffect(() => { if (userRole !== 'nauchruk') return; let active = true; setNotificationError(''); fetchSupervisorNotifications().then(v => { if (active) setNotifications(v) }).catch(() => { if (active) setNotificationError('Не удалось загрузить уведомления') }); return () => { active = false } }, [userRole]);
  useEffect(() => { saveAppearance(appearance); }, [appearance]);
  const handleLogin = (role: 'student' | 'nauchruk' | 'zavkaf') => {
    setUserRole(role);
    setCurrentPage(role === 'student' ? 'catalog' : 'dashboard');
  };

  const openStudent = (id: number) => {
    setStudentOrigin(currentPage);
    setStudentId(id);
    setCurrentPage('students');
  };

  const selectStudent = (id: number | null) => {
    if (id !== null) { openStudent(id); return; }
    setStudentId(null);
    setCurrentPage(studentOrigin ?? 'students');
    setStudentOrigin(null);
  };

  const handleApply = (topicId: number) => {
    setAppliedTopicId(topicId);
    alert(`Заявка на тему #${topicId} отправлена (демо).`);
  };

  const handleLogout = () => {
    setUserRole('student');
    setNotifications([]);
    setNotificationError('');
    setCurrentPage('login');
    setAppliedTopicId(null);
    setStudentId(null);
    setStudentOrigin(null);
    setTopicId(null);
  };

  if (currentPage === 'login') {
    return <LoginPage onLoginSuccess={handleLogin} />;
  }

  return (
    <Layout
      appearance={appearance}
      unreadCount={notifications.filter(n => !n.is_read).length}
      userRole={userRole}
      activeTab={currentPage}
      onTabChange={page => { setStudentId(null); setStudentOrigin(null); setTopicId(null); setCurrentPage(page); }}
      userName={userRole === 'zavkaf' ? 'Елена Петрова' : userRole === 'nauchruk' ? '' : 'Алексей Иванов'}
      onLogout={handleLogout}
    >
      {/* Студент */}
      {userRole === 'student' && currentPage === 'catalog' && (
        <TopicsCatalogPage appliedTopicId={appliedTopicId} onApply={handleApply} />
      )}
      {userRole === 'student' && currentPage === 'my-work' && <MyWorkPage />}

      {/* Keep the origin mounted during a student visit to retain local state. */}
      {userRole === 'nauchruk' && <>
        {(['dashboard', 'applications', 'students', 'reports', 'notifications', 'help', 'settings'] as const).map(page => {
          const visible = currentPage === page && (page !== 'students' || studentId === null);
          const retained = studentId !== null && studentOrigin === page;
          if (!visible && !retained) return null;
          return <div key={page} hidden={!visible}>
            {page === 'dashboard' && <SupervisorDashboardPage onOpenStudent={openStudent} refreshKey={studentId === null} />}
            {page === 'applications' && <SupervisorTopicsPage initialTopicId={topicId} onOpenStudent={openStudent} refreshKey={studentId === null} />}
            {page === 'students' && <SupervisorStudentsPage studentId={null} onSelect={selectStudent} refreshKey={studentId === null} />}
            {page === 'reports' && <SupervisorReportsPage onOpenStudent={openStudent} refreshKey={studentId === null} />}
            {page === 'notifications' && <SupervisorNotifications items={notifications} onChange={setNotifications} onOpenStudent={openStudent} loadError={notificationError} />}
            {page === 'help' && <SupervisorHelp onOpenTopic={id => { setTopicId(id); setCurrentPage('applications') }} onNavigate={setCurrentPage} onOpenStudent={openStudent} />}
            {page === 'settings' && <SupervisorSettings value={appearance} onChange={setAppearance} />}
          </div>;
        })}
        {studentId !== null && <SupervisorStudentsPage studentId={studentId} onSelect={selectStudent} />}
      </>}
      {/* Завкаф */}
      {userRole === 'zavkaf' && currentPage === 'dashboard' && <ZavkaDashboardPage />}
      {userRole === 'zavkaf' && currentPage === 'supervisors' && <ZavkaSupervisorsPage />}
      {userRole === 'zavkaf' && currentPage === 'reports' && (
        <div>Отчеты (в разработке)</div>
      )}

      {/* Общие */}
      {userRole !== 'nauchruk' && currentPage === 'settings' && (
        <SettingsPage onLogout={handleLogout} userRole={userRole} />
      )}
    </Layout>
  );
};