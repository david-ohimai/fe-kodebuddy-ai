'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, User, Mail, ShieldCheck } from 'lucide-react';
import envelopeImg from '@/assets/images/envelope.png';
import AppButton from '@/components/ui/AppButton';
import AppInput from '@/components/ui/AppInput';
import AppDropdown from '@/components/ui/AppDropdown';

const ROLE_OPTIONS = [
  { label: 'Select role', value: '' },
  { label: 'Trainer', value: 'Trainer' },
  { label: 'Mentor', value: 'Mentor' },
];

export default function InviteUser() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: '',
  });
  const [roleError, setRoleError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.role) {
      setRoleError('Select a role for this invitation');
      return;
    }
    setRoleError('');
    setIsSubmitted(true);
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Link
        href="/admin/users"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft size={16} />
        <span>Back to users</span>
      </Link>

      <div className="rounded-xl border border-disabled bg-white p-5 shadow-sm sm:p-8">
        {isSubmitted ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="relative mb-6 h-30 w-34">
              <Image
                src={envelopeImg}
                alt="Envelope Success"
                fill
                className="object-contain"
                priority
              />
            </div>

            <h2 className="text-2xl font-semibold text-text">
              Invitation sent successfully!
            </h2>
            <p className="mt-1 text-sm text-muted">
              An invitation has been sent to the person below.
            </p>

            <div className="mt-6 w-full max-w-md divide-y divide-disabled rounded-xl border border-disabled bg-white text-left">
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <div className="flex items-center gap-3 text-muted">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-primary">
                    <User size={18} />
                  </div>
                  <span>Invitee</span>
                </div>
                <span className="font-medium text-text">
                  {formData.fullName}
                </span>
              </div>

              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <div className="flex items-center gap-3 text-muted">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-primary">
                    <Mail size={18} />
                  </div>
                  <span>Email address</span>
                </div>
                <span className="font-medium text-primary">
                  {formData.email}
                </span>
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

            <div className="mt-8 flex w-full max-w-md flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <AppButton
                href="/admin/users"
                variant="outlined"
                color="neutral"
                radius="full"
                fullWidth
                className="sm:flex-1"
              >
                Back to users
              </AppButton>
              <AppButton
                variant="contained"
                radius="full"
                fullWidth
                className="sm:flex-1"
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({ fullName: '', email: '', role: '' });
                }}
              >
                Invite another
              </AppButton>
            </div>

            <span className="mt-4 text-xs text-muted">
              You can invite more trainers and more mentors anytime
            </span>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-xl font-semibold text-text">
                Invite a Trainer or Mentor
              </h1>
              <p className="mt-1 text-sm text-muted">
                They will receive an email invitation to join KodeBuddy.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <AppInput
                label={
                  <>
                    Full name <span className="text-red-500">*</span>
                  </>
                }
                placeholder="e.g Ngozi Nwanchukwu"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                hint="Enter the full name of the person you are inviting"
                required
              />

              <AppInput
                label={
                  <>
                    Email address <span className="text-red-500">*</span>
                  </>
                }
                type="email"
                placeholder="e.g name@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                hint="The invitation will be sent to this email."
                required
              />

              <div className="flex flex-col gap-1.5">
                <label className="b2-m text-text">
                  Role <span className="text-red-500">*</span>
                </label>
                <AppDropdown
                  value={formData.role}
                  options={ROLE_OPTIONS}
                  onChange={(role) => {
                    setFormData({ ...formData, role });
                    if (role) setRoleError('');
                  }}
                  ariaLabel="Role"
                  className="w-full [&_select]:w-full [&_select]:py-3"
                />
                <span
                  className={roleError ? 'f1-r text-error' : 'f1-r text-muted'}
                >
                  {roleError || 'Select a role for this invitation'}
                </span>
              </div>

              <div className="mt-4 flex flex-col-reverse items-center gap-3 pt-4 sm:flex-row sm:justify-end">
                <AppButton
                  href="/admin/users"
                  variant="outlined"
                  color="neutral"
                  radius="full"
                  fullWidth
                  className="sm:w-auto"
                >
                  Cancel
                </AppButton>
                <AppButton
                  type="submit"
                  variant="contained"
                  radius="full"
                  fullWidth
                  className="sm:w-auto"
                >
                  Send invitation
                </AppButton>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
