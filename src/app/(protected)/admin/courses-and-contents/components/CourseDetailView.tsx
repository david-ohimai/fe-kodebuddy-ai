'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Info,
  MoreVertical,
  Pencil,
  Plus,
  Send,
  AlertTriangle,
} from 'lucide-react';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import AppButton from '@/components/ui/AppButton';
import AppPill from '@/components/ui/AppPill';
import { AppCard } from '@/components/ui/AppCard';
import AppEmptyState from '@/components/ui/AppEmptyState';
import AppConfirmModal from '@/components/ui/AppConfirmModal';
import AddModuleModal from './AddModuleModal';
import AddLessonModal from './AddLessonModal';
import EditLessonModal, { type LessonToEdit } from './EditLessonModal';
import {
  CONTENT_TYPE_META,
  type LessonContentType,
} from '@/types/lesson-content.types';
import { useToast } from '@/components/ui/ToastProvider';
import noModules from '@/assets/images/no-modules.webp';
import noLessons from '@/assets/images/no-lessons.webp';

export interface CourseOverview {
  title: string;
  status: 'draft' | 'published';
  modules: number;
  lessons: number;
  lastUpdated: string;
  createdBy: string;
  description?: string;
}

interface Lesson {
  id: string;
  title: string;
  description?: string;
  contentType: LessonContentType;
  fileName?: string;
  fileSize?: string;
}

interface CourseModule {
  id: string;
  title: string;
  description?: string;
  lessons: Lesson[];
}

interface CourseDetailsViewProps {
  course: CourseOverview;
  onBack: () => void;
  onEditCourse: () => void;
  onAddDescription: () => void;
}

const STATUS_LABEL: Record<CourseOverview['status'], string> = {
  draft: 'Draft',
  published: 'Published',
};

function StatusPill({ status }: { status: CourseOverview['status'] }) {
  return (
    <AppPill
      label={STATUS_LABEL[status]}
      color={status === 'published' ? 'success' : 'default'}
    />
  );
}

