import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { TopicsCatalogPage } from './pages/TopicsCatalogPage';
import type { Topic } from './pages/TopicsCatalogPage';
import { MyWorkPage } from './pages/MyWorkPage';
import { SettingsPage } from './pages/SettingsPage';
import { SupervisorDashboardPage } from './pages/SupervisorDashboardPage';
import { SupervisorStudentsPage } from './pages/SupervisorStudentsPage';
import { SupervisorTopicsApplicationsPage } from './pages/SupervisorTopicsApplicationsPage';
import { ZavkaDashboardPage } from './pages/ZavkaDashboardPage';
import { ZavkaSupervisorsPage } from './pages/ZavkaSupervisorsPage';
import { ZavkaReportsPage } from './pages/ZavkaReportsPage';
import { TopicDetailPanel } from './components/TopicDetailPanel';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('login');
  const [userRole, setUserRole] = useState<'student' | 'nauchruk' | 'zavkaf' | 'admin'>('student');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [appliedTopics, setAppliedTopics] = useState<number[]>([]);
  const [userName, setUserName] = useState('Алексей Иванов');

  const handleLogin = (role: string) => {
    setUserRole(role as 'student' | 'nauchruk' | 'zavkaf' | 'admin');
    if (role === 'nauchruk') {
      setCurrentPage('supervisor-dashboard');
      setUserName('Андрей Морозов');
    } else if (role === 'zavkaf') {
      setCurrentPage('zavkaf-dashboard');
      setUserName('Елена Петрова');
    } else {
      setCurrentPage('catalog');
      setUserName('Алексей Иванов');
    }
  };

  const handleLogout = () => {
    setSelectedTopic(null);
    setAppliedTopics([]); // Очищаем поданные заявки при выходе
    setCurrentPage('login');
  };

  const handleApplyForTopic = (topicId: number) => {
    if (!appliedTopics.includes(topicId)) {
      setAppliedTopics((prev) => [...prev, topicId]);
      alert(`Заявка на тему #${topicId} успешно отправлена (демо).`);
    }
  };

  if (currentPage === 'login') {
    return <LoginPage onLoginSuccess={handleLogin} />;
  }

  return (
    <>
      <Layout
        userRole={userRole}
        userName={userName}
        activeTab={currentPage}
        onTabChange={(tab) => {
          setSelectedTopic(null); // Закрываем панель при переходе
          setCurrentPage(tab);
        }}
        onLogout={handleLogout}
        onOpenSettings={() => {
          setSelectedTopic(null);
          setCurrentPage('settings');
        }}
      >
        {userRole === 'student' && (
          <>
            {currentPage === 'catalog' && (
              <TopicsCatalogPage
                onSelectTopic={setSelectedTopic}
                appliedTopics={appliedTopics}
                onApply={handleApplyForTopic}
              />
            )}
            {currentPage === 'my-work' && <MyWorkPage />}
          </>
        )}

        {userRole === 'nauchruk' && (
          <>
            {currentPage === 'supervisor-dashboard' && <SupervisorDashboardPage />}
            {currentPage === 'students' && <SupervisorStudentsPage />}
            {currentPage === 'topics' && <SupervisorTopicsApplicationsPage />}
          </>
        )}

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

        {currentPage === 'settings' && (
          <SettingsPage 
            userRole={userRole} 
            userName={userName}
            onUpdateName={setUserName}
            onLogout={handleLogout} 
          />
        )}
      </Layout>

      {selectedTopic && (
        <TopicDetailPanel
          topic={selectedTopic}
          onClose={() => setSelectedTopic(null)}
          onApply={handleApplyForTopic}
          isApplied={appliedTopics.includes(selectedTopic.id)}
          hasAppliedAnywhere={appliedTopics.length > 0}
        />
      )}
    </>
  );
};

export default App;