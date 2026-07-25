import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { LoginPage } from './pages/LoginPage';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { DashboardView } from './components/DashboardView';
import { PeopleView } from './components/PeopleView';
import { PersonDetailView } from './components/PersonDetailView';
import { DisburseLoanView } from './components/DisburseLoanView';
import { RecordRepaymentView } from './components/RecordRepaymentView';
import { TransactionsView } from './components/TransactionsView';
import { Toaster } from 'sonner';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff8f3] flex items-center justify-center font-['Inter']">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#620032] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-xs font-['JetBrains_Mono'] text-[#574147]">Initializing LendWise...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <LoginPage />
      </>
    );
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <div className="min-h-screen bg-[#fff8f3] text-[#1e1b17] flex flex-col font-['Inter'] selection:bg-[#ffd9e2] selection:text-[#8d034b]">
        {/* Top Fixed Header */}
        <Header userEmail={session.user?.email} />

        {/* Main Layout Area */}
        <div className="flex-1 flex pb-20 md:pb-8">
          {/* Fixed Left Sidebar */}
          <Sidebar />

          {/* Main Content Pane */}
          <main className="flex-1 md:ml-64 px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-4 overflow-y-auto min-h-[calc(100vh-3.5rem)]">
            <Routes>
              <Route path="/" element={<DashboardView />} />
              <Route path="/people" element={<PeopleView />} />
              <Route path="/person/:id" element={<PersonDetailView />} />
              <Route path="/disburse" element={<DisburseLoanView />} />
              <Route path="/repayment" element={<RecordRepaymentView />} />
              <Route path="/transactions" element={<TransactionsView />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>

        {/* Mobile Navigation Bar */}
        <MobileNav />
      </div>
    </BrowserRouter>
  );
}
