import React, { useState, useMemo, useEffect } from 'react';
import resourcesDataRaw from './data/resources.json';
import { CATEGORIES } from './data/categories';
import { Resource, ResourceCategory, UserFeedback } from './types/resource';
import { EmergencyBanner } from './components/EmergencyBanner';
import { Header } from './components/Header';
import { LandingHero } from './components/LandingHero';
import { CategoryGrid } from './components/CategoryGrid';
import { SidebarNav } from './components/SidebarNav';
import { ResourceCard } from './components/ResourceCard';
import { FeedbackModal } from './components/FeedbackModal';
import { SuggestModal } from './components/SuggestModal';
import { SubmissionsDrawer } from './components/SubmissionsDrawer';
import { PrintSelectionModal } from './components/PrintSelectionModal';
import { PrintDirectoryView } from './components/PrintDirectoryView';
import { CommunityCalendar } from './components/CommunityCalendar';
import { EventModal } from './components/EventModal';
import { EventFlyerModal } from './components/EventFlyerModal';
import { CommunityEvent } from './types/event';
import { INITIAL_EVENTS } from './data/initialEvents';
import { SearchX, Shield, RefreshCw, ChevronLeft, Printer } from 'lucide-react';

const STORAGE_KEY = 'chillicothe_community_submissions_v1';
const EVENTS_STORAGE_KEY = 'chillicothe_community_events_v1';

