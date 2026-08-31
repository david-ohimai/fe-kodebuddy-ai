'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  Copy,
  ExternalLink,
  MessageCirclePlus,
  Mic,
  Pencil,
  Plus,
  ThumbsDown,
  ThumbsUp,
  X,
} from 'lucide-react';
import { cx } from '@/lib/utils/cx';
import { useToast } from '@/components/ui/ToastProvider';
import {
  escalateToTrainer,
  isChatMocked,
  streamKodeBuddy,
} from '@/lib/api/chat.api';
import {
  ESCALATION_STAGES,
  type ChatContext,
  type ChatMessage,
  type EscalationStage,
} from '@/types/chat.types';

export interface KodeBuddyChatPanelProps {
  context: ChatContext;
  suggestions?: string[];
  /**
   * Asked automatically once, on mount. For entry points that collect the
   * question before the panel opens, such as the dashboard's quick ask.
   */
  initialQuestion?: string;
  onClose?: () => void;
  className?: string;
}

type PanelView = 'chat' | 'escalation';

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date
    .toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    .replace(' ', '');
}

function IconAction({
  label,
  onClick,
  children,
  className,
}: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cx(
        'inline-flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors',
        'hover:bg-primary-light hover:text-primary',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        className,
      )}
    >
      {children}
    </button>
  );
}

