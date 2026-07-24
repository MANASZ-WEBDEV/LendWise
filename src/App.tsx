import React, { useState } from 'react';
import { Person, Transaction, ViewMode } from './types';
import { INITIAL_PEOPLE, INITIAL_TRANSACTIONS } from './mockData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { DashboardView } from './components/DashboardView';
import { PeopleView } from './components/PeopleView';
import { PersonDetailView } from './components/PersonDetailView';
import { DisburseLoanView } from './components/DisburseLoanView';
import { RecordRepaymentView } from './components/RecordRepaymentView';
import { TransactionsView } from './components/TransactionsView';
import { AddPersonModal } from './components/AddPersonModal';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [people, setPeople] = useState<Person[]>(INITIAL_PEOPLE);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleNavigate = (view: ViewMode) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPerson = (person: Person) => {
    setSelectedPerson(person);
    setCurrentView('person-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenNewLoan = (person?: Person) => {
    if (person) {
      setSelectedPerson(person);
    }
    setCurrentView('disburse-loan');
  };

  const handleRecordRepayment = (person: Person) => {
    setSelectedPerson(person);
    setCurrentView('repayment');
  };

  const handleFinishDisbursement = (data: {
    personId: string;
    personName: string;
    principal: number;
    rate: number;
    termMonths: number;
    disbursementDate: string;
  }) => {
    const txnId = `TXN-${Math.floor(1000000 + Math.random() * 9000000)}`;
    const newTxn: Transaction = {
      id: txnId,
      personId: data.personId,
      personName: data.personName,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      type: 'Loan Disbursement',
      reference: txnId,
      amount: data.principal,
      debit: data.principal,
      balanceAfter: data.principal,
      status: 'Cleared',
      notes: `Disbursement term: ${data.termMonths} mos @ ${data.rate}% p.a.`,
    };

    setTransactions([newTxn, ...transactions]);

    // Update recipient's principal in people list
    setPeople((prev) =>
      prev.map((p) =>
        p.id === data.personId
          ? {
              ...p,
              principal: p.principal + data.principal,
              activeLoans: p.activeLoans + 1,
              status: 'Active',
            }
          : p
      )
    );

    showToast(`Loan disbursement of $${data.principal.toLocaleString()} recorded for ${data.personName}!`);
    setCurrentView('transactions');
  };

  const handleConfirmRepayment = (data: {
    personId: string;
    personName: string;
    amount: number;
    interestPaid: number;
    principalPaid: number;
    date: string;
    method: string;
    memo: string;
  }) => {
    const txnId = `TXN-${Math.floor(1000000 + Math.random() * 9000000)}`;
    const newTxn: Transaction = {
      id: txnId,
      personId: data.personId,
      personName: data.personName,
      date: data.date,
      type: 'Repayment',
      reference: txnId,
      amount: data.amount,
      credit: data.amount,
      balanceAfter: 0,
      status: 'Cleared',
      notes: `${data.memo} (Interest: $${data.interestPaid.toFixed(2)}, Principal: $${data.principalPaid.toFixed(2)})`,
    };

    setTransactions([newTxn, ...transactions]);

    // Update recipient's principal and live accrual
    setPeople((prev) =>
      prev.map((p) => {
        if (p.id === data.personId) {
          const updatedPrincipal = Math.max(0, p.principal - data.principalPaid);
          const updatedAccrual = Math.max(0, p.liveAccrual - data.interestPaid);
          return {
            ...p,
            principal: updatedPrincipal,
            liveAccrual: updatedAccrual,
            lastPaymentDate: 'Just now',
          };
        }
        return p;
      })
    );

    showToast(`Repayment of $${data.amount.toLocaleString()} confirmed for ${data.personName}!`);
    setCurrentView('dashboard');
  };

  const handleAddPerson = (newPerson: Person) => {
    setPeople([newPerson, ...people]);
    showToast(`New contact ${newPerson.name} successfully registered to LendWise!`);
  };

  const handleExportRecords = () => {
    showToast('Exporting master ledger records as CSV...');
    setCurrentView('transactions');
  };

  return (
    <div className="min-h-screen bg-[#fff8f3] text-[#1e1b17] flex flex-col font-['Inter'] selection:bg-[#ffd9e2] selection:text-[#8d034b]">
      {/* Top Fixed Header */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedPersonName={selectedPerson?.name}
        onOpenNewLoan={() => handleOpenNewLoan()}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex pt-14 pb-20 md:pb-8">
        {/* Fixed Left Sidebar */}
        <Sidebar currentView={currentView} onNavigate={handleNavigate} />

        {/* Main Content Pane */}
        <main className="flex-1 md:ml-64 p-4 sm:p-6 lg:p-8 overflow-y-auto min-h-[calc(100vh-3.5rem)]">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed top-16 right-6 z-50 bg-[#620032] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-[#ffd9e2]/30 font-['JetBrains_Mono'] text-xs animate-bounce">
              <span className="material-symbols-outlined text-emerald-400 text-lg">check_circle</span>
              <span>{toastMessage}</span>
            </div>
          )}

          {/* VIEW SWITCHER */}
          {currentView === 'dashboard' && (
            <DashboardView
              people={people}
              transactions={transactions}
              onNavigate={handleNavigate}
              onSelectPerson={handleSelectPerson}
              onExportRecords={handleExportRecords}
            />
          )}

          {currentView === 'people' && (
            <PeopleView
              people={people}
              onSelectPerson={handleSelectPerson}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              searchQuery={searchQuery}
            />
          )}

          {currentView === 'person-detail' && selectedPerson && (
            <PersonDetailView
              person={selectedPerson}
              transactions={transactions}
              onNavigate={handleNavigate}
              onRecordRepayment={handleRecordRepayment}
              onNewLoanForPerson={(p) => handleOpenNewLoan(p)}
              onBack={() => handleNavigate('people')}
            />
          )}

          {currentView === 'disburse-loan' && (
            <DisburseLoanView
              people={people}
              selectedPerson={selectedPerson}
              onFinishDisbursement={handleFinishDisbursement}
              onCancel={() => handleNavigate('dashboard')}
            />
          )}

          {currentView === 'repayment' && selectedPerson && (
            <RecordRepaymentView
              person={selectedPerson}
              onConfirmRepayment={handleConfirmRepayment}
              onBack={() => handleNavigate('person-detail')}
            />
          )}

          {currentView === 'transactions' && (
            <TransactionsView
              transactions={transactions}
              searchQuery={searchQuery}
            />
          )}

          {currentView === 'settings' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <h1 className="text-3xl font-bold text-[#620032]">Ledger Settings</h1>
              <div className="bg-[#ffffff] border border-[#ddbfc6] rounded-xl p-6 space-y-4 shadow-2xs">
                <h3 className="font-bold text-lg text-[#1e1b17]">Security & Compliance</h3>
                <p className="text-sm text-[#574147]">
                  Configure interest calculation standards, day count conventions (365/360), and multi-signature audit thresholds.
                </p>
                <div className="pt-4 border-t border-[#ddbfc6] flex gap-4">
                  <button className="px-4 py-2 bg-[#8b004a] text-white font-['JetBrains_Mono'] text-xs font-bold rounded-lg hover:bg-[#620032]">
                    Save Configuration
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentView === 'support' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <h1 className="text-3xl font-bold text-[#620032]">LendWise Support & Audit Assistance</h1>
              <div className="bg-[#ffffff] border border-[#ddbfc6] rounded-xl p-6 space-y-4 shadow-2xs">
                <h3 className="font-bold text-lg text-[#1e1b17]">Private Wealth Concierge</h3>
                <p className="text-sm text-[#574147]">
                  For custom tax reporting, high-net-worth estate loan structures, or contract auditing support.
                </p>
                <a
                  href="mailto:support@lendwise.private"
                  className="inline-block px-5 py-2.5 bg-[#1e1b17] text-white font-['JetBrains_Mono'] text-xs font-bold rounded-lg hover:bg-[#2f2f2f]"
                >
                  Contact Concierge Desk
                </a>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Navigation Bar */}
      <MobileNav
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenNewLoan={() => handleOpenNewLoan()}
      />

      {/* Add Entity Modal */}
      <AddPersonModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddPerson={handleAddPerson}
      />
    </div>
  );
}
