"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckSquare, Flame } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  impact: "alto" | "medio" | "basso";
  estimated_minutes: number;
  completed: boolean;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const streak = 0;
  const completedCount = tasks.filter((t) => t.completed).length;

  function toggleTask(id: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Task Settimanali</h1>
        <p className="text-text-secondary mt-1">
          3 task personalizzati per migliorare il tuo annuncio
        </p>
      </div>

      {/* Streak & Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-primary" />
              <span className="font-bold">{streak} settimane consecutive</span>
            </div>
            <Badge variant="secondary">
              {completedCount}/{tasks.length || 3}
            </Badge>
          </div>
          <Progress value={tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0} />
        </CardContent>
      </Card>

      {/* Tasks */}
      {tasks.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <CheckSquare className="h-12 w-12 text-text-secondary mx-auto mb-3" />
            <p className="font-medium">Nessun task disponibile</p>
            <p className="text-sm text-text-secondary mt-1">
              Analizza il tuo listing per ricevere task personalizzati
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <Card
              key={task.id}
              className={task.completed ? "opacity-60" : ""}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      task.completed
                        ? "bg-success border-success"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    {task.completed && (
                      <svg className="w-3 h-3 text-white" viewBox="0 0 12 12">
                        <path
                          d="M10 3L4.5 8.5L2 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                        />
                      </svg>
                    )}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`font-medium text-sm ${
                          task.completed ? "line-through" : ""
                        }`}
                      >
                        {task.title}
                      </span>
                      <Badge
                        variant={
                          task.impact === "alto"
                            ? "destructive"
                            : task.impact === "medio"
                            ? "warning"
                            : "secondary"
                        }
                      >
                        {task.impact}
                      </Badge>
                    </div>
                    <p className="text-xs text-text-secondary">
                      {task.description}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      ⏱ {task.estimated_minutes} min
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