function LessonMenu({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Lesson options"
        className="text-muted hover:text-text"
      >
        <MoreVertical size={18} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-md border border-disabled bg-background py-1 shadow-lg">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
              className="b2-r w-full px-3.5 py-2 text-left text-text hover:bg-primary-light"
            >
              Edit Lesson
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
              className="b2-r w-full px-3.5 py-2 text-left text-error hover:bg-error-light"
            >
              Delete Lesson
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const CourseDetailsView: React.FC<CourseDetailsViewProps> = ({
  course,
  onBack,
  onEditCourse,
  onAddDescription,
}) => {
  const { showSuccess } = useToast();

  const [status, setStatus] = useState<CourseOverview['status']>(course.status);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [lessonModuleId, setLessonModuleId] = useState<string | null>(null);
  const [isPublishConfirmOpen, setIsPublishConfirmOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<{
    moduleId: string;
    lesson: LessonToEdit;
  } | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<{
    moduleId: string;
    lessonId: string;
    lessonTitle: string;
  } | null>(null);

  const handleAddModule = (data: { title: string; description?: string }) => {
    const newModule: CourseModule = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description,
      lessons: [],
    };

    setModules((prev) => [...prev, newModule]);
    setIsAddModuleOpen(false);
    showSuccess('Module added.', `"${data.title}" was added to this course.`);
  };

  const handleAddLesson = (data: {
    title: string;
    description?: string;
    contentType: LessonContentType;
    file?: File;
    fileName?: string;
    fileSize?: string;
  }) => {
    if (!lessonModuleId) return;

    const newLesson: Lesson = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description,
      contentType: data.contentType,
      fileName: data.fileName,
      fileSize: data.fileSize,
    };

    setModules((prev) =>
      prev.map((module) =>
        module.id === lessonModuleId
          ? { ...module, lessons: [...module.lessons, newLesson] }
          : module,
      ),
    );

    setLessonModuleId(null);
    showSuccess('Lesson added.', `"${data.title}" was added to this module.`);
  };

  const handleSaveLessonEdit = (data: {
    id: string;
    title: string;
    description?: string;
    fileName?: string;
    fileSize?: string;
  }) => {
    if (!editingLesson) return;

    setModules((prev) =>
      prev.map((module) =>
        module.id === editingLesson.moduleId
          ? {
              ...module,
              lessons: module.lessons.map((lesson) =>
                lesson.id === data.id
                  ? {
                      ...lesson,
                      title: data.title,
                      description: data.description,
                      fileName: data.fileName,
                      fileSize: data.fileSize,
                    }
                  : lesson,
              ),
            }
          : module,
      ),
    );

    setEditingLesson(null);
    showSuccess('Lesson updated.', `"${data.title}" has been saved.`);
  };

  const handleConfirmDeleteLesson = () => {
    if (!deletingLesson) return;

    setModules((prev) =>
      prev.map((module) =>
        module.id === deletingLesson.moduleId
          ? {
              ...module,
              lessons: module.lessons.filter(
                (l) => l.id !== deletingLesson.lessonId,
              ),
            }
          : module,
      ),
    );

    showSuccess(
      'Lesson deleted.',
      `"${deletingLesson.lessonTitle}" was removed.`,
    );
    setDeletingLesson(null);
  };

  const handleConfirmPublish = () => {
    setStatus('published');
    setIsPublishConfirmOpen(false);
    showSuccess(
      'Course published successfully.',
      `"${course.title}" is now live.`,
    );
  };

  const activeModuleForLesson = modules.find((m) => m.id === lessonModuleId);
  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={onBack}
        className="b2-m inline-flex w-fit items-center gap-1.5 text-primary hover:underline"
      >
        <ArrowLeft size={16} />
        Back to content &amp; courses
      </button>

      <AppCard>
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="h5-b text-text">{course.title}</h2>
              <StatusPill status={status} />
            </div>
            <div className="flex items-center gap-3">
              <AppButton
                variant="outlined"
                size="small"
                radius="full"
                startIcon={<Pencil size={14} />}
                onClick={onEditCourse}
              >
                Edit course
              </AppButton>
              <AppButton
                size="small"
                radius="full"
                startIcon={<Send size={14} />}
                disabled={modules.length === 0 || status === 'published'}
                onClick={() => setIsPublishConfirmOpen(true)}
              >
                Publish course
              </AppButton>
            </div>
          </div>

          <div className="flex gap-3 rounded-input bg-primary-light p-4">
            <Info size={18} className="mt-0.5 shrink-0 text-primary" />
            <p className="b2-r text-text">
              This course is in draft mode. Add modules and lessons to build
              your course content before publishing.
            </p>
          </div>
        </div>
      </AppCard>

      <AppCard>
        <div className="flex flex-col">
          <div>
            <p className="b2-b mb-4 text-text">Course overview</p>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-5">
              <div>
                <p className="f1-r text-muted">Status</p>
                <div className="mt-1">
                  <StatusPill status={status} />
                </div>
              </div>
              <div>
                <p className="f1-r text-muted">Modules</p>
                <p className="b1-m mt-1 text-text">{modules.length}</p>
              </div>
              <div>
                <p className="f1-r text-muted">Lessons</p>
                <p className="b1-m mt-1 text-text">{totalLessons}</p>
              </div>
              <div>
                <p className="f1-r text-muted">Last updated</p>
                <p className="b1-m mt-1 text-text">{course.lastUpdated}</p>
              </div>
              <div>
                <p className="f1-r text-muted">Created by</p>
                <p className="b1-m mt-1 text-text">{course.createdBy}</p>
              </div>
            </div>
          </div>

          <div className="my-6 border-t border-disabled" />

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="b2-b text-text">Course description</p>
              <AppButton
                variant="outlined"
                size="small"
                radius="full"
                startIcon={<Plus size={14} />}
                onClick={onAddDescription}
              >
                Add description
              </AppButton>
            </div>
            <p className="b2-r text-muted">
              {course.description || 'No description added yet.'}
            </p>
          </div>
        </div>
      </AppCard>

      {modules.length === 0 ? (
        <AppCard padding="none">
          <div className="border-b border-disabled p-5 sm:p-6">
            <p className="b2-b text-text">Create module</p>
          </div>
          <AppEmptyState
            image={noModules}
            title="No modules yet"
            description="Get started by adding your first module."
            actionLabel="Add modules"
            onAction={() => setIsAddModuleOpen(true)}
          />
        </AppCard>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="b2-b text-text">Modules</p>
            <AppButton
              variant="outlined"
              size="small"
              radius="full"
              startIcon={<Plus size={14} />}
              onClick={() => setIsAddModuleOpen(true)}
            >
              Add module
            </AppButton>
          </div>

          {modules.map((module, index) => (
            <AppCard key={module.id} padding="none">
              <div className="flex items-start justify-between gap-3 border-b border-disabled p-5 sm:p-6">
                <div>
                  <p className="b2-b text-text">
                    {index + 1}. {module.title}
                  </p>
                  {module.description && (
                    <p className="f1-r mt-0.5 text-muted">
                      {module.description}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <AppPill
                    label={`${module.lessons.length} lesson${
                      module.lessons.length === 1 ? '' : 's'
                    }`}
                    color="primary"
                  />
                  <button
                    type="button"
                    aria-label="Module options"
                    className="text-muted hover:text-text"
                  >
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>

              {module.lessons.length === 0 ? (
                <AppEmptyState
                  image={noLessons}
                  title="No lessons yet"
                  description="Add lessons to this module to start building your content."
                  actionLabel="Add lessons"
                  onAction={() => setLessonModuleId(module.id)}
                  className="min-h-65 py-10"
                />
              ) : (
                <ul className="flex flex-col divide-y divide-disabled">
                  {module.lessons.map((lesson, lessonIndex) => {
                    const meta = CONTENT_TYPE_META[lesson.contentType];
                    return (
                      <li
                        key={lesson.id}
                        className="flex items-center justify-between px-5 py-3 sm:px-6"
                      >
                        <div>
                          <p className="b2-m text-text">
                            {index + 1}.{lessonIndex + 1} {lesson.title}
                          </p>
                          <div className="mt-1 flex items-center flex-col gap-2">
                            {lesson.description && (
                              <span className="f1-r text-muted">
                                {lesson.description}
                              </span>
                            )}
                            <AppPill
                              label={meta.label}
                              color={meta.pillColor}
                              icon={meta.icon as React.ReactElement}
                            />
                          </div>
                        </div>

                        <LessonMenu
                          onEdit={() =>
                            setEditingLesson({
                              moduleId: module.id,
                              lesson: {
                                id: lesson.id,
                                title: lesson.title,
                                description: lesson.description,
                                contentType: lesson.contentType,
                                fileName: lesson.fileName,
                                fileSize: lesson.fileSize,
                              },
                            })
                          }
                          onDelete={() =>
                            setDeletingLesson({
                              moduleId: module.id,
                              lessonId: lesson.id,
                              lessonTitle: lesson.title,
                            })
                          }
                        />
                      </li>
                    );
                  })}
                  <li className="px-5 py-3 sm:px-6">
                    <AppButton
                      variant="outlined"
                      size="small"
                      radius="full"
                      startIcon={<Plus size={14} />}
                      className="w-full"
                      onClick={() => setLessonModuleId(module.id)}
                    >
                      Add lesson
                    </AppButton>
                  </li>
                </ul>
              )}
            </AppCard>
          ))}
        </div>
      )}

      <AddModuleModal
        open={isAddModuleOpen}
        onClose={() => setIsAddModuleOpen(false)}
        onSubmit={handleAddModule}
      />

      <AddLessonModal
        open={!!activeModuleForLesson}
        moduleTitle={activeModuleForLesson?.title ?? ''}
        onClose={() => setLessonModuleId(null)}
        onSubmit={handleAddLesson}
      />

      <EditLessonModal
        key={editingLesson?.lesson.id ?? 'edit-lesson-modal'}
        open={!!editingLesson}
        lesson={editingLesson?.lesson ?? null}
        onClose={() => setEditingLesson(null)}
        onSave={handleSaveLessonEdit}
      />

      <AppConfirmModal
        open={isPublishConfirmOpen}
        onClose={() => setIsPublishConfirmOpen(false)}
        icon={<AlertTriangle size={40} className="text-warning" />}
        title="Publish course?"
        description={
          <>
            Are you sure you want to publish{' '}
            <span className="text-primary">{course.title}</span>?
          </>
        }
        secondaryButton={{
          label: 'Cancel',
          onClick: () => setIsPublishConfirmOpen(false),
        }}
        primaryButton={{
          label: 'Yes publish',
          onClick: handleConfirmPublish,
        }}
      />

      <AppConfirmModal
        open={!!deletingLesson}
        onClose={() => setDeletingLesson(null)}
        icon={<ReportProblemIcon sx={{ fontSize: 40 }} className="text-error" />}
        title="Delete lesson?"
        description={
          <>
            Are you sure you want to delete{' '}
            <span className="text-error">{deletingLesson?.lessonTitle}</span>?
            This action cannot be undone.
          </>
        }
        secondaryButton={{
          label: 'Cancel',
          onClick: () => setDeletingLesson(null),
        }}
        primaryButton={{
          label: 'Yes, delete',
          color: 'error',
          onClick: handleConfirmDeleteLesson,
        }}
      />
    </div>
  );
};

export default CourseDetailsView;
