import { useEffect, useState } from 'react';
import { clearSession, getMe } from '../shared/api/auth';
import type { UserProfile } from '../shared/api/auth';
import { readAppearance, saveAppearance } from '../shared/api/supervisorAppearance';
import { fetchSupervisorNotifications } from '../shared/api/supervisorAccount';
import type { SupervisorNotification } from '../entities/user/supervisorAccount';
import { LoginPage } from '../pages/login/LoginPage';
import { TopicsCatalogPage } from '../pages/catalog/TopicsCatalogPage';
import { MyWorkPage } from '../pages/my-work/MyWorkPage';
import { SupervisorDashboardPage } from '../pages/supervisor/SupervisorDashboardPage';
import { SupervisorStudentsPage } from '../pages/supervisor/SupervisorStudentsPage';
import { SupervisorTopicsPage } from '../pages/supervisor/SupervisorTopicsPage';
import { SupervisorReportsPage } from '../pages/supervisor/SupervisorReportsPage';
import {
  SupervisorHelp,
  SupervisorNotifications,
  SupervisorSettings,
} from '../pages/supervisor/SupervisorExtras';
import { ZavkaDashboardPage } from '../pages/zavkaf/ZavkaDashboardPage';
import { ZavkaSupervisorsPage } from '../pages/zavkaf/ZavkaSupervisorsPage';
import { SettingsPage } from '../pages/settings/SettingsPage';
import { applyForTopic } from '../shared/api/topics';
import { Layout } from '../widgets/Layout/Layout';

export const App = () => {
  const [appearance, setAppearance] = useState(readAppearance);
  const [notificationError, setNotificationError] = useState('');
  const [notifications, setNotifications] = useState<SupervisorNotification[]>([]);
  const [topicId, setTopicId] = useState<number | null>(null);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [studentOrigin, setStudentOrigin] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState('login');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(
    () => Boolean(localStorage.getItem('access_token')),
  );
  const [appliedTopicId, setAppliedTopicId] = useState<number | null>(null);
  const userRole = profile?.role;

  useEffect(() => {
    if (!localStorage.getItem('access_token')) return;

    getMe()
      .then((currentProfile) => {
        setProfile(currentProfile);
        setCurrentPage(
          currentProfile.role === 'student'
            ? 'catalog'
            : currentProfile.role === 'admin'
              ? 'settings'
              : 'dashboard',
        );
      })
      .catch(() => clearSession())
      .finally(() => setIsBootstrapping(false));
  }, []);

  useEffect(() => {
    if (userRole !== 'nauchruk') return;

    let active = true;
    fetchSupervisorNotifications()
      .then((items) => {
        if (active) {
          setNotifications(items);
          setNotificationError('');
        }
      })
      .catch(() => {
        if (active) setNotificationError('Не удалось загрузить уведомления');
      });

    return () => {
      active = false;
    };
  }, [userRole]);

  useEffect(() => {
    saveAppearance(appearance);
  }, [appearance]);

  const handleLogin = (currentProfile: UserProfile) => {
    setProfile(currentProfile);
    setCurrentPage(
      currentProfile.role === 'student'
        ? 'catalog'
        : currentProfile.role === 'admin'
          ? 'settings'
          : 'dashboard',
    );
  };

  const openStudent = (id: number) => {
    setStudentOrigin(currentPage);
    setStudentId(id);
    setCurrentPage('students');
  };

  const selectStudent = (id: number | null) => {
    if (id !== null) {
      openStudent(id);
      return;
    }

    setStudentId(null);
    setCurrentPage(studentOrigin ?? 'students');
    setStudentOrigin(null);
  };

  const handleApply = async (id: number) => {
    try {
      await applyForTopic(id);
      setAppliedTopicId(id);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Не удалось подать заявку');
    }
  };

  const handleLogout = () => {
    clearSession();
    setProfile(null);
    setNotifications([]);
    setNotificationError('');
    setCurrentPage('login');
    setAppliedTopicId(null);
    setStudentId(null);
    setStudentOrigin(null);
    setTopicId(null);
  };

  if (isBootstrapping) return <div className="loading-screen">Загрузка...</div>;
  if (currentPage === 'login' || !profile) {
    return <LoginPage onLoginSuccess={handleLogin} />;
  }

  const userName = [profile.last_name, profile.first_name].filter(Boolean).join(' ');

  return (
    <Layout
      appearance={appearance}
      unreadCount={notifications.filter((item) => !item.is_read).length}
      userRole={profile.role}
      activeTab={currentPage}
      onTabChange={(page) => {
        setStudentId(null);
        setStudentOrigin(null);
        setTopicId(null);
        setCurrentPage(page);
      }}
      userName={userName}
      onLogout={handleLogout}
    >
      {userRole === 'student' && currentPage === 'catalog' && (
        <TopicsCatalogPage appliedTopicId={appliedTopicId} onApply={handleApply} />
      )}
      {userRole === 'student' && currentPage === 'my-work' && <MyWorkPage />}

      {userRole === 'nauchruk' && (
        <>
          {(['dashboard', 'applications', 'students', 'reports', 'notifications', 'help', 'settings'] as const).map((page) => {
            const visible = currentPage === page && (page !== 'students' || studentId === null);
            const retained = studentId !== null && studentOrigin === page;
            if (!visible && !retained) return null;

            return (
              <div key={page} hidden={!visible}>
                {page === 'dashboard' && (
                  <SupervisorDashboardPage
                    onOpenStudent={openStudent}
                    refreshKey={studentId === null}
                  />
                )}
                {page === 'applications' && (
                  <SupervisorTopicsPage
                    initialTopicId={topicId}
                    onOpenStudent={openStudent}
                    refreshKey={studentId === null}
                  />
                )}
                {page === 'students' && (
                  <SupervisorStudentsPage
                    studentId={null}
                    onSelect={selectStudent}
                    refreshKey={studentId === null}
                  />
                )}
                {page === 'reports' && (
                  <SupervisorReportsPage
                    onOpenStudent={openStudent}
                    refreshKey={studentId === null}
                  />
                )}
                {page === 'notifications' && (
                  <SupervisorNotifications
                    items={notifications}
                    onChange={setNotifications}
                    onOpenStudent={openStudent}
                    loadError={notificationError}
                  />
                )}
                {page === 'help' && (
                  <SupervisorHelp
                    onOpenTopic={(id) => {
                      setTopicId(id);
                      setCurrentPage('applications');
                    }}
                    onNavigate={setCurrentPage}
                    onOpenStudent={openStudent}
                  />
                )}
                {page === 'settings' && (
                  <SupervisorSettings value={appearance} onChange={setAppearance} />
                )}
              </div>
            );
          })}
          {studentId !== null && (
            <SupervisorStudentsPage studentId={studentId} onSelect={selectStudent} />
          )}
        </>
      )}

      {userRole === 'zavkaf' && currentPage === 'dashboard' && <ZavkaDashboardPage />}
      {userRole === 'zavkaf' && currentPage === 'supervisors' && <ZavkaSupervisorsPage />}
      {userRole === 'zavkaf' && currentPage === 'reports' && (
        <div>Отчёты (в разработке)</div>
      )}

      {userRole !== 'nauchruk' && currentPage === 'settings' && (
        <SettingsPage onLogout={handleLogout} />
      )}
    </Layout>
  );
};
