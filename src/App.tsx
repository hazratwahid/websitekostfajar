/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Room, 
  Tenant, 
  Invoice, 
  MaintenanceTicket, 
  FinancialRecord, 
  MeterLog, 
  UserRole, 
  RoomStatus,
  TicketStatus 
} from './types';
import { 
  getInitialAppState, 
  saveStoredData, 
  resetAllData, 
  generateWhatsAppMessage, 
  formatIDR 
} from './lib/storage';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { RoomGrid } from './components/RoomGrid';
import { TenantManagement } from './components/TenantManagement';
import { BillingManagement } from './components/BillingManagement';
import { MaintenanceSystem } from './components/MaintenanceSystem';
import { RoomControl } from './components/RoomControl';
import { TenantPortalView } from './components/TenantPortalView';
import { DatabaseSchemaModal } from './components/DatabaseSchemaModal';
import { ReceiptModal } from './components/ReceiptModal';
import { RoomDetailModal } from './components/RoomDetailModal';
import { Send, Copy, ExternalLink, RotateCcw } from 'lucide-react';

export default function App() {
  const [initialData] = useState(getInitialAppState);

  const [rooms, setRooms] = useState<Room[]>(initialData.rooms);
  const [tenants, setTenants] = useState<Tenant[]>(initialData.tenants);
  const [invoices, setInvoices] = useState<Invoice[]>(initialData.invoices);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(initialData.tickets);
  const [expenses, setExpenses] = useState<FinancialRecord[]>(initialData.expenses);
  const [meterLogs, setMeterLogs] = useState<MeterLog[]>(initialData.meterLogs);

  // App Navigation & Role
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [role, setRole] = useState<UserRole>('owner');
  const [activeTenantId, setActiveTenantId] = useState<string>(initialData.tenants[0]?.id || 'tenant-1');

  // Dark Mode Theme
  const [isDark, setIsDark] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Persist State Changes
  useEffect(() => {
    saveStoredData('sikost_rooms_v1', rooms);
  }, [rooms]);

  useEffect(() => {
    saveStoredData('sikost_tenants_v1', tenants);
  }, [tenants]);

  useEffect(() => {
    saveStoredData('sikost_invoices_v1', invoices);
  }, [invoices]);

  useEffect(() => {
    saveStoredData('sikost_tickets_v1', tickets);
  }, [tickets]);

  useEffect(() => {
    saveStoredData('sikost_expenses_v1', expenses);
  }, [expenses]);

  useEffect(() => {
    saveStoredData('sikost_meter_logs_v1', meterLogs);
  }, [meterLogs]);

  // Modals state
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [receiptModalInvoice, setReceiptModalInvoice] = useState<Invoice | null>(null);
  const [selectedRoomDetailId, setSelectedRoomDetailId] = useState<string | null>(null);

  // WhatsApp quick sender modal
  const [waModalInvoice, setWaModalInvoice] = useState<Invoice | null>(null);
  const [copiedWA, setCopiedWA] = useState(false);

  // Unverified invoices & open tickets count
  const unverifiedCount = invoices.filter(i => i.status === 'verifying').length;
  const openTicketsCount = tickets.filter(t => t.status === 'open').length;

  // Handlers: Tenant Management
  const handleAddTenant = (newTenantData: Omit<Tenant, 'id'>) => {
    const newId = `tenant-${Date.now()}`;
    const newTenant: Tenant = {
      ...newTenantData,
      id: newId,
    };

    setTenants(prev => [newTenant, ...prev]);

    // Update Room to occupied
    setRooms(prev => prev.map(r => {
      if (r.id === newTenantData.roomId) {
        return {
          ...r,
          status: 'occupied',
          currentTenantId: newId,
        };
      }
      return r;
    }));
  };

  const handleCheckoutTenant = (tenantId: string, notes: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (!tenant) return;

    // Mark tenant graduated
    setTenants(prev => prev.map(t => {
      if (t.id === tenantId) {
        return { ...t, status: 'graduated', notes: `${t.notes || ''} [Checkout: ${notes}]` };
      }
      return t;
    }));

    // Update room to maintenance / cleaning
    setRooms(prev => prev.map(r => {
      if (r.id === tenant.roomId) {
        return {
          ...r,
          status: 'maintenance',
          currentTenantId: undefined,
        };
      }
      return r;
    }));
  };

  const handleTransferRoom = (tenantId: string, newRoomId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (!tenant) return;
    const oldRoomId = tenant.roomId;

    // Update tenant room
    setTenants(prev => prev.map(t => {
      if (t.id === tenantId) {
        return { ...t, roomId: newRoomId };
      }
      return t;
    }));

    // Update rooms
    setRooms(prev => prev.map(r => {
      if (r.id === oldRoomId) {
        return { ...r, status: 'maintenance', currentTenantId: undefined };
      }
      if (r.id === newRoomId) {
        return { ...r, status: 'occupied', currentTenantId: tenantId };
      }
      return r;
    }));
  };

  const handleUpdateAutoRenew = (tenantId: string, isAutoRenew: boolean) => {
    setTenants(prev => prev.map(t => t.id === tenantId ? { ...t, isAutoRenew } : t));
  };

  const handleUpdateRoomStatus = (roomId: string, status: RoomStatus) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, status } : r));
  };

  // Handlers: Billing & Invoices
  const handleCreateInvoice = (newInvoiceData: Omit<Invoice, 'id'>) => {
    const newId = `inv-${Date.now()}`;
    const newInvoice: Invoice = {
      ...newInvoiceData,
      id: newId,
    };
    setInvoices(prev => [newInvoice, ...prev]);

    // Update room status to pending_payment if not occupied
    setRooms(prev => prev.map(r => {
      if (r.id === newInvoiceData.roomId && r.status === 'occupied') {
        return { ...r, status: 'pending_payment' };
      }
      return r;
    }));
  };

  const handleVerifyPayment = (invoiceId: string, verified: boolean, notes?: string) => {
    const inv = invoices.find(i => i.id === invoiceId);
    if (!inv) return;

    if (verified) {
      setInvoices(prev => prev.map(i => {
        if (i.id === invoiceId) {
          return {
            ...i,
            status: 'paid',
            paymentDate: new Date().toISOString().split('T')[0],
            paymentMethod: i.paymentMethod || 'Transfer BCA',
            verifiedBy: role === 'owner' ? 'Owner (Super Admin)' : 'Pak Budi (Caretaker)',
            notes,
          };
        }
        return i;
      }));

      // Update Room back to occupied
      setRooms(prev => prev.map(r => {
        if (r.id === inv.roomId) {
          return { ...r, status: 'occupied' };
        }
        return r;
      }));

      // Automatically log to Financial Ledger as Income
      const newIncomeRecord: FinancialRecord = {
        id: `exp-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: 'income',
        category: 'Sewa Kamar',
        description: `Pembayaran Sewa Kamar ${rooms.find(r => r.id === inv.roomId)?.number} (${inv.periodMonth})`,
        amount: inv.totalAmount,
        roomId: inv.roomId,
        invoiceId: inv.id,
      };

      setExpenses(prev => [newIncomeRecord, ...prev]);
    } else {
      setInvoices(prev => prev.map(i => {
        if (i.id === invoiceId) {
          return {
            ...i,
            status: 'overdue',
            notes: notes || 'Bukti transfer tidak valid atau ditolak admin.',
          };
        }
        return i;
      }));
    }
  };

  const handleAddExpense = (newExpenseData: Omit<FinancialRecord, 'id'>) => {
    const newId = `exp-${Date.now()}`;
    const newExpense: FinancialRecord = {
      ...newExpenseData,
      id: newId,
    };
    setExpenses(prev => [newExpense, ...prev]);
  };

  // Handlers: Maintenance Tickets
  const handleCreateTicket = (ticketData: Omit<MaintenanceTicket, 'id' | 'ticketNumber' | 'reportedAt'>) => {
    const ticketNum = `TCK-202611-${(tickets.length + 1).toString().padStart(2, '0')}`;
    const now = new Date();
    const formattedDate = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;

    const newTicket: MaintenanceTicket = {
      ...ticketData,
      id: `tkt-${Date.now()}`,
      ticketNumber: ticketNum,
      reportedAt: formattedDate,
    };

    setTickets(prev => [newTicket, ...prev]);
  };

  const handleUpdateTicketStatus = (
    ticketId: string, 
    status: TicketStatus, 
    assignedStaff?: string, 
    expenseAmount?: number, 
    notes?: string
  ) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status,
          assignedStaff: assignedStaff || t.assignedStaff,
          expenseAmount: expenseAmount !== undefined ? expenseAmount : t.expenseAmount,
          resolutionNotes: notes || t.resolutionNotes,
          resolvedAt: status === 'resolved' ? new Date().toISOString().split('T')[0] : t.resolvedAt,
          expenseLoggedToFinance: expenseAmount && expenseAmount > 0 ? true : t.expenseLoggedToFinance,
        };
      }
      return t;
    }));

    // If there is an expense logged and not already added to finance, add it
    if (expenseAmount && expenseAmount > 0 && !ticket.expenseLoggedToFinance) {
      const room = rooms.find(r => r.id === ticket.roomId);
      const repairExpense: FinancialRecord = {
        id: `exp-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: 'expense',
        category: 'Maintenance',
        description: `Perbaikan: ${ticket.title} (Kamar ${room?.number || '-'})`,
        amount: expenseAmount,
        roomId: ticket.roomId,
      };
      setExpenses(prev => [repairExpense, ...prev]);
    }
  };

  // Handlers: Meter & PIN
  const handleUpdateMeter = (roomId: string, newKwh: number, recordedBy: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    const previousKwh = room.currentMeterKwh;
    const consumed = Math.max(0, newKwh - previousKwh);

    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        return {
          ...r,
          lastMeterKwh: previousKwh,
          currentMeterKwh: newKwh,
        };
      }
      return r;
    }));

    // Log to meterLogs
    const newLog: MeterLog = {
      id: `mlog-${Date.now()}`,
      roomId,
      date: new Date().toISOString().split('T')[0],
      previousKwh,
      currentKwh: newKwh,
      consumedKwh: consumed,
      recordedBy,
      billed: false,
    };

    setMeterLogs(prev => [newLog, ...prev]);
  };

  const handleGenerateNewPin = (roomId: string) => {
    const newPin = Math.floor(100000 + Math.random() * 900000).toString();
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, doorPin: newPin } : r));
  };

  // Handlers: Tenant Portal Proof Upload
  const handleTenantUploadProof = (invoiceId: string, proofUrl: string, method: any) => {
    setInvoices(prev => prev.map(i => {
      if (i.id === invoiceId) {
        return {
          ...i,
          status: 'verifying',
          paymentMethod: method,
          proofReceiptUrl: proofUrl,
          notes: 'Penghuni telah mengunggah bukti bayar transfer. Menunggu verifikasi admin.',
        };
      }
      return i;
    }));
  };

  // Reset to default mock data
  const handleResetData = () => {
    if (confirm('Apakah Anda yakin ingin mengatur ulang data demo Kost Adyatma ke kondisi awal?')) {
      resetAllData();
      window.location.reload();
    }
  };

  // Selected room for detail modal
  const selectedRoomForDetail = rooms.find(r => r.id === selectedRoomDetailId) || null;
  const tenantForSelectedRoom = tenants.find(t => t.id === selectedRoomForDetail?.currentTenantId);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        role={role}
        setRole={setRole}
        isDark={isDark}
        toggleDark={() => setIsDark(!isDark)}
        onOpenDbModal={() => setIsDbModalOpen(true)}
        unverifiedCount={unverifiedCount}
        openTicketsCount={openTicketsCount}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* If persona is 'tenant', render Tenant Portal View */}
        {role === 'tenant' ? (
          <TenantPortalView
            tenants={tenants}
            rooms={rooms}
            invoices={invoices}
            tickets={tickets}
            activeTenantId={activeTenantId}
            setActiveTenantId={setActiveTenantId}
            onUploadPaymentProof={handleTenantUploadProof}
            onSubmitMaintenance={handleCreateTicket}
          />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardOverview
                rooms={rooms}
                tenants={tenants}
                invoices={invoices}
                tickets={tickets}
                expenses={expenses}
                onOpenWhatsAppModal={(inv) => setWaModalInvoice(inv)}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onSelectRoom={(roomId) => setSelectedRoomDetailId(roomId)}
              />
            )}

            {activeTab === 'rooms' && (
              <RoomGrid
                rooms={rooms}
                tenants={tenants}
                onSelectRoom={(roomId) => setSelectedRoomDetailId(roomId)}
                onOpenCheckInModal={(room) => {
                  setActiveTab('tenants');
                }}
                onOpenMeterModal={(room) => {
                  setActiveTab('control');
                }}
                onOpenTicketModal={(room) => {
                  setActiveTab('tickets');
                }}
                onOpenBillModal={(room) => {
                  setActiveTab('billing');
                }}
                onUpdateRoomStatus={handleUpdateRoomStatus}
              />
            )}

            {activeTab === 'tenants' && (
              <TenantManagement
                tenants={tenants}
                rooms={rooms}
                onAddTenant={handleAddTenant}
                onCheckoutTenant={handleCheckoutTenant}
                onTransferRoom={handleTransferRoom}
                onUpdateAutoRenew={handleUpdateAutoRenew}
              />
            )}

            {activeTab === 'billing' && (
              <BillingManagement
                invoices={invoices}
                rooms={rooms}
                tenants={tenants}
                expenses={expenses}
                onVerifyPayment={handleVerifyPayment}
                onCreateInvoice={handleCreateInvoice}
                onOpenReceipt={(inv) => setReceiptModalInvoice(inv)}
                onAddExpense={handleAddExpense}
              />
            )}

            {activeTab === 'tickets' && (
              <MaintenanceSystem
                tickets={tickets}
                rooms={rooms}
                tenants={tenants}
                onCreateTicket={handleCreateTicket}
                onUpdateTicketStatus={handleUpdateTicketStatus}
              />
            )}

            {activeTab === 'control' && (
              <RoomControl
                rooms={rooms}
                meterLogs={meterLogs}
                onUpdateMeter={handleUpdateMeter}
                onGenerateNewPin={handleGenerateNewPin}
              />
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 bg-white dark:bg-slate-900 text-xs text-slate-500 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">SiKost Pro</span>
            <span>·</span>
            <span>PropTech Kost Bulanan Adyatma Residence BSD</span>
            <span>·</span>
            <span>All systems operational</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDbModalOpen(true)}
              className="text-emerald-700 dark:text-emerald-400 hover:underline font-mono"
            >
              Schema Prisma & SQL
            </button>
            <button
              onClick={handleResetData}
              title="Kembalikan data ke awal"
              className="hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Data Demo
            </button>
          </div>
        </div>
      </footer>

      {/* WhatsApp Quick Reminder Modal */}
      {waModalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Kirim Pengingat WhatsApp
                </h3>
              </div>
              <button 
                onClick={() => setWaModalInvoice(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            {(() => {
              const tenant = tenants.find(t => t.id === waModalInvoice.tenantId);
              const room = rooms.find(r => r.id === waModalInvoice.roomId);
              if (!tenant || !room) return null;

              const message = generateWhatsAppMessage(tenant, room, waModalInvoice);

              return (
                <>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Format pesan siap kirim untuk <span className="font-semibold text-slate-800 dark:text-slate-200">{tenant.name}</span> (Kamar {room.number}):
                  </p>

                  <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/80 rounded-lg">
                    <pre className="text-xs font-mono whitespace-pre-wrap text-slate-800 dark:text-slate-200 max-h-56 overflow-y-auto leading-relaxed">
                      {message}
                    </pre>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(message);
                        setCopiedWA(true);
                        setTimeout(() => setCopiedWA(false), 2000);
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copiedWA ? 'Tersalin!' : 'Salin Pesan'}
                    </button>

                    <button
                      onClick={() => {
                        const cleanPhone = tenant.phone.replace(/^0/, '62');
                        const encoded = encodeURIComponent(message);
                        window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
                      }}
                      className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md flex items-center gap-1.5 shadow-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Kirim via WhatsApp
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      <ReceiptModal
        invoice={receiptModalInvoice}
        room={rooms.find(r => r.id === receiptModalInvoice?.roomId)}
        tenant={tenants.find(t => t.id === receiptModalInvoice?.tenantId)}
        onClose={() => setReceiptModalInvoice(null)}
      />

      {/* Room Detail Modal */}
      <RoomDetailModal
        room={selectedRoomForDetail}
        tenant={tenantForSelectedRoom}
        invoices={invoices}
        tickets={tickets}
        onClose={() => setSelectedRoomDetailId(null)}
        onUpdateStatus={handleUpdateRoomStatus}
        onOpenCheckIn={(room) => {
          setActiveTab('tenants');
        }}
        onOpenMeter={(room) => {
          setActiveTab('control');
        }}
        onOpenTicket={(room) => {
          setActiveTab('tickets');
        }}
        onOpenBill={(room) => {
          setActiveTab('billing');
        }}
      />

      {/* Production Database Schema & DDL Modal */}
      <DatabaseSchemaModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
      />

    </div>
  );
}
