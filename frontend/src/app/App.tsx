// src/app/App.tsx
import React, { useState } from 'react';
import { LoginPage } from '../pages/login/LoginPage';
import { Layout } from '../widgets/Layout/Layout';
import { TopicsCatalogPage } from '../pages/catalog/TopicsCatalogPage';
import { MyWorkPage } from '../pages/my-work/MyWorkPage';
import { SupervisorDashboardPage } from '../pages/supervisor/SupervisorDashboardPage';
import { SupervisorTopicsApplicationsPage } from '../pages/supervisor/SupervisorTopicsApplicationsPage';
import { ZavkaDashboardPage } from '../pages/zavkaf/ZavkaDashboardPage';
import { ZavkaSupervisorsPage } from '../pages/zavkaf/ZavkaSupervisorsPage';
import { SettingsPage } from '../pages/settings/SettingsPage';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('login');
  const [userRole, setUserRole] = useState<'student' | 'nauchruk' | 'zavkaf'>('student');
  const [appliedTopicId, setAppliedTopicId] = useState<number | null>(null);

  const handleLogin = (role: 'student' | 'nauchruk' | 'zavkaf') => {
    setUserRole(role);
    setCurrentPage(role === 'student' ? 'catalog' : 'dashboard');
  };

  const handleApply = (topicId: number) => {
    setAppliedTopicId(topicId);
    alert(`Заявка на тему #${topicId} отправлена (демо).`);
  };

  const handleLogout = () => {
    setUserRole('student');
    setCurrentPage('login');
    setAppliedTopicId(null);
  };

  if (currentPage === 'login') {
    return <LoginPage onLoginSuccess={handleLogin} />;
  }

  return (
    <Layout
      userRole={userRole}
      activeTab={currentPage}
      onTabChange={setCurrentPage}
      userName={userRole === 'zavkaf' ? 'Елена Петрова' : userRole === 'nauchruk' ? 'Андрей Морозов' : 'Алексей Иванов'}
      onLogout={handleLogout}
    >
      {/* Студент */}
      {userRole === 'student' && currentPage === 'catalog' && (
        <TopicsCatalogPage appliedTopicId={appliedTopicId} onApply={handleApply} />
      )}
      {userRole === 'student' && currentPage === 'my-work' && <MyWorkPage />}

      {/* Научрук */}
      {userRole === 'nauchruk' && currentPage === 'dashboard' && <SupervisorDashboardPage />}
      {userRole === 'nauchruk' && currentPage === 'applications' && <SupervisorTopicsApplicationsPage />}

      {/* Завкаф */}
      {userRole === 'zavkaf' && currentPage === 'dashboard' && <ZavkaDashboardPage />}
      {userRole === 'zavkaf' && currentPage === 'supervisors' && <ZavkaSupervisorsPage />}
      {userRole === 'zavkaf' && currentPage === 'reports' && (
        <div>Отчеты (в разработке)</div>
      )}

      {/* Общие */}
      {currentPage === 'settings' && (
        <SettingsPage onLogout={handleLogout} userRole={userRole} />
      )}
    </Layout>
  );
};