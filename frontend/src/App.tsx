import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { TopicsCatalogPage } from './pages/TopicsCatalogPage';
import { TopicDetailPage } from './pages/TopicDetailPage';
import { MyWorkPage } from './pages/MyWorkPage';
import { SettingsPage } from './pages/SettingsPage';
import { SupervisorDashboardPage } from './pages/SupervisorDashboardPage';
import { SupervisorStudentsPage } from './pages/SupervisorStudentsPage';
import { SupervisorTopicsApplicationsPage } from './pages/SupervisorTopicsApplicationsPage';
import { ZavkaDashboardPage } from './pages/ZavkaDashboardPage';
import { ZavkaSupervisorsPage } from './pages/ZavkaSupervisorsPage';
import { ZavkaReportsPage } from './pages/ZavkaReportsPage';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('login');
  const [userRole, setUserRole] = useState<'student' | 'nauchruk' | 'zavkaf' | 'admin'>('student');
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);

  const handleLogin = (role: string) => {
    setUserRole(role as any);
    if (role === 'nauchruk') {
      setCurrentPage('supervisor-dashboard');
    } else if (role === 'zavkaf') {
      setCurrentPage('zavkaf-dashboard');
    } else {
      setCurrentPage('catalog');
    }
  };

  if (currentPage === 'login') {
    return <LoginPage onLoginSuccess={handleLogin} />;
  }

  return (
    <Layout
      userRole={userRole}
      activeTab={currentPage}
      onTabChange={(tab) => setCurrentPage(tab)}
      onLogout={() => setCurrentPage('login')}
      onOpenSettings={() => setCurrentPage('settings')}
    >
      {/* Роль: Студент */}
      {userRole === 'student' && (
        <>
          {currentPage === 'catalog' && (
            <TopicsCatalogPage
              onSelectTopic={(id) => {
                setSelectedTopicId(id);
                setCurrentPage('detail');
              }}
            />
          )}

          {currentPage === 'detail' && (
            <TopicDetailPage
              onBackToCatalog={() => setCurrentPage('catalog')}
              onSelectTopic={() => alert(`Заявка на тему #${selectedTopicId} отправлена!`)}
            />
          )}

          {currentPage === 'my-work' && <MyWorkPage />}
        </>
      )}

      {/* Роль: Научный руководитель */}
      {userRole === 'nauchruk' && (
        <>
          {currentPage === 'supervisor-dashboard' && <SupervisorDashboardPage />}
          {currentPage === 'students' && <SupervisorStudentsPage />}
          {currentPage === 'topics' && <SupervisorTopicsApplicationsPage />}
        </>
      )}

      {/* Роль: Заведующий кафедрой */}
      {userRole === 'zavkaf' && (
        <>
          {currentPage === 'zavkaf-dashboard' && (
            <ZavkaDashboardPage
              onDownloadReport={() => alert('Скачивание отчета кафедры...')}
              onUploadOrder={() => alert('Открытие модального окна загрузки приказа...')}
              onViewAttention={() => alert('Просмотр работ, требующих внимания...')}
              onViewAllSupervisors={() => setCurrentPage('zavkaf-supervisors')}
            />
          )}
          {currentPage === 'zavkaf-supervisors' && <ZavkaSupervisorsPage />}
          {currentPage === 'zavkaf-reports' && <ZavkaReportsPage />}
        </>
      )}

      {/* Общие экраны */}
      {currentPage === 'settings' && <SettingsPage onLogout={() => setCurrentPage('login')} />}
    </Layout>
  );
};

export default App;