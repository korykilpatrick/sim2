import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { LoginCredentials } from '../types/auth'
import { useAuth } from '../hooks/useAuth'
import Button from '@/components/common/Button'
import Input from '@/components/forms/Input'
import { Ship } from 'lucide-react'

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
    <div className="flex min-h-screen">
      {/* Left Panel - Form */}
      <div className="flex w-full flex-col justify-center px-4 sm:px-6 lg:w-1/2 lg:px-20 xl:px-32">
        <div className="mx-auto w-full max-w-sm">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-500">
              <Ship className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-dark-500">SYNMAX</h1>
              <p className="text-sm text-gray-600">Intelligence Marketplace</p>
            </div>
          </div>

          {/* Form */}
          <div className="mt-10">
            <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
            <p className="mt-2 text-gray-600">
              Sign in to access your maritime intelligence dashboard
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
              <Input
                label="Email address"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                error={errors.email?.message}
              />

              <Input
                label="Password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                error={errors.password?.message}
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Remember me
                  </label>
                </div>

                <a
                  href="#"
                  className="text-sm font-medium text-primary-600 hover:text-primary-500"
                >
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                loading={isLoggingIn}
                fullWidth
                size="lg"
                variant="synmax"
              >
                Sign in
              </Button>

              <div className="text-center">
                <span className="text-gray-600">Don't have an account? </span>
                <Link
                  to="/register"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Sign up
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right Panel - Image/Branding */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-500 to-dark-700">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
          <div className="relative flex h-full items-center justify-center p-12">
            <div className="max-w-lg text-center">
              <h2 className="text-4xl font-bold text-white">
                Maritime Intelligence at Your Fingertips
              </h2>
              <p className="mt-4 text-lg text-gray-300">
                Track vessels, monitor areas, and generate compliance reports with
                our comprehensive maritime intelligence platform.
              </p>
              <div className="mt-8 flex justify-center gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary-400">10K+</div>
                  <div className="text-sm text-gray-300">Vessels Tracked</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary-400">500+</div>
                  <div className="text-sm text-gray-300">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary-400">99.9%</div>
                  <div className="text-sm text-gray-300">Uptime</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}