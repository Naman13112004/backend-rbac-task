"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import toast from "react-hot-toast";

interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    const fetchTasks = async () => {
      try {
        const res = await fetch("/api/v1/task");
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch tasks");
        if (mounted) setTasks(data.data);
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchTasks();
    return () => { mounted = false; };
  }, [isAuthenticated, router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
      logout();
      router.replace("/login");
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return toast.error("Title is required");

    try {
      if (editingId) {
        const res = await fetch(`/api/v1/task/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        toast.success("Task updated");
        setTasks(tasks.map(t => t.id === editingId ? data.data : t));
        setEditingId(null);
      } else {
        const res = await fetch("/api/v1/task", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        toast.success("Task created");
        setTasks([data.data, ...tasks]);
      }
      setTitle("");
      setDescription("");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/task/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Task deleted");
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const toggleComplete = async (task: Task) => {
    try {
      const res = await fetch(`/api/v1/task/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setTasks(tasks.map(t => t.id === task.id ? data.data : t));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const editTask = (task: Task) => {
    setTitle(task.title);
    setDescription(task.description || "");
    setEditingId(task.id);
  };

  if (!isAuthenticated || loading) return null;

  return (
    <div className="min-h-screen bg-slate-50 w-full mb-10 text-slate-900 fade-in">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="font-semibold text-lg">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600">
              {user?.name} ({user?.role})
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 mt-8 space-y-8">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit Task' : 'Create New Task'}</h2>
            <form onSubmit={handleSubmit} className="flex gap-4 items-end flex-wrap sm:flex-nowrap">
              <div className="space-y-2 grow min-w-[200px]">
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task Title" />
              </div>
              <div className="space-y-2 grow min-w-[250px]">
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional Description" />
              </div>
              <div className="flex gap-2">
                {editingId && (
                  <Button type="button" variant="ghost" onClick={() => { setEditingId(null); setTitle(""); setDescription(""); }}>Cancel</Button>
                )}
                <Button type="submit">{editingId ? 'Update' : 'Add Task'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Tasks</h2>
          {tasks.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No tasks found. Create one above!</p>
          ) : (
            <div className="grid gap-4">
              {tasks.map((task) => (
                <Card key={task.id} className={`transition-all ${task.completed ? 'opacity-70 bg-slate-50/50' : 'bg-white'}`}>
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleComplete(task)}
                        className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div className={task.completed ? "line-through text-slate-500" : ""}>
                        <h3 className="font-medium text-lg">{task.title}</h3>
                        {task.description && <p className="text-sm text-slate-500">{task.description}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-100 shrink-0">
                      <Button variant="outline" size="sm" onClick={() => editTask(task)}>Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(task.id)}>Delete</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
