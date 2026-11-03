import React, { useState } from 'react';
import { Tenant, Room } from '../types';
import { formatIDR, formatDateIndo } from '../lib/storage';
import { 
  Users, 
  UserPlus, 
  Search, 
  Phone, 
  Mail, 
  CreditCard, 
  Calendar, 
  ArrowRightLeft, 
  LogOut, 
  ShieldCheck, 
  AlertCircle,
  FileText,
  UserCheck
} from 'lucide-react';

interface TenantManagementProps {
  tenants: Tenant[];
  rooms: Room[];
  onAddTenant: (newTenant: Omit<Tenant, 'id'>) => void;
  onCheckoutTenant: (tenantId: string, notes: string) => void;
  onTransferRoom: (tenantId: string, newRoomId: string) => void;
  onUpdateAutoRenew: (tenantId: string, isAutoRenew: boolean) => void;
}

export const TenantManagement: React.FC<TenantManagementProps> = ({
  tenants,
  rooms,
  onAddTenant,
  onCheckoutTenant,
  onTransferRoom,
  onUpdateAutoRenew,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Transfer form state
  const [targetRoomId, setTargetRoomId] = useState('');

  // Checkout form state
  const [checkoutNotes, setCheckoutNotes] = useState('Kamar rapi, kunci dikembalikan, deposit dikembalikan penuh.');

  // Check-in form state
  const [newTenantForm, setNewTenantForm] = useState({
    name: '',
    nik: '',
    phone: '',
    email: '',
    occupation: '',
    institution: '',
    emergencyName: '',
    emergencyRel: 'Orang Tua',
    emergencyPhone: '',
    roomId: '',
    startDate: '2026-11-01',
    durationMonths: 6,
    rentDueDay: 1,
    depositAmount: 2500000,
    isAutoRenew: true,
    notes: '',
  });

  const vacantRooms = rooms.filter(r => r.status === 'vacant');

  const filteredTenants = tenants.filter(t => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const room = rooms.find(r => r.id === t.roomId);
    return (
      t.name.toLowerCase().includes(q) ||
      t.phone.includes(q) ||
      t.nik.includes(q) ||
      t.occupation.toLowerCase().includes(q) ||
      room?.number.includes(q)
    );
  });

  const handleOpenCheckIn = (preselectedRoomId?: string) => {
    setNewTenantForm(prev => ({
      ...prev,
      roomId: preselectedRoomId || (vacantRooms[0]?.id ?? ''),
    }));
    setIsCheckInOpen(true);
  };

  const handleCreateCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantForm.name || !newTenantForm.phone || !newTenantForm.roomId) {
      alert('Mohon lengkapi nama penyewa, nomor WhatsApp, dan pilihan kamar.');
      return;
    }

    const start = new Date(newTenantForm.startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + Number(newTenantForm.durationMonths));

    const selectedRoom = rooms.find(r => r.id === newTenantForm.roomId);

    onAddTenant({
      name: newTenantForm.name,
      nik: newTenantForm.nik || '3171' + Math.floor(100000000000 + Math.random() * 900000000000),
      phone: newTenantForm.phone,
      email: newTenantForm.email || `${newTenantForm.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      occupation: newTenantForm.occupation || 'Karyawan Swasta',
      institution: newTenantForm.institution || 'Kantor BSD',
      emergencyContact: {
        name: newTenantForm.emergencyName || 'Keluarga',
        relationship: newTenantForm.emergencyRel,
        phone: newTenantForm.emergencyPhone || '08120000000',
      },
      roomId: newTenantForm.roomId,
      startDate: newTenantForm.startDate,
      endDate: end.toISOString().split('T')[0],
      rentDueDay: Number(newTenantForm.rentDueDay) || 1,
      depositAmount: Number(newTenantForm.depositAmount) || (selectedRoom?.basePrice ?? 2000000),
      isAutoRenew: newTenantForm.isAutoRenew,
      status: 'active',
      notes: newTenantForm.notes,
    });

    setIsCheckInOpen(false);
  };

  const handleExecuteTransfer = () => {
    if (!selectedTenant || !targetRoomId) return;
    onTransferRoom(selectedTenant.id, targetRoomId);
    setIsTransferOpen(false);
    setSelectedTenant(null);
  };

  const handleExecuteCheckout = () => {
    if (!selectedTenant) return;
    onCheckoutTenant(selectedTenant.id, checkoutNotes);
    setIsCheckoutOpen(false);
    setSelectedTenant(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Data Penghuni & Kontrak Sewa
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Kelola profil digital penghuni, verifikasi KTP, kontak darurat, serta perpanjangan sewa otomatis
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari penghuni, NIK, kamar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            
            <button
              onClick={() => handleOpenCheckIn()}
              className="py-1.5 px-3 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Check-in Penghuni Baru
            </button>
          </div>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold">
                <th className="py-3 px-4">Kamar</th>
                <th className="py-3 px-4">Nama Penghuni</th>
                <th className="py-3 px-4">Kontak (WhatsApp)</th>
                <th className="py-3 px-4">Pekerjaan / Instansi</th>
                <th className="py-3 px-4">Periode Kontrak</th>
                <th className="py-3 px-4">Jatuh Tempo</th>
                <th className="py-3 px-4">Deposit</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ditemukan data penghuni sesuai pencarian.
                  </td>
                </tr>
              ) : (
                filteredTenants.map(tenant => {
                  const room = rooms.find(r => r.id === tenant.roomId);
                  return (
                    <tr 
                      key={tenant.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {room?.number || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {tenant.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          NIK: {tenant.nik}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <a 
                          href={`https://wa.me/${tenant.phone.replace(/^0/, '62')}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 font-mono"
                        >
                          <Phone className="w-3 h-3" />
                          {tenant.phone}
                        </a>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-800 dark:text-slate-200">{tenant.occupation}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{tenant.institution}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono text-[11px]">
                          {formatDateIndo(tenant.startDate)} - {formatDateIndo(tenant.endDate)}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${tenant.isAutoRenew ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {tenant.isAutoRenew ? 'Auto-perpanjang' : 'Tanpa auto-renew'}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-900 dark:text-slate-100">
                        Tgl {tenant.rentDueDay} / bln
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-800 dark:text-slate-200">
                        {formatIDR(tenant.depositAmount)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedTenant(tenant)}
                            className="px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
                          >
                            Detail
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tenant Profile Modal / Detail View */}
      {selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-xl">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-sm">
                  {selectedTenant.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedTenant.name}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Kamar {rooms.find(r => r.id === selectedTenant.roomId)?.number} · Penyewa Aktif
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTenant(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            {/* Profile Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300 block">Identitas Pribadi (KTP)</span>
                <div><span className="text-slate-500">NIK:</span> <span className="font-mono">{selectedTenant.nik}</span></div>
                <div><span className="text-slate-500">WhatsApp:</span> <span className="font-mono">{selectedTenant.phone}</span></div>
                <div><span className="text-slate-500">Email:</span> {selectedTenant.email}</div>
                <div><span className="text-slate-500">Profesi:</span> {selectedTenant.occupation} ({selectedTenant.institution})</div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300 block">Kontak Darurat (Wajib)</span>
                <div><span className="text-slate-500">Nama:</span> {selectedTenant.emergencyContact.name}</div>
                <div><span className="text-slate-500">Hubungan:</span> {selectedTenant.emergencyContact.relationship}</div>
                <div><span className="text-slate-500">Telepon:</span> <span className="font-mono">{selectedTenant.emergencyContact.phone}</span></div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300 block">Kontrak & Finansial Sewa</span>
                <div><span className="text-slate-500">Mulai:</span> {formatDateIndo(selectedTenant.startDate)}</div>
                <div><span className="text-slate-500">Berakhir:</span> {formatDateIndo(selectedTenant.endDate)}</div>
                <div><span className="text-slate-500">Deposit Jaminan:</span> <span className="font-mono">{formatIDR(selectedTenant.depositAmount)}</span></div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-500">Auto-Perpanjang:</span>
                  <button
                    onClick={() => onUpdateAutoRenew(selectedTenant.id, !selectedTenant.isAutoRenew)}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      selectedTenant.isAutoRenew 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {selectedTenant.isAutoRenew ? 'Aktif (On)' : 'Non-aktif (Off)'}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300 block">Catatan Tambahan & Kendaraan</span>
                <p className="text-slate-600 dark:text-slate-400 italic">
                  {selectedTenant.notes || 'Tidak ada catatan khusus.'}
                </p>
              </div>

            </div>

            {/* Operational Workflow Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsTransferOpen(true)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md flex items-center gap-1.5"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  Pindah Kamar (Transfer)
                </button>
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="px-3 py-1.5 text-xs font-medium text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 rounded-md flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Check-out / Selesai Sewa
                </button>
              </div>

              <button
                onClick={() => setSelectedTenant(null)}
                className="px-4 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Transfer Room Modal */}
      {isTransferOpen && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Pindah Kamar: {selectedTenant.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pindahkan penyewa dari Kamar {rooms.find(r => r.id === selectedTenant.roomId)?.number} ke kamar kosong lain. Kamar lama akan otomatis ditandai untuk dibersihkan.
            </p>

            <div className="space-y-2 text-xs">
              <label className="block font-medium text-slate-700 dark:text-slate-300">Pilih Kamar Tujuan Kosong:</label>
              <select
                value={targetRoomId}
                onChange={(e) => setTargetRoomId(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="">-- Pilih Kamar Siap Huni --</option>
                {vacantRooms.map(r => (
                  <option key={r.id} value={r.id}>
                    Kamar {r.number} (Lt {r.floor} · {r.type} · {formatIDR(r.basePrice)})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsTransferOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400"
              >
                Batal
              </button>
              <button
                disabled={!targetRoomId}
                onClick={handleExecuteTransfer}
                className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md disabled:opacity-50"
              >
                Konfirmasi Pindah
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Tenant Modal */}
      {isCheckoutOpen && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Proses Check-out Sewa: {selectedTenant.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kamar {rooms.find(r => r.id === selectedTenant.roomId)?.number} akan dialihkan ke status Perbaikan/Pembersihan. Deposit yang dikembalikan: <span className="font-mono font-semibold">{formatIDR(selectedTenant.depositAmount)}</span>.
            </p>

            <div className="space-y-1.5 text-xs">
              <label className="block font-medium text-slate-700 dark:text-slate-300">Catatan Kondisi Kamar & Pengembalian Deposit:</label>
              <textarea
                rows={3}
                value={checkoutNotes}
                onChange={(e) => setCheckoutNotes(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400"
              >
                Batal
              </button>
              <button
                onClick={handleExecuteCheckout}
                className="px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-md"
              >
                Selesaikan Check-out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Check-In Modal Form */}
      {isCheckInOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-xl">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Formulir Check-in Penghuni Baru
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Input data identitas digital, kontak darurat, serta kontrak sewa awal
                </p>
              </div>
              <button 
                onClick={() => setIsCheckInOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCheckIn} className="space-y-4 text-xs">
              
              {/* Room Choice */}
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Kamar yang Siap Huni:
                </label>
                <select
                  required
                  value={newTenantForm.roomId}
                  onChange={(e) => {
                    const r = rooms.find(rm => rm.id === e.target.value);
                    setNewTenantForm(prev => ({
                      ...prev,
                      roomId: e.target.value,
                      depositAmount: r?.basePrice ?? prev.depositAmount,
                    }));
                  }}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="">-- Pilih Kamar --</option>
                  {vacantRooms.map(r => (
                    <option key={r.id} value={r.id}>
                      Kamar {r.number} (Lt {r.floor} · {r.type} · {formatIDR(r.basePrice)}/bln)
                    </option>
                  ))}
                </select>
              </div>

              {/* Personal Data */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap Sesuai KTP:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Muhammad Rizki"
                    value={newTenantForm.name}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, name: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Nomor WhatsApp Aktif:</label>
                  <input
                    type="text"
                    required
                    placeholder="0812xxxxxxxx"
                    value={newTenantForm.phone}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, phone: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">NIK (KTP):</label>
                  <input
                    type="text"
                    placeholder="3171xxxxxxxxxxxx (16 digit)"
                    value={newTenantForm.nik}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, nik: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Email:</label>
                  <input
                    type="email"
                    placeholder="email@domain.com"
                    value={newTenantForm.email}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, email: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Pekerjaan / Mahasiswa:</label>
                  <input
                    type="text"
                    placeholder="Software Engineer / Mahasiswa"
                    value={newTenantForm.occupation}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, occupation: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Perusahaan / Universitas:</label>
                  <input
                    type="text"
                    placeholder="PT Telkom / Univ Prasetiya Mulya"
                    value={newTenantForm.institution}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, institution: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">Kontak Darurat (Emergency Contact):</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Nama Kontak"
                    value={newTenantForm.emergencyName}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, emergencyName: e.target.value })}
                    className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                  />
                  <select
                    value={newTenantForm.emergencyRel}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, emergencyRel: e.target.value })}
                    className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                  >
                    <option value="Orang Tua">Orang Tua</option>
                    <option value="Saudara Kandung">Saudara Kandung</option>
                    <option value="Suami / Istri">Suami / Istri</option>
                    <option value="Kerabat">Kerabat</option>
                  </select>
                  <input
                    type="text"
                    placeholder="No. Telp Darurat"
                    value={newTenantForm.emergencyPhone}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, emergencyPhone: e.target.value })}
                    className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Lease & Financial info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Tanggal Mulai Masuk:</label>
                  <input
                    type="date"
                    value={newTenantForm.startDate}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, startDate: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Durasi Sewa Awal:</label>
                  <select
                    value={newTenantForm.durationMonths}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, durationMonths: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value={1}>1 Bulan</option>
                    <option value={3}>3 Bulan</option>
                    <option value={6}>6 Bulan</option>
                    <option value={12}>12 Bulan (1 Tahun)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Uang Deposit Jaminan (Rp):</label>
                  <input
                    type="number"
                    value={newTenantForm.depositAmount}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, depositAmount: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="autorenew"
                  checked={newTenantForm.isAutoRenew}
                  onChange={(e) => setNewTenantForm({ ...newTenantForm, isAutoRenew: e.target.checked })}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="autorenew" className="text-slate-700 dark:text-slate-300 cursor-pointer">
                  Perpanjang kontrak sewa otomatis setiap bulan (Auto-Renew)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCheckInOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md shadow-xs"
                >
                  Konfirmasi Check-In
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
