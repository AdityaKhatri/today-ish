import { Navigate, Route, Routes } from 'react-router-dom'
import { AddTaskScreen } from '@/screens/AddTaskScreen'
import { AskAiSheet } from '@/screens/AskAiSheet'
import { HomeScreen } from '@/screens/HomeScreen'
import { IosInstallNudgeScreen } from '@/screens/IosInstallNudgeScreen'
import { NotificationPrePromptScreen } from '@/screens/NotificationPrePromptScreen'
import { RoutineEditorScreen } from '@/screens/RoutineEditorScreen'
import { RoutinesScreen } from '@/screens/RoutinesScreen'
import { SettingsScreen } from '@/screens/SettingsScreen'
import { TaskDetailScreen } from '@/screens/TaskDetailScreen'
import { TasksScreen } from '@/screens/TasksScreen'

/** Routes for authenticated + allowlisted users. */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/tasks" element={<TasksScreen />} />
      <Route path="/tasks/:id" element={<TaskDetailScreen />} />
      <Route path="/add" element={<AddTaskScreen />} />
      <Route path="/routines" element={<RoutinesScreen />} />
      <Route path="/routines/new" element={<RoutineEditorScreen />} />
      <Route path="/routines/:id/edit" element={<RoutineEditorScreen />} />
      <Route path="/settings" element={<SettingsScreen />} />
      {/* In-app onboarding / utility flows */}
      <Route path="/reminders" element={<NotificationPrePromptScreen />} />
      <Route path="/install" element={<IosInstallNudgeScreen />} />
      {/* Ask-AI sheet — reachable directly; the FAB entry point is disabled (AI deferred) */}
      <Route path="/ask" element={<AskAiSheet />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