export const App: React.FC = () => {
  const allResources: Resource[] = resourcesDataRaw as Resource[];
  const allCategoryIds = useMemo(
    () => CATEGORIES.filter(c => c.id !== 'all').map(c => c.id as ResourceCategory),
    []
  );

  // Navigation View State
  const [currentView, setCurrentView] = useState<'landing' | 'directory'>('landing');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<ResourceCategory | 'all'>('all');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  
  // Modals & Drawers
  const [reportingResource, setReportingResource] = useState<Resource | null>(null);
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState<boolean>(false);
  const [isSubmissionsOpen, setIsSubmissionsOpen] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Community Events State & Modals
  const [events, setEvents] = useState<CommunityEvent[]>(() => {
    try {
      const saved = localStorage.getItem(EVENTS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_EVENTS;
    } catch {
      return INITIAL_EVENTS;
    }
  });
  const [isEventModalOpen, setIsEventModalOpen] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<CommunityEvent | null>(null);
  const [eventModalMode, setEventModalMode] = useState<'create' | 'edit' | 'copy'>('create');
  const [flyerModal, setFlyerModal] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
    } catch (e) {
      console.error('Failed to save events to localStorage', e);
    }
  }, [events]);

  const handleSaveEvent = (savedEvent: CommunityEvent) => {
    setEvents(prev => {
      const exists = prev.some(e => e.id === savedEvent.id);
      if (exists) {
        return prev.map(e => (e.id === savedEvent.id ? savedEvent : e));
      } else {
        return [savedEvent, ...prev];
      }
    });
    setEditingEvent(null);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const handleOpenAddEvent = () => {
    setEditingEvent(null);
    setEventModalMode('create');
    setIsEventModalOpen(true);
  };

  const handleOpenEditEvent = (event: CommunityEvent) => {
    setEditingEvent(event);
    setEventModalMode('edit');
    setIsEventModalOpen(true);
  };

  const handleOpenCopyEvent = (event: CommunityEvent) => {
    setEditingEvent(event);
    setEventModalMode('copy');
    setIsEventModalOpen(true);
  };

  const handleViewFlyer = (url: string, title: string) => {
    setFlyerModal({ url, title });
  };

  // Print Configuration State
  const [selectedPrintCategories, setSelectedPrintCategories] = useState<ResourceCategory[]>(allCategoryIds);
  const [printIncludeCrisis, setPrintIncludeCrisis] = useState<boolean>(true);

  // Submissions State (stored locally)
  const [submissions, setSubmissions] = useState<UserFeedback[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [submissions]);

  const handleAddSubmission = (item: UserFeedback) => {
    setSubmissions(prev => [item, ...prev]);
  };

  const handleClearSubmissions = () => {
    if (window.confirm('Are you sure you want to clear all recorded submissions?')) {
      setSubmissions([]);
    }
  };

  const handleDeleteSubmission = (index: number) => {
    setSubmissions(prev => prev.filter((_, i) => i !== index));
  };

  // Switch to directory with chosen category
  const handleSelectCategoryFromLanding = (category: ResourceCategory) => {
    setActiveCategory(category);
    setCurrentView('directory');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Switch to directory on search typing
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim() && currentView === 'landing') {
      setCurrentView('directory');
    }
  };

  const handleGoToLanding = () => {
    setCurrentView('landing');
    setSearchQuery('');
    setActiveCategory('all');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToDirectory = () => {
    setCurrentView('directory');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle printing a single category from the directory view
  const handlePrintSingleCategory = (category: ResourceCategory | 'all') => {
    if (category === 'all') {
      setSelectedPrintCategories(allCategoryIds);
    } else {
      setSelectedPrintCategories([category]);
    }
    setPrintIncludeCrisis(true);
    setTimeout(() => {
      window.print();
    }, 60);
  };

  // Handle printing custom selected categories from the print modal
  const handleConfirmPrintCustom = (categories: ResourceCategory[], includeCrisis: boolean) => {
    setSelectedPrintCategories(categories);
    setPrintIncludeCrisis(includeCrisis);
    setIsPrintModalOpen(false);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Category counts based on unfiltered dataset
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allResources.length };
    CATEGORIES.forEach(c => {
      if (c.id !== 'all') counts[c.id] = 0;
    });

    allResources.forEach(res => {
      if (res.category === 'nonprofits' || (res.tags && res.tags.includes('nonprofit'))) {
        counts['nonprofits']++;
      }
      if (res.category !== 'nonprofits' && counts[res.category] !== undefined) {
        counts[res.category]++;
      }
    });
    return counts;
  }, [allResources]);

  // Filtered resources based on category and search
  const filteredResources = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return allResources.filter(res => {
      // Category filter
      if (activeCategory !== 'all') {
        if (activeCategory === 'nonprofits') {
          const isNonprofit = res.category === 'nonprofits' || (res.tags && res.tags.includes('nonprofit'));
          if (!isNonprofit) return false;
        } else if (res.category !== activeCategory) {
          return false;
        }
      }

      // Search filter
      if (!query) return true;

      const inName = res.name.toLowerCase().includes(query);
      const inAddress = res.address ? res.address.toLowerCase().includes(query) : false;
      const inPhone = res.phone ? res.phone.replace(/[^0-9]/g, '').includes(query.replace(/[^0-9]/g, '')) || res.phone.toLowerCase().includes(query) : false;
      const inCategory = res.categoryLabel.toLowerCase().includes(query) || (res.subcategory ? res.subcategory.toLowerCase().includes(query) : false);
      const inDesc = res.description ? res.description.toLowerCase().includes(query) : false;
      const inNotes = res.notes ? res.notes.toLowerCase().includes(query) : false;
      const inBullets = res.bulletPoints ? res.bulletPoints.some(b => b.toLowerCase().includes(query)) : false;
      const inTags = res.tags ? res.tags.some(t => t.toLowerCase().includes(query)) : false;

      return inName || inAddress || inPhone || inCategory || inDesc || inNotes || inBullets || inTags;
    });
  }, [allResources, activeCategory, searchQuery]);

  const activeCategoryMeta = useMemo(() => {
    return CATEGORIES.find(c => c.id === activeCategory) || CATEGORIES[0];
  }, [activeCategory]);

  return (
    <>
      {/* SCREEN UI - COMPLETELY HIDDEN WHEN PRINTING */}
      <div className="no-print min-h-screen flex flex-col bg-slate-50 font-sans">
        {/* 24/7 Pinned Crisis Banner */}
        <EmergencyBanner />

      {/* Main Header */}
      <Header
        currentView={currentView}
        onGoToLanding={handleGoToLanding}
        onGoToDirectory={handleGoToDirectory}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        totalCount={allResources.length}
        filteredCount={filteredResources.length}
        onOpenSuggestModal={() => setIsSuggestModalOpen(true)}
        onOpenPrintModal={() => setIsPrintModalOpen(true)}
        onOpenAddEvent={handleOpenAddEvent}
        onOpenSubmissions={() => setIsSubmissionsOpen(true)}
        submissionsCount={submissions.length}
      />

      {/* VIEW 1: MAIN LANDING PAGE */}
      {currentView === 'landing' ? (
        <main className="flex-1">
          {/* Hero Section with Historic Downtown Chillicothe Image */}
          <LandingHero
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onSelectCategory={handleSelectCategoryFromLanding}
            totalResourcesCount={allResources.length}
            onOpenPrintModal={() => setIsPrintModalOpen(true)}
          />

          {/* Large Interactive Buttons Grid for Categories */}
          <CategoryGrid
            onSelectCategory={handleSelectCategoryFromLanding}
            categoryCounts={categoryCounts}
            onOpenPrintModal={() => setIsPrintModalOpen(true)}
          />

          {/* Community Events & Announcements Calendar (Below category buttons) */}
          <CommunityCalendar
            events={events}
            onAddEvent={handleOpenAddEvent}
            onEditEvent={handleOpenEditEvent}
            onCopyEvent={handleOpenCopyEvent}
            onDeleteEvent={handleDeleteEvent}
            onViewFlyer={handleViewFlyer}
          />
        </main>
      ) : (
        /* VIEW 2: DIRECTORY LISTINGS WITH PERSISTENT SIDEBAR */
        <div className="flex-1 max-w-7xl w-full mx-auto px-0 sm:px-6 lg:px-8 py-0 sm:py-6 flex flex-col lg:flex-row gap-6">
          
          {/* Left Persistent Category Sidebar */}
          <SidebarNav
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            onBackToHome={handleGoToLanding}
            categoryCounts={categoryCounts}
            onOpenSuggestModal={() => setIsSuggestModalOpen(true)}
            onOpenPrintModal={() => setIsPrintModalOpen(true)}
            isMobileOpen={isMobileSidebarOpen}
            setIsMobileOpen={setIsMobileSidebarOpen}
          />

          {/* Right Main Content Listings Area */}
          <main className="flex-1 px-4 sm:px-0">
            
            {/* Category Breadcrumb & Banner */}
            <div className="mb-5 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 no-print">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <button 
                    onClick={handleGoToLanding}
                    className="hover:text-emerald-700 font-semibold inline-flex items-center gap-0.5"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Home</span>
                  </button>
                  <span>/</span>
                  <span className="font-semibold text-slate-700">{activeCategoryMeta.label}</span>
                </div>

                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <span>{activeCategoryMeta.label}</span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {filteredResources.length} {filteredResources.length === 1 ? 'Resource' : 'Resources'}
                  </span>
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  {activeCategoryMeta.description}
                </p>
              </div>

              {/* Action Buttons Right Side */}
              <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                <button
                  type="button"
                  onClick={() => handlePrintSingleCategory(activeCategory)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 rounded-xl border border-slate-300 transition-colors shadow-xs cursor-pointer"
                  title={`Print ${activeCategoryMeta.label} handout`}
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span>Print {activeCategory === 'all' ? 'Directory' : 'This Category'}</span>
                </button>

                {(activeCategory !== 'all' || searchQuery) && (
                  <button
                    onClick={() => {
                      setActiveCategory('all');
                      setSearchQuery('');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Show All Categories</span>
                  </button>
                )}
              </div>
            </div>

            {/* Resources Cards Grid */}
            {filteredResources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredResources.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onReportInaccuracy={setReportingResource}
                  />
                ))}
              </div>
            ) : (
              /* Empty Search State */
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto my-12 shadow-sm">
                <SearchX className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900">No resources matched your search</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  We couldn&apos;t find any service matching &ldquo;{searchQuery}&rdquo; in this category.
                </p>
                <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategory('all');
                    }}
                    className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Clear All Filters
                  </button>
                  <button
                    onClick={() => setIsSuggestModalOpen(true)}
                    className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
                  >
                    Suggest this Missing Resource
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 sm:px-6 lg:px-8 mt-12 no-print">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-slate-900 rounded-xl flex-shrink-0 border border-slate-700/60">
              <img 
                src="./images/life-recovery-society-logo.png" 
                alt="Life Recovery Society" 
                className="h-12 sm:h-14 w-auto object-contain flex-shrink-0"
              />
            </div>
            <div>
              <span className="font-extrabold text-slate-800 text-xs block">
                Chillicothe Community Resources &bull; Presented by Life Recovery Society
              </span>
              <span className="text-[11px] text-slate-500 block">
                Free public directory serving Chillicothe &amp; Ross County, Ohio
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            <button
              onClick={handleGoToLanding}
              className="hover:text-emerald-700 transition-colors font-medium"
            >
              Main Page
            </button>
            <span>&bull;</span>
            <button
              onClick={() => setIsSuggestModalOpen(true)}
              className="hover:text-emerald-700 transition-colors font-medium"
            >
              Suggest a Resource
            </button>
            <span>&bull;</span>
            <a
              href="https://sites.google.com/view/chillicothe-community-resource/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-700 transition-colors font-medium"
            >
              Original Google Site
            </a>
            <span>&bull;</span>
            <span>Always call agencies to confirm hours before traveling</span>
          </div>
        </div>
      </footer>

      {/* Feedback / Report Error Modal */}
      <FeedbackModal
        resource={reportingResource}
        isOpen={reportingResource !== null}
        onClose={() => setReportingResource(null)}
        onSubmitFeedback={handleAddSubmission}
      />

      {/* Suggest New Service Modal */}
      <SuggestModal
        isOpen={isSuggestModalOpen}
        onClose={() => setIsSuggestModalOpen(false)}
        onSubmitSuggestion={handleAddSubmission}
      />

      {/* Community Submissions Drawer (Admin / Review) */}
      <SubmissionsDrawer
        isOpen={isSubmissionsOpen}
        onClose={() => setIsSubmissionsOpen(false)}
        submissions={submissions}
        onClearSubmissions={handleClearSubmissions}
        onDeleteSubmission={handleDeleteSubmission}
      />

        {/* Print Selection Modal (Custom Handout Builder) */}
        <PrintSelectionModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          categoryCounts={categoryCounts}
          onConfirmPrint={handleConfirmPrintCustom}
        />

        {/* Administrator Community Event / Announcement Modal */}
        <EventModal
          isOpen={isEventModalOpen}
          mode={eventModalMode}
          onClose={() => {
            setIsEventModalOpen(false);
            setEditingEvent(null);
          }}
          onSaveEvent={handleSaveEvent}
          editingEvent={editingEvent}
        />

        {/* Click-to-Enlarge Event JPG Flyer Modal */}
        <EventFlyerModal
          isOpen={flyerModal !== null}
          onClose={() => setFlyerModal(null)}
          imageUrl={flyerModal?.url || ''}
          title={flyerModal?.title || ''}
        />
      </div>

      {/* Dedicated Print Layout (Rendered only on media print) */}
      <PrintDirectoryView
        allResources={allResources}
        selectedCategoryIds={selectedPrintCategories}
        includeCrisisBanner={printIncludeCrisis}
      />
    </>
  );
};
