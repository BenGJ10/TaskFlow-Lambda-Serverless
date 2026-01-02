// frontend/app/dashboard/page.tsx
'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Plus, Star, Pencil, Trash2, CheckSquare } from 'lucide-react';
import { api, Task } from '@/lib/api';
import AddTaskModal from '@/components/AddTaskModal';
import ConfirmDialog from '@/components/ConfirmDialog';

const fetcher = () => api.getTasks();

export default function Dashboard() {
  const { data: tasks = [], error, isLoading, mutate } = useSWR<Task[]>('tasks', fetcher, {
    revalidateOnFocus: false,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const handleOpenModal = (task?: Task) => {
    setEditingTask(task || null);
    setIsModalOpen(true);
  };

  const handleTaskCreated = (newTask: Task) => {
    mutate([...tasks, newTask], false); 
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    mutate(
      tasks.map(t => (t.SK === updatedTask.SK ? updatedTask : t)),
      false
    );
  };

  const handleToggleStar = async (task: Task) => {
    try {
      await api.updateTask(task.SK, { isStarred: !task.isStarred });
      mutate();
    } catch (err) {
      console.error('Star toggle failed', err);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      await api.updateTask(task.SK, {
        isCompleted: !task.isCompleted,
      });
      mutate();
    } catch (err) {
      console.error('Complete toggle failed', err);
    }
  };

  const openDeleteConfirm = (taskId: string) => {
    setTaskToDelete(taskId);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!taskToDelete) return;
    try {
      await api.deleteTask(taskToDelete);
      mutate(tasks.filter(t => t.SK !== taskToDelete), false);
    } catch (err) {
      console.error('Delete failed', err);
    } finally {
      setIsDeleteOpen(false);
      setTaskToDelete(null);
    }
  };

  if (error) return <div className="p-8 text-red-600">Error: {error.message}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-teal-600">TaskFlow</h1>
          <div className="flex items-center gap-4">
            {/* Future: user menu */}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-20 pb-16 px-4 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium text-gray-800">Your Tasks</h2>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg">No tasks yet.</p>
            <p className="mt-2">Click + to add your first task.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.SK}
                className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggleComplete(task)}
                    className="mt-1 focus:outline-none"
                  >
                    <CheckSquare
                      size={24}
                      className={
                        task.isCompleted
                          ? 'text-teal-600 fill-teal-100'
                          : 'text-gray-400 hover:text-teal-600'
                      }
                    />
                  </button>

                  {/* Star */}
                  <button
                    onClick={() => handleToggleStar(task)}
                    className="mt-1 focus:outline-none"
                  >
                    <Star
                      size={20}
                      className={
                        task.isStarred
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-400 hover:text-yellow-500'
                      }
                    />
                  </button>

                  {/* Content */}
                  <div className="flex-1">
                    <h3
                      className={`font-medium text-lg ${
                        task.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}
                    >
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                    )}

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-3 mt-3 text-sm">
                      {task.category && (
                        <span className="px-2.5 py-1 bg-teal-50 text-teal-700 rounded-md text-xs font-medium">
                          {task.category}
                        </span>
                      )}
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                          task.priority === 'high' ? 'bg-rose-50 text-rose-700' :
                          task.priority === 'medium' ? 'bg-amber-50 text-amber-700' :
                          'bg-green-50 text-green-700'
                        }`}
                      >
                        {task.priority}
                      </span>
                      {task.dueDate && (
                        <span className="text-gray-600">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 text-gray-500">
                    <button onClick={() => handleOpenModal(task)} className="hover:text-teal-600">
                      <Pencil size={18} />
                    </button>
                    <button onClick={() => openDeleteConfirm(task.SK)} className="hover:text-red-600">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Add Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 bg-teal-600 text-white p-4 rounded-full shadow-lg hover:bg-teal-700 transition transform hover:scale-105"
      >
        <Plus size={28} />
      </button>

      {/* New Task Modal */}
      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => {setIsModalOpen(false);
                      setEditingTask(null);}
        }
        onTaskCreated={handleTaskCreated}
        onTaskUpdated={handleTaskUpdated}
        existingTask={editingTask || undefined}    
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setTaskToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
      />
    </div>
  );
}