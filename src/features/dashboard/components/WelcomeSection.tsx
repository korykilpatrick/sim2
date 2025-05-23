interface WelcomeSectionProps {
  userName: string
}

export function WelcomeSection({ userName }: WelcomeSectionProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        Welcome back, {userName}
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Here's what's happening with your maritime intelligence today.
      </p>
    </div>
  )
}
