import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Client, ClientContact } from '../types';
import {
  Building2,
  Users,
  Phone,
  Mail,
  MapPin,
  Globe,
  Plus,
  ChevronRight,
  FolderKanban,
  Edit2,
} from 'lucide-react';
import { getStatusBadgeClass, formatKRW } from '../utils/formatters';

export const ClientsList: React.FC = () => {
  const { clients, projects, addClient, setActiveProjectId, setCurrentView } = useApp();

  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [showAddClientModal, setShowAddClientModal] = useState(false);

  const selectedClient = clients.find((c) => c.id === selectedClientId) || clients[0];
  const clientProjects = projects.filter((p) => p.clientId === selectedClient?.id);

  // Form state for new client
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactTitle, setContactTitle] = useState('');
  const [contactDept, setContactDept] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [notes, setNotes] = useState('');

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    const newC = addClient({
      companyName: companyName.trim(),
      contacts: [
        {
          id: `contact-${Date.now()}`,
          name: contactName.trim() || '담당자',
          title: contactTitle.trim() || '매니저',
          department: contactDept.trim() || '구매/시설팀',
          phone: contactPhone.trim(),
          email: contactEmail.trim(),
          isPrimary: true,
        },
      ],
      address: address.trim(),
      website: website.trim(),
      notes: notes.trim(),
    });

    setSelectedClientId(newC.id);
    setShowAddClientModal(false);
    // Reset form
    setCompanyName('');
    setContactName('');
    setContactTitle('');
    setContactDept('');
    setContactPhone('');
    setContactEmail('');
    setAddress('');
    setWebsite('');
    setNotes('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">고객사 관리 (Clients)</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            B2B 법인 클라이언트 및 다중 담당자 연락처, 연계 프로젝트 이력을 통합 관리합니다.
          </p>
        </div>
        <button
          onClick={() => setShowAddClientModal(true)}
          className="inline-flex items-center gap-1.5 rounded-md bg-neutral-900 px-3.5 py-2 text-xs font-medium text-white shadow-xs hover:bg-neutral-800 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          신규 고객사 등록
        </button>
      </div>

      {/* Main 2-column layout: Client list on left, Client detail & associated projects on right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Client list */}
        <div className="md:col-span-4 space-y-2">
          <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-1">
            등록된 고객사 ({clients.length})
          </h3>
          <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-xs">
            {clients.map((client) => {
              const pCount = projects.filter((p) => p.clientId === client.id).length;
              const isSelected = client.id === selectedClient?.id;
              const primaryContact = client.contacts.find((c) => c.isPrimary) || client.contacts[0];

              return (
                <div
                  key={client.id}
                  onClick={() => setSelectedClientId(client.id)}
                  className={`p-3.5 cursor-pointer transition-colors ${
                    isSelected ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-50 text-neutral-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs tracking-tight">{client.companyName}</span>
                    <span
                      className={`text-[10px] rounded px-1.5 py-0.5 font-medium ${
                        isSelected ? 'bg-neutral-800 text-neutral-200' : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      프로젝트 {pCount}개
                    </span>
                  </div>
                  {primaryContact && (
                    <div
                      className={`text-[11px] mt-1 flex items-center gap-2 ${
                        isSelected ? 'text-neutral-300' : 'text-neutral-500'
                      }`}
                    >
                      <span>{primaryContact.name} {primaryContact.title}</span>
                      <span>·</span>
                      <span>{primaryContact.department}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Client Details & Projects */}
        {selectedClient && (
          <div className="md:col-span-8 space-y-6">
            {/* Client Info Card */}
            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-start justify-between border-b border-neutral-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-neutral-600" />
                    <h2 className="text-base font-bold text-neutral-900">{selectedClient.companyName}</h2>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">{selectedClient.notes || '등록된 메모 없음'}</p>
                </div>
              </div>

              {/* Company Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {selectedClient.address && (
                  <div className="flex items-center gap-2 text-neutral-600">
                    <MapPin className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                    <span className="truncate">{selectedClient.address}</span>
                  </div>
                )}
                {selectedClient.website && (
                  <div className="flex items-center gap-2 text-neutral-600">
                    <Globe className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                    <a
                      href={selectedClient.website}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline text-blue-600 truncate"
                    >
                      {selectedClient.website}
                    </a>
                  </div>
                )}
              </div>

              {/* Contacts section (multiple contacts support) */}
              <div className="pt-3 border-t border-neutral-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-neutral-900 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-neutral-500" />
                    담당자 목록 ({selectedClient.contacts.length}명)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedClient.contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="rounded-lg border border-neutral-200 bg-neutral-50/60 p-3 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-neutral-900">
                          {contact.name}{' '}
                          <span className="text-[11px] font-normal text-neutral-500">
                            ({contact.title})
                          </span>
                        </span>
                        {contact.isPrimary && (
                          <span className="rounded bg-neutral-200 px-1.5 py-0.2 text-[9px] font-medium text-neutral-700">
                            주 담당자
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-500">{contact.department}</div>
                      {contact.phone && (
                        <div className="flex items-center gap-1.5 text-neutral-600 text-[11px]">
                          <Phone className="h-3 w-3 text-neutral-400" />
                          <span>{contact.phone}</span>
                        </div>
                      )}
                      {contact.email && (
                        <div className="flex items-center gap-1.5 text-neutral-600 text-[11px]">
                          <Mail className="h-3 w-3 text-neutral-400" />
                          <span>{contact.email}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Associated Projects Section */}
            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2">
                  <FolderKanban className="h-4 w-4 text-neutral-600" />
                  <h3 className="text-sm font-semibold text-neutral-900">
                    {selectedClient.companyName} 연계 프로젝트 ({clientProjects.length})
                  </h3>
                </div>
              </div>

              {clientProjects.length === 0 ? (
                <p className="text-xs text-neutral-400 py-4 text-center">등록된 프로젝트가 없습니다.</p>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {clientProjects.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setActiveProjectId(p.id);
                        setCurrentView('project-detail');
                      }}
                      className="py-3 flex items-center justify-between hover:bg-neutral-50/70 px-2 rounded cursor-pointer transition-colors group"
                    >
                      <div>
                        <div className="font-semibold text-xs text-neutral-900 group-hover:text-neutral-950 flex items-center gap-2">
                          {p.name}
                          <span
                            className={`rounded-full px-2 py-0.2 text-[10px] border ${getStatusBadgeClass(
                              p.status
                            )}`}
                          >
                            {p.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-500 mt-0.5">
                          현장: {p.siteName} · 최신 견적: {formatKRW(p.latestQuoteAmount)}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-neutral-900" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      {showAddClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl border border-neutral-200">
            <h2 className="text-base font-bold text-neutral-900 mb-1">신규 고객사 등록</h2>
            <p className="text-xs text-neutral-500 mb-4">
              회사 기본 정보 및 1차 담당자 연락처를 등록합니다.
            </p>

            <form onSubmit={handleCreateClient} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  회사명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: (주)카카오엔터프라이즈"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">담당자 성명</label>
                  <input
                    type="text"
                    placeholder="예: 홍길동"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">직책 / 부서</label>
                  <input
                    type="text"
                    placeholder="예: 구매총괄팀 팀장"
                    value={contactTitle}
                    onChange={(e) => setContactTitle(e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">연락처</label>
                  <input
                    type="text"
                    placeholder="010-0000-0000"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">이메일</label>
                  <input
                    type="email"
                    placeholder="contact@company.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">회사 주소</label>
                <input
                  type="text"
                  placeholder="서울특별시 강남구 테헤란로..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">홈페이지</label>
                <input
                  type="text"
                  placeholder="https://company.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">메모</label>
                <textarea
                  rows={2}
                  placeholder="클라이언트 특이사항 또는 상담 비고"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowAddClientModal(false)}
                  className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-neutral-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-neutral-800"
                >
                  등록 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
