'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ChevronDown, User, Mail, ShieldCheck } from 'lucide-react';
import envelopeImg from '@/assets/images/envelope.png';
import AppButton from '@/components/ui/AppButton';
import AppModal from '@/components/ui/AppModal';
import AppPill, { AppPillProps } from '@/components/ui/AppPill';

type Role = 'Trainer' | 'Mentor';

const ROLE_PILL_COLOR: Record<Role, NonNullable<AppPillProps['color']>> = {
  Trainer: 'success',
  Mentor: 'success',
};

export default function InviteUserPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: 'Ngozi Nmwanchukw',
    email: 'learner2@example.com',
    role: 'Trainer' as Role,
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

  const handleInviteAnother = () => {
    setIsSubmitted(false);
    setFormData({
      fullName: '',
      email: '',
      role: 'Trainer',
    });
  };

  return (
    <div className="mx-auto max-w-7xl">
      <Link
        href="/admin/user"
        className="b2-m mb-6 inline-flex items-center gap-2 text-primary hover:underline"
      >
        <ArrowLeft size={16} />
        <span>Back to users</span>
      </Link>

      <div className="rounded-card border border-disabled bg-background p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="h5-b text-text">Invite a Trainer or Mentor</h1>
          <p className="b2-r mt-1 text-muted">
            They will receive an email invitation to join KodeBuddy.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="b2-m text-text">
              Full name <span className="text-error">*</span>
            </label>

            <input
              type="text"
              placeholder="e.g Ngozi Nmwanchukw"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className="b2-r rounded-input border border-disabled px-4 py-3 text-text placeholder:text-muted focus:border-primary focus:outline-none"
            />

            <span className="f1-r text-muted">
              Enter the full name of the person you are inviting
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="b2-m text-text">
              Email address <span className="text-error">*</span>
            </label>

            <input
              type="email"
              placeholder="e.g 123@gmail.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="b2-r rounded-input border border-disabled px-4 py-3 text-text placeholder:text-muted focus:border-primary focus:outline-none"
            />

            <span className="f1-r text-muted">
              The invitation will be sent to this email.
            </span>
          </div>

          <div className="relative flex flex-col gap-1.5">
            <label className="b2-m text-text">
              Role <span className="text-error">*</span>
            </label>

            <div
              onClick={() => setIsOpen(!isOpen)}
              className="b2-r flex w-full cursor-pointer select-none items-center justify-between rounded-input border border-disabled bg-background px-4 py-3 text-text focus:border-primary"
            >
              <span>{formData.role || 'Select role'}</span>
              <ChevronDown size={16} className="text-muted" />
            </div>

            {isOpen && (
              <div className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-input border border-disabled bg-background p-1 shadow-lg">
                {(['Trainer', 'Mentor'] as Role[]).map((role) => (
                  <div
                    key={role}
                    onClick={() => {
                      setFormData({ ...formData, role });
                      setIsOpen(false);
                    }}
                    className={`cursor-pointer rounded-btn px-3.5 py-2.5 ${
                      formData.role === role
                        ? 'b2-b bg-primary text-background'
                        : 'b2-r text-text hover:bg-primary-light'
                    }`}
                  >
                    {role}
                  </div>
                ))}
              </div>
            )}

            <span className="f1-r text-muted">
              Select a role for this invitation
            </span>

            {error && <span className="f1-r text-error">{error}</span>}
          </div>

          {/* Actions */}
          <div className="mt-4 flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:items-center sm:justify-end">
            <Link href="/admin/user" className="w-full sm:w-auto">
              <AppButton
                variant="outlined"
                color="neutral"
                size="medium"
                radius="full"
                fullWidth
                className="sm:w-auto sm:min-w-40"
              >
                Cancel
              </AppButton>
            </Link>

            <AppButton
              type="submit"
              variant="contained"
              color="primary"
              size="medium"
              radius="full"
              fullWidth
              className="sm:w-auto sm:min-w-40"
            >
              Send invitation
            </AppButton>
          </div>
        </form>
      </div>

      <AppModal
        open={isSubmitted}
        onClose={() => setIsSubmitted(false)}
        width="1084px"
        height="auto"
        icon={
          <div className="relative h-30 w-34">
            <Image
              src={envelopeImg}
              alt="Envelope Success"
              fill
              className="object-contain"
              priority
            />
          </div>
        }
        title="Invitation sent successfully!"
        description="An invitation has been sent to the person below."
        secondaryButton={{
          label: 'Back to invitation',
          color: 'neutral',
          onClick: () => setIsSubmitted(false),
        }}
        primaryButton={{
          label: 'Invite another',
          color: 'primary',
          onClick: handleInviteAnother,
        }}
      >
    
        <div className="w-full divide-y divide-disabled rounded-card border border-disabled bg-background text-left">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3 text-muted">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-primary">
                <User size={18} />
              </div>

              <span className="b2-r">Invitee</span>
            </div>

            <span className="b2-b text-text">{formData.fullName}</span>
          </div>

          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3 text-muted">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-primary">
                <Mail size={18} />
              </div>

              <span className="b2-r">Email address</span>
            </div>

            <span className="b2-b text-primary">{formData.email}</span>
          </div>

          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3 text-muted">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-primary">
                <ShieldCheck size={18} />
              </div>

              <span className="b2-r">Role</span>
            </div>

            <AppPill label={formData.role} color={ROLE_PILL_COLOR[formData.role]} />
          </div>
        </div>
      </AppModal>
    </div>
  );
}
