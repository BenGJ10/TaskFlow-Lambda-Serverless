// frontend/components/AddTaskModal.tsx
'use client';

import { Fragment, useEffect } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api, Task } from '@/lib/api';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  category: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  isStarred: z.boolean().default(false),
});

type TaskForm = z.input<typeof taskSchema>;

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: (newTask: Task) => void;
  onTaskUpdated: (updatedTask: Task) => void;
  existingTask?: Task | null;  // null/undefined = create mode
}

export default function AddTaskModal({
  isOpen,
  onClose,
  onTaskCreated,
  onTaskUpdated,
  existingTask,
}: AddTaskModalProps) {
  const isEditMode = !!existingTask;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TaskForm>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      priority: 'medium',
      isStarred: false,
    },
  });

  // Pre-fill form when editing a task (runs when modal opens or task changes)
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && existingTask) {
        reset({
          title: existingTask.title,
          description: existingTask.description || '',
          dueDate: existingTask.dueDate || '',
          category: existingTask.category || '',
          priority: existingTask.priority,
          isStarred: existingTask.isStarred,
        });
      } else {
        reset({
          title: '',
          description: '',
          dueDate: '',
          category: '',
          priority: 'medium',
          isStarred: false,
        });
      }
    }
  }, [isOpen, isEditMode, existingTask, reset]);

  const onSubmit = async (data: TaskForm) => {
    try {
      if (isEditMode && existingTask) {
        // Edit mode: PUT update
        const updatedTask = await api.updateTask(existingTask.SK, data);
        onTaskUpdated(updatedTask);
      } else {
        // Create mode: POST new
        const newTask = await api.createTask(data);
        onTaskCreated(newTask);
      }
      reset();
      onClose();
    } catch (err) {
      console.error(`${isEditMode ? 'Update' : 'Create'} task failed:`, err);
      alert(`Failed to ${isEditMode ? 'update' : 'create'} task. Please try again.`);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-2xl transition-all text-gray-900">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <DialogTitle as="h3" className="text-xl font-semibold">
                    {isEditMode ? 'Edit Task' : 'Create New Task'}
                  </DialogTitle>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full p-1 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-900">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="title"
                      {...register('title')}
                      className="mt-1 block w-full rounded-lg border border-gray-400 px-4 py-3 text-gray-900 placeholder-gray-600 shadow-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500 outline-none transition"
                      placeholder="What needs to be done?"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-900">
                      Description
                    </label>
                    <textarea
                      id="description"
                      rows={3}
                      {...register('description')}
                      className="mt-1 block w-full rounded-lg border border-gray-400 px-4 py-3 text-gray-900 placeholder-gray-600 shadow-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500 outline-none transition"
                      placeholder="Add details or notes..."
                    />
                  </div>

                  {/* Grid Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Due Date */}
                    <div>
                      <label htmlFor="dueDate" className="block text-sm font-medium text-gray-900">
                        Due Date
                      </label>
                      <input
                        id="dueDate"
                        type="date"
                        {...register('dueDate')}
                        className="mt-1 block w-full rounded-lg border border-gray-400 px-4 py-3 text-gray-900 shadow-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500 outline-none transition"
                      />
                    </div>

                    {/* Priority */}
                    <div>
                      <label htmlFor="priority" className="block text-sm font-medium text-gray-900">
                        Priority
                      </label>
                      <select
                        id="priority"
                        {...register('priority')}
                        className="mt-1 block w-full rounded-lg border border-gray-400 px-4 py-3 text-gray-900 shadow-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500 outline-none transition"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-900">
                      Category
                    </label>
                    <input
                      id="category"
                      {...register('category')}
                      className="mt-1 block w-full rounded-lg border border-gray-400 px-4 py-3 text-gray-900 placeholder-gray-600 shadow-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500 outline-none transition"
                      placeholder="e.g. Work, Personal, Groceries"
                    />
                  </div>

                  {/* Starred */}
                  <div className="flex items-center">
                    <input
                      id="isStarred"
                      type="checkbox"
                      {...register('isStarred')}
                      className="h-5 w-5 rounded border-gray-400 text-teal-600 focus:ring-teal-500"
                    />
                    <label htmlFor="isStarred" className="ml-3 text-sm font-medium text-gray-900">
                      Star this task (important)
                    </label>
                  </div>

                  {/* Buttons */}
                  <div className="mt-8 flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-2.5 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 transition"
                    >
                      {isSubmitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Task' : 'Create Task')}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}