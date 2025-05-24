import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { LoginCredentials } from '../types/auth'
import { useAuth } from '../hooks/useAuth'
import Button from '@/components/common/Button'
import Input from '@/components/forms/Input'
import { MinimalHeader } from '@/components/layout'

export default function LoginPage() {
  const { login, isLoggingIn } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>()

  const onSubmit = (data: LoginCredentials) => {
    login(data)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MinimalHeader />

      {/* Login Form */}
      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center text-gray-900">Login</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <div className="space-y-4">
              <Input
                type="email"
                autoComplete="email"
                placeholder="Email address"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                error={errors.email?.message}
                className="bg-gray-200"
              />

              <Input
                type="password"
                autoComplete="current-password"
                placeholder="Password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                error={errors.password?.message}
                className="bg-gray-200"
              />
            </div>

            <Button
              type="submit"
              loading={isLoggingIn}
              fullWidth
              size="lg"
              variant="synmax"
            >
              Login
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600">Don't have an account? </span>
              <Link
                to="/register"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Create Account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}