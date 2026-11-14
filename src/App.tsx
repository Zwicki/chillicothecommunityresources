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
import { parseRouteFromPath, getPathForCategory } from './utils/categoryRoutes';
import { AuthUser, SUPER_USER_EMAIL, isSuperUserEmail } from './types/auth';
import { LoginModal } from './components/LoginModal';
import { ResourceModal } from './components/ResourceModal';
import { SupportMeetingsView } from './components/SupportMeetingsView';
import { EMBEDDED_RECOVERY_MEETINGS } from './data/embeddedMeetingsSeed';
import { SearchX, Shield, RefreshCw, ChevronLeft, Printer, Plus, RotateCcw, Download } from 'lucide-react';

const STORAGE_KEY = 'chillicothe_community_submissions_v1';
const EVENTS_STORAGE_KEY = 'chillicothe_community_events_v2';
const AUTH_STORAGE_KEY = 'chillicothe_community_auth_user_v1';
const RESOURCES_STORAGE_KEY = 'chillicothe_community_custom_resources_v2';

export const App: React.FC = () => {
  // Dynamic Resources State (persisted for super user additions/edits/deletions)
  const [resources, setResources] = useState<Resource[]>(() => {
    const defaultResources = resourcesDataRaw as Resource[];
    try {
      const saved = localStorage.getItem(RESOURCES_STORAGE_KEY) || localStorage.getItem('chillicothe_community_custom_resources_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((r: Resource) => r.id));
          // Seamlessly merge in any new default resources (like the 40 newly added Ross County churches)
          const missingDefaults = defaultResources.filter(r => !existingIds.has(r.id));
          return [...parsed, ...missingDefaults];
        }
      }
    } catch (e) {
      console.error('Failed to load custom resources from localStorage', e);
    }
    return defaultResources;
  });

  useEffect(() => {
    try {
      localStorage.setItem(RESOURCES_STORAGE_KEY, JSON.stringify(resources));
    } catch (e) {
      console.error('Failed to save resources to localStorage', e);
    }
  }, [resources]);

  const allResources: Resource[] = resources;
  const allCategoryIds = useMemo(
    () => CATEGORIES.filter(c => c.id !== 'all').map(c => c.id as ResourceCategory),
    []
  );

  // Initial Route parsed from browser URL (e.g., /foodbanks, /recovery, or /)
  const initialRoute = useMemo(() => parseRouteFromPath(window.location.pathname), []);

  // Navigation View State
  const [currentView, setCurrentView] = useState<'landing' | 'directory'>(initialRoute.view);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<ResourceCategory | 'all'>(initialRoute.category);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  
  // Authentication State (Non-required public access, persistent session)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed: AuthUser = JSON.parse(saved);
        // Ensure that any cached session claiming superUser actually matches a recognized super user email
        if (parsed?.isSuperUser && !isSuperUserEmail(parsed.email)) {
          parsed.isSuperUser = false;
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save user session', e);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to remove user session', e);
    }
  };

  // Modals & Drawers
  const [reportingResource, setReportingResource] = useState<Resource | null>(null);
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState<boolean>(false);
  const [isSubmissionsOpen, setIsSubmissionsOpen] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Super User Community Resources Management State & Handlers
  const [isResourceModalOpen, setIsResourceModalOpen] = useState<boolean>(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [resourceModalMode, setResourceModalMode] = useState<'create' | 'edit'>('create');

  const handleOpenAddResource = () => {
    if (!currentUser?.isSuperUser) {
      setIsLoginModalOpen(true);
      return;
    }
    setEditingResource(null);
    setResourceModalMode('create');
    setIsResourceModalOpen(true);
  };

  const handleOpenEditResource = (resource: Resource) => {
    if (!currentUser?.isSuperUser) {
      setIsLoginModalOpen(true);
      return;
    }
    setEditingResource(resource);
    setResourceModalMode('edit');
    setIsResourceModalOpen(true);
  };

  const handleSaveResource = (savedResource: Resource) => {
    setResources(prev => {
      const exists = prev.some(r => r.id === savedResource.id);
      if (exists) {
        return prev.map(r => (r.id === savedResource.id ? savedResource : r));
      } else {
        return [savedResource, ...prev];
      }
    });
    setEditingResource(null);
  };

  const handleDeleteResource = (resourceId: string) => {
    if (!currentUser?.isSuperUser) {
      setIsLoginModalOpen(true);
      return;
    }
    setResources(prev => prev.filter(r => r.id !== resourceId));
  };

  const handleExportResourcesJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(resources, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `chillicothe-resources-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    try {
      navigator.clipboard.writeText(JSON.stringify(resources, null, 2));
      alert(`Exported all ${resources.length} community resources! JSON file downloaded and copied to clipboard.`);
    } catch {
      alert(`Exported all ${resources.length} community resources! JSON file downloaded.`);
    }
  };

  const handleResetResourcesDefault = () => {
    if (!currentUser?.isSuperUser) return;
    if (window.confirm(`Are you sure you want to restore the original ${resourcesDataRaw.length} default resources? Any custom edits or added resources will be reset.`)) {
      setResources(resourcesDataRaw as Resource[]);
      try {
        localStorage.removeItem(RESOURCES_STORAGE_KEY);
        localStorage.removeItem('chillicothe_community_custom_resources_v1');
      } catch {}
      alert(`Successfully restored original default directory resources (${resourcesDataRaw.length} listings).`);
    }
  };

  // Community Events State & Modals
  const [events, setEvents] = useState<CommunityEvent[]>(() => {
    try {
      const savedV2 = localStorage.getItem(EVENTS_STORAGE_KEY);
      if (savedV2) {
        const parsed: CommunityEvent[] = JSON.parse(savedV2);
        // Ensure all 11 default announcements from INITIAL_EVENTS are guaranteed present
        const parsedIds = new Set(parsed.map(e => e.id));
        const missing = INITIAL_EVENTS.filter(e => !parsedIds.has(e.id));
        const merged = missing.length > 0 ? [...parsed, ...missing] : parsed;

        // Auto-heal expired Facebook CDN images or missing images to permanent local SVG flyers
        let updatedCount = 0;
        const initialMap = new Map(INITIAL_EVENTS.map(e => [e.id, e]));
        const healed = merged.map(ev => {
          const initial = initialMap.get(ev.id);
          // If this event has an expired Facebook CDN image or differs from permanent initial image
          if (initial?.imageUrl && (!ev.imageUrl || ev.imageUrl.includes('fbcdn.net') || ev.imageUrl.includes('scontent') || ev.imageUrl !== initial.imageUrl)) {
            updatedCount++;
            return { ...ev, imageUrl: initial.imageUrl };
          }
          // Also check by title match in case ID was changed
          if (ev.imageUrl && (ev.imageUrl.includes('fbcdn.net') || ev.imageUrl.includes('scontent'))) {
            const match = INITIAL_EVENTS.find(i => i.title.trim().toLowerCase() === ev.title.trim().toLowerCase());
            if (match?.imageUrl) {
              updatedCount++;
              return { ...ev, imageUrl: match.imageUrl };
            }
          }
          return ev;
        });

        if (updatedCount > 0 || missing.length > 0) {
          localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(healed));
        }
        return healed;
      }

      // Check if user had older v1 saved in browser localStorage
      const savedV1 = localStorage.getItem('chillicothe_community_events_v1');
      if (savedV1) {
        try {
          const parsedV1: CommunityEvent[] = JSON.parse(savedV1);
          const initialIds = new Set(INITIAL_EVENTS.map(e => e.id));
          const customExtra = parsedV1.filter(e => !initialIds.has(e.id));
          const merged = [...INITIAL_EVENTS, ...customExtra];
          localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(merged));
          return merged;
        } catch {}
      }

      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(INITIAL_EVENTS));
      return INITIAL_EVENTS;
    } catch {
      return INITIAL_EVENTS;
    }
  });
  const [isEventModalOpen, setIsEventModalOpen] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<CommunityEvent | null>(null);
  const [eventModalMode, setEventModalMode] = useState<'create' | 'edit' | 'copy'>('create');
  const [selectedFlyerEvent, setSelectedFlyerEvent] = useState<CommunityEvent | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
    } catch (e) {
      console.error('Failed to save events to localStorage', e);
    }
  }, [events]);

  // Deep-linking: If URL has ?event=<id>, automatically open that event announcement
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const eventId = params.get('event');
      if (eventId && events.length > 0) {
        const matched = events.find(e => e.id === eventId);
        if (matched) {
          setSelectedFlyerEvent(matched);
        }
      }
    } catch (e) {
      console.warn('Error reading event parameter from URL:', e);
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

  const handleImportEvents = (importedEvents: CommunityEvent[]) => {
    if (!currentUser?.isSuperUser) {
      alert('Only the Super User administrator (rfannin25@gmail.com) can import events.');
      return;
    }
    setEvents(importedEvents);
    try {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(importedEvents));
    } catch (e) {
      console.error('Failed to save imported events to localStorage', e);
    }
  };

  // Limited to logged-in users / super users
  const handleDeleteEvent = (id: string) => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  // Limited to logged-in users
  const handleOpenAddEvent = () => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    setEditingEvent(null);
    setEventModalMode('create');
    setIsEventModalOpen(true);
  };

  // Limited to logged-in users
  const handleOpenEditEvent = (event: CommunityEvent) => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    setEditingEvent(event);
    setEventModalMode('edit');
    setIsEventModalOpen(true);
  };

  // Limited to logged-in users
  const handleOpenCopyEvent = (event: CommunityEvent) => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    setEditingEvent(event);
    setEventModalMode('copy');
    setIsEventModalOpen(true);
  };

  const handleViewFlyer = (event: CommunityEvent) => {
    setSelectedFlyerEvent(event);
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
    if (!currentUser?.isSuperUser) {
      alert(`Only the designated super user (${SUPER_USER_EMAIL}) can clear all submissions.`);
      return;
    }
    if (window.confirm('Are you sure you want to clear all recorded submissions?')) {
      setSubmissions([]);
    }
  };

  const handleDeleteSubmission = (index: number) => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    setSubmissions(prev => prev.filter((_, i) => i !== index));
  };

  // Central Navigation & URL Synchronization
  const navigateTo = (view: 'landing' | 'directory', category: ResourceCategory | 'all' = 'all', push: boolean = true) => {
    setCurrentView(view);
    setActiveCategory(category);
    const targetPath = getPathForCategory(category, view);
    if (push && window.location.pathname !== targetPath) {
      window.history.pushState({ view, category }, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync state with browser Back and Forward navigation buttons
  useEffect(() => {
    const handlePopState = () => {
      const route = parseRouteFromPath(window.location.pathname);
      setCurrentView(route.view);
      setActiveCategory(route.category);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update document title dynamically based on active category
  useEffect(() => {
    if (currentView === 'landing') {
      document.title = 'Chillicothe Community Resources | Ross County, Ohio';
    } else {
      const activeMeta = CATEGORIES.find(c => c.id === activeCategory);
      const titleLabel = activeMeta ? activeMeta.label : 'Directory';
      document.title = `${titleLabel} | Chillicothe Community Resources`;
    }
  }, [currentView, activeCategory]);

  // Switch to directory with chosen category (e.g. from landing grid or quick chips)
  const handleSelectCategoryFromLanding = (category: ResourceCategory) => {
    navigateTo('directory', category, true);
  };

  // Switch category inside directory view (e.g. from sidebar)
  const handleSelectCategoryInDirectory = (category: ResourceCategory | 'all') => {
    navigateTo('directory', category, true);
  };

  // Handle search typing smoothly without interrupting the user
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  // Perform search and navigate to directory (e.g. on Enter key, Search button, or suggestion click)
  const handlePerformSearch = (query?: string) => {
    if (query !== undefined) {
      setSearchQuery(query);
    }
    navigateTo('directory', 'all', true);
  };

  const handleGoToLanding = () => {
    setSearchQuery('');
    navigateTo('landing', 'all', true);
  };

  const handleGoToDirectory = () => {
    navigateTo('directory', 'all', true);
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

    // Support meetings count from recovery meetings directory
    counts['support-meetings'] = EMBEDDED_RECOVERY_MEETINGS.length;

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
      const inPastor = res.pastorName ? res.pastorName.toLowerCase().includes(query) : false;
      const inDenom = res.denomination ? res.denomination.toLowerCase().includes(query) : false;
      const inServices = res.serviceTimes ? res.serviceTimes.toLowerCase().includes(query) : false;

      return inName || inAddress || inPhone || inCategory || inDesc || inNotes || inBullets || inTags || inPastor || inDenom || inServices;
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
        onOpenAddResource={handleOpenAddResource}
        onOpenSubmissions={() => setIsSubmissionsOpen(true)}
        submissionsCount={submissions.length}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* VIEW 1: MAIN LANDING PAGE */}
      {currentView === 'landing' ? (
        <main className="flex-1">
          {/* Hero Section with Historic Downtown Chillicothe Image */}
          <LandingHero
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onPerformSearch={handlePerformSearch}
            onSelectCategory={handleSelectCategoryFromLanding}
            totalResourcesCount={allResources.length}
            onOpenPrintModal={() => setIsPrintModalOpen(true)}
            allResources={allResources}
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
            currentUser={currentUser}
            onOpenLogin={() => setIsLoginModalOpen(true)}
            onImportEvents={handleImportEvents}
          />
        </main>
      ) : (
        /* VIEW 2: DIRECTORY LISTINGS WITH PERSISTENT SIDEBAR */
        <div className="flex-1 max-w-7xl w-full mx-auto px-0 sm:px-6 lg:px-8 py-0 sm:py-6 flex flex-col lg:flex-row gap-6">
          
          {/* Left Persistent Category Sidebar */}
          <SidebarNav
            activeCategory={activeCategory}
            onSelectCategory={handleSelectCategoryInDirectory}
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
                      setSearchQuery('');
                      navigateTo('directory', 'all', true);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Show All Categories</span>
                  </button>
                )}
              </div>
            </div>

            {/* Super User Resource Management Toolbar */}
            {currentUser?.isSuperUser && (
              <div className="mb-4 p-3.5 bg-gradient-to-r from-amber-500/10 via-amber-50 to-amber-100/50 border-2 border-amber-400/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-400 text-slate-950 rounded-xl font-bold shadow-xs">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-amber-950 block">
                      Super User Resource Administration
                    </span>
                    <span className="text-[11px] text-slate-600 block">
                      You can add new services, edit any listing, or delete outdated resources.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleOpenAddResource}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add New Resource</span>
                  </button>

                  <button
                    onClick={handleExportResourcesJson}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-all shadow-xs cursor-pointer"
                    title="Export all resources to JSON to backup or sync with GitHub"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-600" />
                    <span>Export Resources</span>
                  </button>

                  <button
                    onClick={handleResetResourcesDefault}
                    className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition-all cursor-pointer"
                    title={`Restore original ${resourcesDataRaw.length} default resources`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Defaults</span>
                  </button>
                </div>
              </div>
            )}

            {/* Resources Cards Grid or Support Meetings Interactive Finder */}
            {activeCategory === 'support-meetings' ? (
              <SupportMeetingsView
                isSuperUser={Boolean(currentUser?.isSuperUser)}
                userEmail={currentUser?.email}
              />
            ) : filteredResources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredResources.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onReportInaccuracy={setReportingResource}
                    isSuperUser={currentUser?.isSuperUser}
                    onEditResource={handleOpenEditResource}
                    onDeleteResource={handleDeleteResource}
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
                      navigateTo('directory', 'all', true);
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
            <a 
              href="https://liferecoverysociety.org" 
              target="_blank" 
              rel="noopener noreferrer"
              title="Visit Life Recovery Society (liferecoverysociety.org)"
              className="p-1.5 bg-slate-900 rounded-xl flex-shrink-0 border border-slate-700/60 hover:border-amber-400 transition-colors group cursor-pointer"
            >
              <img 
                src="./images/life-recovery-society-logo.png" 
                alt="Life Recovery Society" 
                className="h-12 sm:h-14 w-auto object-contain flex-shrink-0 group-hover:scale-105 transition-transform"
              />
            </a>
            <div>
              <span className="font-extrabold text-slate-800 text-xs block">
                Chillicothe Community Resources &bull; Presented by{' '}
                <a 
                  href="https://liferecoverysociety.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-amber-800 hover:text-amber-950 font-bold underline decoration-amber-300 underline-offset-2 transition-colors"
                  title="Visit liferecoverysociety.org"
                >
                  Life Recovery Society
                </a>
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
        currentUser={currentUser}
      />

        {/* Print Selection Modal (Custom Handout Builder) */}
        <PrintSelectionModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          categoryCounts={categoryCounts}
          onConfirmPrint={handleConfirmPrintCustom}
        />

        {/* Optional Google Login Modal (Non-required authentication) */}
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />

        {/* Super User Add / Edit Resource Modal */}
        <ResourceModal
          isOpen={isResourceModalOpen}
          mode={resourceModalMode}
          editingResource={editingResource}
          defaultCategory={activeCategory}
          onClose={() => {
            setIsResourceModalOpen(false);
            setEditingResource(null);
          }}
          onSave={handleSaveResource}
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

        {/* Event Flyer & Full Details Modal */}
        <EventFlyerModal
          isOpen={selectedFlyerEvent !== null}
          onClose={() => setSelectedFlyerEvent(null)}
          event={selectedFlyerEvent}
          onEdit={handleOpenEditEvent}
          onCopy={handleOpenCopyEvent}
          currentUser={currentUser}
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
