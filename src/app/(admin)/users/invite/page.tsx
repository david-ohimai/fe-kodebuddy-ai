'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ChevronDown, User, Mail, ShieldCheck } from 'lucide-react';
import envelopeImg from '@/assets/images/envelope.png';

export default function InviteUserPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: 'Ngozi Nmwanchukw',
    email: 'learner2@example.com',
    role: 'Trainer',
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.role) {
      setError('Select a role for this invitation');
      return;
    }
    setError('');
    setIsSubmitted(true);
  };

  return (
    <div className="max-w-3xl mx-auto">
      
      <Link
        href="/users"
        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline mb-6"
      >
        <ArrowLeft size={16} />
        <span>Back to users</span>
      </Link>

      <div className="bg-white rounded-xl border border-disabled p-8 shadow-sm">
        {isSubmitted ? (
          /* Success Screen */
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-6 relative h-30 w-34">
              <Image
                src={envelopeImg}
                alt="Envelope Success"
                fill
                className="object-contain"
                priority
              />
            </div>

            <h2 className="text-2xl font-semibold text-[#1F2937]">Invitation sent successfully!</h2>
            <p className="mt-1 text-sm text-muted">
              An invitation has been sent to the person below.
            </p>

            {/* Details Summary Card */}
            <div className="w-full max-w-md mt-6 rounded-xl border border-disabled bg-white divide-y divide-disabled text-left">
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <div className="flex items-center gap-3 text-muted">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-primary">
                    <User size={18} />
                  </div>
                  <span>Invitee</span>
                </div>
                <span className="font-medium text-[#1F2937]">{formData.fullName}</span>
              </div>

              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <div className="flex items-center gap-3 text-muted">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-primary">
                    <Mail size={18} />
                  </div>
                  <span>Email address</span>
                </div>
                <span className="font-medium text-primary">{formData.email}</span>
              </div>

              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <div className="flex items-center gap-3 text-muted">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-primary">
                    <ShieldCheck size={18} />
                  </div>
                  <span>Role</span>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                  {formData.role}
                </span>
              </div>
            </div>

          
            <div className="mt-8 flex items-center justify-center gap-4 w-full max-w-md">
              <Link
                href="/users"
                className="flex-1 rounded-full border border-disabled px-6 py-2.5 text-sm font-medium text-[#1F2937] hover:bg-gray-50 transition-colors text-center"
              >
                Back to invitation
              </Link>
              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({ fullName: '', email: '', role: 'Trainer' });
                }}
                className="flex-1 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 shadow-sm text-center"
              >
                Invite another
              </button>
            </div>

            <span className="mt-4 text-xs text-muted">
              You can invite more trainers and more mentor anytime
            </span>
          </div>
        ) : (
          <>
        
            <div className="mb-6">
              <h1 className="text-xl font-semibold text-[#1F2937]">Invite a Trainer or Mentor</h1>
              <p className="mt-1 text-sm text-muted">
                They will receive an email invitation to join KodeBuddy.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#1F2937]">
                  Full name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g Ngozi Nmwanchukw"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="rounded-lg border border-disabled px-4 py-3 text-sm text-[#1F2937] placeholder:text-gray-400 focus:border-primary focus:outline-none"
                />
                <span className="text-xs text-muted">Enter the full name of the person you are inviting</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#1F2937]">
                  Email address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g 123@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="rounded-lg border border-disabled px-4 py-3 text-sm text-[#1F2937] placeholder:text-gray-400 focus:border-primary focus:outline-none"
                />
                <span className="text-xs text-muted">The invitation will be sent to this email.</span>
              </div>

              <div className="flex flex-col gap-1.5 relative">
                <label className="text-sm font-medium text-[#1F2937]">
                  Role <span className="text-red-500">*</span>
                </label>
                
                <div
                  onClick={() => setIsOpen(!isOpen)}
                  className="w-full flex items-center justify-between rounded-lg border border-disabled bg-white px-4 py-3 text-sm text-[#1F2937] cursor-pointer select-none focus:border-primary"
                >
                  <span>{formData.role || 'Select role'}</span>
                  <ChevronDown size={16} className="text-muted" />
                </div>

                {/* Dropdown Menu */}
                {isOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-10 bg-white rounded-lg border border-disabled shadow-lg overflow-hidden p-1">
                    <div
                      onClick={() => {
                        setFormData({ ...formData, role: 'Trainer' });
                        setIsOpen(false);
                      }}
                      className={`px-3.5 py-2.5 text-sm rounded-md cursor-pointer ${
                        formData.role === 'Trainer'
                          ? 'bg-primary text-white font-medium'
                          : 'text-[#1F2937] hover:bg-gray-100'
                      }`}
                    >
                      Trainer
                    </div>
                    <div
                      onClick={() => {
                        setFormData({ ...formData, role: 'Mentor' });
                        setIsOpen(false);
                      }}
                      className={`px-3.5 py-2.5 text-sm rounded-md cursor-pointer ${
                        formData.role === 'Mentor'
                          ? 'bg-primary text-white font-medium'
                          : 'text-[#1F2937] hover:bg-gray-100'
                      }`}
                    >
                      Mentor
                    </div>
                  </div>
                )}

                <span className="text-xs text-muted">Select a role for this invitation</span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 mt-4 pt-4">
                <Link
                  href="/users"
                  className="rounded-full border border-disabled px-6 py-2.5 text-sm font-medium text-[#1F2937] hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="rounded-full cursor-pointer bg-primary px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 shadow-sm"
                >
                  Send invitation
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}