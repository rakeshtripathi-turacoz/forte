import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/layout/Header';
import TopBar from './components/layout/TopBar';
import WebNavigation from './components/layout/WebNavigation';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/common/ScrollToTop';

import StandardHomePage from './pages/StandardHomePage';
import HomePage from './pages/HomePage';
import AcademicsPage from './pages/AcademicsPage';
import AdmissionPage from './pages/AdmissionPage';
import PlacementsPage from './pages/PlacementsPage';
import ResearchPage from './pages/ResearchPage';
import InfrastructurePage from './pages/InfrastructurePage';
import ChairmanMessagePage from './pages/ChairmanMessagePage';
import SecretaryMessagePage from './pages/SecretaryMessagePage';
import JointSecretaryMessagePage from './pages/JointSecretaryMessagePage';
import DirectorMessagePage from './pages/DirectorMessagePage';
import VisionMissionPage from './pages/VisionMissionPage';
import ContactUsPage from './pages/ContactUsPage';
import ManagementPage from './pages/ManagementPage';
import AdministrationPage from './pages/AdministrationPage';
import LifeAtFITPage from './pages/LifeAtFITPage';
import AchievementsPage from './pages/AchievementsPage';
import CareersPage from './pages/CareersPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import AntiRaggingPage from './pages/AntiRaggingPage';
import MandatoryDisclosuresPage from './pages/MandatoryDisclosuresPage';
import OrganizationalChartPage from './pages/OrganizationalChartPage';
import GalleryPage from './pages/GalleryPage';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './pages/admin/DashboardLayout';

// Component to handle route-based tab highlighting
const AppContent = () => {
  const location = useLocation();
  const viewMode = 'brand'; // Default to brand OS view

  // Map routes to tab IDs
  const getActiveTabFromRoute = (pathname) => {
    const routeMap = {
      '/': 'home',
      '/about': 'about',
      '/academics': 'academics',
      '/admission': 'admission',
      '/placements': 'placements',
      '/research': 'research',
      '/events': 'events',
      '/infrastructure': 'infrastructure',
      '/about/chairman-message': 'about',
      '/about/secretary-message': 'about',
      '/about/joint-secretary-message': 'about',
      '/about/director-message': 'about',
      '/about/director': 'about',
      '/about/vision-mission': 'about',
      '/about/management': 'about',
      '/about/administration': 'about',
      '/about/anti-ragging': 'about',
      '/about/mandatory-disclosures': 'about',
      '/about/organizational-chart': 'about',
      '/admissions': 'admissions',
      '/life': 'life',
      '/achievements': 'achievements',
      '/careers': 'careers',
      '/gallery': 'gallery',
      '/contact': 'contact',
      '/announcements': 'home',
      '/login': 'login',
      '/dashboard': 'dashboard'
    };
    return routeMap[pathname] || 'home';
  };

  const activeTab = getActiveTabFromRoute(location.pathname);

  // Check if current route should hide header/footer
  const isAuthPage = location.pathname === '/login' || location.pathname.startsWith('/dashboard');

  // Debug log
  console.log('Current pathname:', location.pathname);
  console.log('Is auth page:', isAuthPage);

  const renderBrandOSView = () => (
    <div className="h-screen flex flex-col">
      {!isAuthPage && <Header activeTab={activeTab} />}
      <main className="flex-1 overflow-y-auto relative bg-surface">
        <div className="min-h-full flex flex-col">
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<StandardHomePage />} />
              <Route path="/about" element={<HomePage />} />
              <Route path="/academics" element={<AcademicsPage />} />
              <Route path="/admission" element={<AdmissionPage />} />
              <Route path="/placements" element={<PlacementsPage />} />
              <Route path="/research" element={<ResearchPage />} />
              <Route path="/infrastructure" element={<InfrastructurePage />} />
              <Route path="/about/chairman-message" element={<ChairmanMessagePage />} />
              <Route path="/about/secretary-message" element={<SecretaryMessagePage />} />
              <Route path="/about/joint-secretary-message" element={<JointSecretaryMessagePage />} />
              <Route path="/about/director-message" element={<DirectorMessagePage />} />
              <Route path="/about/director" element={<DirectorMessagePage />} />
              <Route path="/about/vision-mission" element={<VisionMissionPage />} />
              <Route path="/about/management" element={<ManagementPage />} />
              <Route path="/about/administration" element={<AdministrationPage />} />
              <Route path="/about/anti-ragging" element={<AntiRaggingPage />} />
              <Route path="/about/mandatory-disclosures" element={<MandatoryDisclosuresPage />} />
              <Route path="/about/organizational-chart" element={<OrganizationalChartPage />} />
              <Route path="/admissions" element={<AdmissionPage />} />
              <Route path="/life" element={<LifeAtFITPage />} />
              <Route path="/achievements" element={<AchievementsPage />} />
              <Route path="/careers" element={<CareersPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/contact" element={<ContactUsPage />} />
              <Route path="/announcements" element={<AnnouncementsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard/*" element={<DashboardLayout />} />
            </Routes>
          </div>
          {!isAuthPage && <Footer />}
        </div>
      </main>
    </div>
  );

  const renderWebsiteView = () => (
    <div className="min-h-screen bg-white">
      {!isAuthPage && <TopBar />}
      {!isAuthPage && <WebNavigation />}

      {/* Page Content */}
      <Routes>
        <Route path="/" element={<StandardHomePage />} />
        <Route path="/about" element={<HomePage />} />
        <Route path="/academics" element={<AcademicsPage />} />
        <Route path="/admission" element={<AdmissionPage />} />
        <Route path="/placements" element={<PlacementsPage />} />
        <Route path="/research" element={<ResearchPage />} />
        <Route path="/infrastructure" element={<InfrastructurePage />} />
        <Route path="/about/chairman-message" element={<ChairmanMessagePage />} />
        <Route path="/about/secretary-message" element={<SecretaryMessagePage />} />
        <Route path="/about/joint-secretary-message" element={<JointSecretaryMessagePage />} />
        <Route path="/about/director-message" element={<DirectorMessagePage />} />
        <Route path="/about/director" element={<DirectorMessagePage />} />
        <Route path="/about/vision-mission" element={<VisionMissionPage />} />
        <Route path="/about/management" element={<ManagementPage />} />
        <Route path="/about/administration" element={<AdministrationPage />} />
        <Route path="/about/anti-ragging" element={<AntiRaggingPage />} />
        <Route path="/about/mandatory-disclosures" element={<MandatoryDisclosuresPage />} />
        <Route path="/about/organizational-chart" element={<OrganizationalChartPage />} />
        <Route path="/admissions" element={<AdmissionPage />} />
        <Route path="/life" element={<LifeAtFITPage />} />
        <Route path="/achievements" element={<AchievementsPage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/contact" element={<ContactUsPage />} />
        <Route path="/announcements" element={<AnnouncementsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard/*" element={<DashboardLayout />} />
      </Routes>

      {!isAuthPage && <Footer />}

      {/* AI Assistant FAB */}
      {!isAuthPage && <div className="fixed bottom-8 right-8 z-50">
        <button className="bg-slate text-white p-4 rounded-full shadow-float hover:bg-crimson transition transform hover:scale-110 flex items-center gap-2 group">
          <i className="fas fa-robot text-xl"></i>
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap text-sm font-bold">Ask Forte AI</span>
        </button>
      </div>}
    </div>
  );

  return (
    <>
      <ScrollToTop />
      <div className="App font-sans">
        {viewMode === 'brand' ? renderBrandOSView() : renderWebsiteView()}
      </div>
    </>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