function EscalationProgress({ stage }: { stage: EscalationStage }) {
  const activeIndex = ESCALATION_STAGES.findIndex((s) => s.id === stage);

  return (
    <div className="mt-4">
      <div className="flex items-center">
        {ESCALATION_STAGES.map((step, index) => (
          <React.Fragment key={step.id}>
            {index > 0 && (
              <span
                className={cx(
                  'h-px flex-1',
                  index <= activeIndex ? 'bg-primary' : 'bg-disabled',
                )}
              />
            )}
            <span
              className={cx(
                'h-3 w-3 shrink-0 rounded-full',
                index <= activeIndex ? 'bg-primary' : 'bg-disabled',
              )}
            />
          </React.Fragment>
        ))}
      </div>

      <div className="mt-2 flex justify-between">
        {ESCALATION_STAGES.map((step, index) => (
          <span
            key={step.id}
            className={cx(
              index <= activeIndex ? 'f1-b text-primary' : 'f1-r text-muted',
            )}
          >
            {step.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function KodeBuddyChatPanel({
  context,
  suggestions = [],
  initialQuestion,
  onClose,
  className,
}: KodeBuddyChatPanelProps) {
  const { showSuccess, showError } = useToast();

  const [view, setView] = useState<PanelView>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [thinking, setThinking] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [focused, setFocused] = useState(false);

  const [escalationNote, setEscalationNote] = useState('');
  const [sendingEscalation, setSendingEscalation] = useState(false);
  const [escalationStage, setEscalationStage] =
    useState<EscalationStage | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isEmpty = messages.length === 0 && !thinking;

  useEffect(() => {
    if (view !== 'chat') return;
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, thinking, streamingText, view]);

  const send = useCallback(
    async (text: string) => {
      const question = text.trim();
      if (!question || thinking) return;

      const now = new Date().toISOString();
      const userTurn: ChatMessage = {
        id: `local-${Date.now()}`,
        role: 'user',
        content: question,
        timestamp: now,
        status: 'sent',
      };

      setMessages((prev) => [...prev, userTurn]);
      setDraft('');
      setThinking(true);
      setStreamingText('');

      try {
        const answer = await streamKodeBuddy(
          {
            question,
            courseId: context.courseId,
            moduleId: context.moduleId,
            assignmentId: context.assignmentId,
            queryType: context.assignmentId ? 'assignment_guidance' : 'chat',
          },
          {
            onToken: (text) => setStreamingText((prev) => prev + text),
          },
        );

        setMessages((prev) => [
          ...prev,
          {
            id: answer.messageId,
            role: 'assistant',
            content: answer.answer,
            timestamp: answer.createdAt,
            status: 'sent',
            resources: answer.resources,
            offersEscalation: answer.offersEscalation,
            escalated: answer.escalated,
            escalationId: answer.escalationId,
          },
        ]);
        setStreamingText('');
      } catch {
        setStreamingText('');
        setMessages((prev) =>
          prev.map((m) =>
            m.id === userTurn.id ? { ...m, status: 'failed' } : m,
          ),
        );
        showError(
          'Could not reach KodeBuddy',
          'Your question was not sent. Check your connection and try again.',
        );
      } finally {
        setThinking(false);
      }
    },
    [context, thinking, showError],
  );

  /**
   * Asks the question the panel was opened with, exactly once.
   *
   * Deferred by a timeout rather than called straight from the effect: `send`
   * updates state synchronously, and doing that during an effect's commit
   * triggers a cascading render.
   */
  const autoAskedRef = useRef(false);
  useEffect(() => {
    const question = initialQuestion?.trim();
    if (!question || autoAskedRef.current) return;
    autoAskedRef.current = true;

    const timer = window.setTimeout(() => void send(question), 0);
    return () => window.clearTimeout(timer);
  }, [initialQuestion, send]);

  const openEscalation = useCallback(() => {
    setEscalationNote((current) => current || draft.trim());
    setView('escalation');
  }, [draft]);

  const submitEscalation = useCallback(async () => {
    const note = escalationNote.trim();
    if (!note || sendingEscalation) return;

    setSendingEscalation(true);
    try {
      const receipt = await escalateToTrainer({
        question: note,
        courseId: context.courseId,
        moduleId: context.moduleId,
        assignmentId: context.assignmentId,
      });
      setEscalationStage(receipt.stage);
      setDraft('');
    } catch {
      showError(
        'Could not reach your trainer',
        'Please try again in a moment.',
      );
    } finally {
      setSendingEscalation(false);
    }
  }, [escalationNote, sendingEscalation, context, showError]);

  const handleCopy = useCallback(
    (text: string) => {
      navigator.clipboard
        ?.writeText(text)
        .then(() => showSuccess('Copied', 'Message copied to your clipboard.'))
        .catch(() =>
          showError('Copy failed', 'Your browser blocked clipboard access.'),
        );
    },
    [showSuccess, showError],
  );

  const startNewChat = useCallback(() => {
    setMessages([]);
    setDraft('');
    setEscalationNote('');
    setEscalationStage(null);
    setView('chat');
    inputRef.current?.focus();
  }, []);

  const chatNotes =
    [...messages].reverse().find((m) => m.role === 'user')?.content ??
    "Kodebuddy's notes from your chat";

  return (
    <section
      aria-label="KodeBuddy AI assistant"
      className={cx(
        'flex h-full min-h-0 flex-col rounded-card border border-disabled bg-background',
        className,
      )}
    >
      <header className="flex items-center justify-between px-5 pt-5">
        <h2 className="b1-b">
          <span className="text-primary">Kode</span>
          <span className="text-secondary">Buddy AI</span>
        </h2>

        <div className="flex items-center gap-1">
          <IconAction label="Start a new chat" onClick={startNewChat}>
            <MessageCirclePlus size={18} className="text-primary" />
          </IconAction>
          {onClose && (
            <IconAction label="Close assistant" onClick={onClose}>
              <X size={18} className="text-primary" />
            </IconAction>
          )}
        </div>
      </header>

      {view === 'escalation' ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-4">
          <button
            type="button"
            onClick={() => setView('chat')}
            className="mb-4 inline-flex w-fit items-center gap-2 b2-m text-primary underline underline-offset-2"
          >
            <ArrowLeft size={16} />
            Back to Chat
          </button>

          <div className="rounded-card border border-disabled p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="f1-b tracking-widest text-text-secondary">
                HUMAN ESCALATION
              </p>
              <span className="shrink-0 rounded-full border border-primary px-2.5 py-1 f2-b tracking-wide text-primary">
                {context.label}
              </span>
            </div>

            <h3 className="b1-b mt-4 text-text">
              Let&apos;s get you some help
            </h3>
            <p className="b2-r mt-1 text-text-secondary">
              A trainer typically responds within a few hours
            </p>

            <div className="mt-4 rounded-btn border border-disabled px-4 py-3">
              <p className="b2-r line-clamp-2 text-text-secondary">
                {chatNotes}
              </p>
            </div>

            <label
              htmlFor="escalation-note"
              className="b2-m mt-5 block text-text"
            >
              What&apos;s going on?
            </label>
            <textarea
              id="escalation-note"
              rows={7}
              value={escalationNote}
              disabled={escalationStage !== null}
              onChange={(e) => setEscalationNote(e.target.value)}
              placeholder="Tell your trainer what you've tried and where you're stuck..."
              className={cx(
                'mt-2 w-full resize-none rounded-btn border px-4 py-3 b2-r outline-none transition-colors',
                'placeholder:text-muted',
                escalationStage !== null
                  ? 'border-disabled text-text-secondary'
                  : 'border-disabled text-text focus:border-primary',
              )}
            />

            <button
              type="button"
              onClick={submitEscalation}
              disabled={
                !escalationNote.trim() ||
                sendingEscalation ||
                escalationStage !== null
              }
              className={cx(
                'mt-5 w-full rounded-full py-3.5 b1-b transition-colors',
                escalationNote.trim() &&
                  !sendingEscalation &&
                  escalationStage === null
                  ? 'bg-primary text-white hover:bg-primary-dark'
                  : 'bg-primary-light text-muted',
              )}
            >
              {sendingEscalation ? 'Sending…' : 'Send to trainer'}
            </button>
          </div>

          {escalationStage && (
            <div className="mt-5 rounded-card border border-disabled p-5">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={20} className="shrink-0 text-secondary" />
                <p className="b1-m text-text">
                  Got it! A trainer will follow up soon.
                </p>
              </div>
              <EscalationProgress stage={escalationStage} />
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="px-5 pt-4">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full border border-primary px-3 py-1.5 f1-b tracking-wide text-primary"
            >
              {context.label}
              <ChevronDown size={14} />
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-6"
          >
            {isEmpty ? (
              <div className="flex flex-1 items-center">
                <p className="h5-b text-text">
                  Hey! I&apos;m here to help. What are you stuck on?
                </p>
              </div>
            ) : (
              <>
                {messages.map((message) =>
                  message.role === 'user' ? (
                    <div
                      key={message.id}
                      className="flex flex-col items-end gap-1"
                    >
                      <div
                        className={cx(
                          'max-w-[85%] rounded-2xl px-4 py-2.5 b2-r text-text',
                          message.status === 'failed'
                            ? 'bg-error-light'
                            : 'bg-primary-light',
                        )}
                      >
                        {message.content}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="f1-r text-muted">
                          {formatTime(message.timestamp)}
                        </span>
                        <IconAction
                          label="Edit message"
                          onClick={() => setDraft(message.content)}
                        >
                          <Pencil size={13} />
                        </IconAction>
                        <IconAction
                          label="Copy message"
                          onClick={() => handleCopy(message.content)}
                        >
                          <Copy size={13} />
                        </IconAction>
                      </div>
                      {message.status === 'failed' && (
                        <button
                          type="button"
                          onClick={() => send(message.content)}
                          className="f1-b text-error hover:underline"
                        >
                          Not sent — retry
                        </button>
                      )}
                    </div>
                  ) : (
                    <div key={message.id} className="flex flex-col gap-3">
                      <p className="b2-r whitespace-pre-line text-text">
                        {message.content}
                      </p>

                      {message.resources && message.resources.length > 0 && (
                        <div>
                          <p className="b2-r text-text">
                            Resources that might help:
                          </p>
                          <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5">
                            {message.resources.map((resource) => (
                              <li key={resource.url} className="b2-r">
                                <Link
                                  href={resource.url}
                                  target={
                                    resource.url.startsWith('http')
                                      ? '_blank'
                                      : undefined
                                  }
                                  className="inline-flex items-center gap-1 text-text underline underline-offset-2 hover:text-primary"
                                >
                                  {resource.label}
                                  <ExternalLink size={12} />
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {message.offersEscalation && (
                        <p className="b2-r text-text">
                          Still not landing? That&apos;s completely okay — some
                          things are easier to grasp with a real walkthrough.{' '}
                          <button
                            type="button"
                            onClick={openEscalation}
                            className="b2-m text-primary hover:underline"
                          >
                            Ask a Trainer
                          </button>
                        </p>
                      )}

                      {message.escalated && (
                        <p className="f1-b text-warning-dark">
                          Passed on to your trainer
                        </p>
                      )}

                      <div className="flex items-center gap-1">
                        <IconAction
                          label="Copy answer"
                          onClick={() => handleCopy(message.content)}
                        >
                          <Copy size={14} />
                        </IconAction>
                        <IconAction label="Helpful">
                          <ThumbsUp size={14} />
                        </IconAction>
                        <IconAction label="Not helpful">
                          <ThumbsDown size={14} />
                        </IconAction>
                        <span className="f1-r ml-1 text-muted">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                    </div>
                  ),
                )}

                {thinking &&
                  (streamingText ? (
                    <p className="b2-r whitespace-pre-line text-text">
                      {streamingText}
                      <span className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-pulse bg-primary align-middle" />
                    </p>
                  ) : (
                    <p className="b2-r text-muted">Thinking...</p>
                  ))}
              </>
            )}
          </div>

          {/* Composer */}
          <div className="px-5 pb-5">
            {isEmpty && suggestions.length > 0 && (
              <div className="mb-3">
                <p className="b2-r mb-2 text-text-secondary">
                  Quick suggestions:
                </p>
                <div className="flex flex-col items-start gap-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => send(suggestion)}
                      className="rounded-full border border-disabled px-3.5 py-2 f1-r text-text-secondary transition-colors hover:border-primary hover:text-primary"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div
              className={cx(
                'rounded-2xl border px-4 pt-3 pb-2.5 transition-colors',
                focused
                  ? 'border-primary bg-primary-light/40'
                  : 'border-disabled bg-primary-light/20',
              )}
            >
              <textarea
                ref={inputRef}
                rows={1}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send(draft);
                  }
                }}
                placeholder="Ask about this assignment..."
                className="max-h-32 w-full resize-none bg-transparent b2-r text-text outline-none placeholder:text-muted"
              />

              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={openEscalation}
                  className="rounded-full border border-primary px-3 py-1.5 f1-b tracking-wide text-primary transition-colors hover:bg-primary-light"
                >
                  ASK A TRAINER
                </button>

                <IconAction label="Add an attachment">
                  <Plus size={18} />
                </IconAction>

                <span className="flex-1" />

                <span className="b2-r text-text-secondary">Auto</span>

                <IconAction label="Dictate your question">
                  <Mic size={16} />
                </IconAction>

                <button
                  type="button"
                  aria-label="Send question"
                  onClick={() => send(draft)}
                  disabled={!draft.trim() || thinking}
                  className={cx(
                    'inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors',
                    draft.trim() && !thinking
                      ? 'bg-primary text-white hover:bg-primary-dark'
                      : 'border border-muted/50 text-muted',
                  )}
                >
                  <ArrowUp size={18} />
                </button>
              </div>
            </div>

            {isChatMocked() && (
              <p className="f2-r mt-2 text-muted">
                Demo mode — answers are canned. The backend chat endpoint is not
                live yet.
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
