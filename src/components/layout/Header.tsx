import { useAuth } from '@/features/auth/hooks/useAuth'
import Button from '@/components/common/Button'
import { ShoppingCart, User } from 'lucide-react'
import { Link } from 'react-router-dom'

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 bg-dark-500 px-4 shadow-lg sm:gap-x-6 sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-white lg:hidden"
        onClick={onMenuClick}
      >
        <span className="sr-only">Open sidebar</span>
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>

      {/* Logo */}
      <Link to="/" className="flex items-center gap-2">
        <span className="text-xl font-bold text-white">SYNMAX</span>
        <span className="text-xl text-primary-500">Marketplace</span>
      </Link>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1 items-center justify-end gap-x-4 lg:gap-x-6">
          {/* Cart Icon */}
          <Link
            to="/cart"
            className="relative p-2 text-white hover:text-primary-400 transition-colors"
          >
            <ShoppingCart className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary-500 text-xs font-bold text-white">
              0
            </span>
          </Link>

          {/* User Menu */}
          <div className="relative flex items-center gap-3">
            <Link
              to="/credits"
              className="flex items-center gap-2 rounded-lg bg-dark-600 px-3 py-2 text-sm transition-colors hover:bg-dark-700"
            >
              <svg
                className="h-5 w-5 text-secondary-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10.75 10.818v2.614A3.13 3.13 0 0011.888 13c.482-.315.612-.648.612-.875 0-.227-.13-.56-.612-.875a3.13 3.13 0 00-1.138-.432zM8.33 8.62c.053.055.115.11.184.164.208.16.46.284.736.363V6.603a2.45 2.45 0 00-.35.13c-.14.065-.27.143-.386.233-.377.292-.514.627-.514.909 0 .184.058.39.202.592.037.051.08.102.128.152z" />
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-6a.75.75 0 01.75.75v.316a3.78 3.78 0 011.653.713c.426.33.744.74.925 1.2a.75.75 0 01-1.395.55 1.35 1.35 0 00-.447-.563 2.187 2.187 0 00-.736-.363V9.3c.698.093 1.383.32 1.959.696.787.514 1.29 1.27 1.29 2.13 0 .86-.504 1.616-1.29 2.13-.576.377-1.261.603-1.96.696v.299a.75.75 0 11-1.5 0v-.3c-.697-.092-1.382-.318-1.958-.695-.482-.315-.857-.717-1.078-1.188a.75.75 0 111.359-.636c.08.173.245.376.54.569.313.205.706.353 1.138.432v-2.748a3.782 3.782 0 01-1.653-.713C6.9 9.433 6.5 8.681 6.5 7.875c0-.805.4-1.558 1.097-2.096a3.78 3.78 0 011.653-.713V4.75A.75.75 0 0110 4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium text-white">
                {user?.credits || 0} Credits
              </span>
            </Link>
            
            <button className="flex items-center gap-x-2 rounded-lg bg-dark-600 p-2 text-white transition-colors hover:bg-dark-700">
              <User className="h-5 w-5" />
              <span className="hidden lg:block text-sm">{user?.name}</span>
            </button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => logout()}
              className="border-gray-600 text-white hover:bg-dark-600"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
