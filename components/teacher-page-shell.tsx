import { cn } from '@/lib/utils'

type TeacherPageShellProps = {
  children: React.ReactNode
  className?: string
  variant?: 'workspace' | 'tool' | 'onboarding'
}

export function TeacherPageShell({ children, className, variant = 'tool' }: TeacherPageShellProps) {
  return (
    <div className={cn('teacher-page-shell', `teacher-page-shell--${variant}`, className)}>
      {children}
    </div>
  )
}
