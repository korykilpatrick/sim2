import { useAuth } from '@/features/auth/hooks/useAuth'
import { ShoppingCart, User } from 'lucide-react'
import { Link } from 'react-router-dom'

interface HeaderProps {
  onMenuClick?: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { isAuthenticated } = useAuth()

  return (
    <header className="sticky top-0 z-40 bg-dark-500 px-4 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {onMenuClick && (
          <button
            type="button"
            className="-m-2.5 p-2.5 text-white lg:hidden mr-4"
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
        )}

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-white">SYNMAX</span>
          <span className="text-xl text-gray-300">Marketplace</span>
        </Link>

        <div className="flex items-center gap-4">
          {/* User Icon */}
          <Link 
            to="/account"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <User className="h-5 w-5" />
          </Link>

          {/* Cart Icon */}
          <Link
            to="/cart"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ShoppingCart className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  )
}
