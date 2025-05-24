import { useAuth } from '@/features/auth/hooks/useAuth'
import { Menu, ShoppingCart, User, Coins } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatPrice } from '@/utils/formatPrice'
import { NotificationCenter } from '@/features/notifications'
import { ConnectionIndicator } from '@/components/feedback'

interface HeaderProps {
  onMenuClick?: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, isAuthenticated } = useAuth()

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
            <Menu className="h-6 w-6" />
          </button>
        )}

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-white">SYNMAX</span>
          <span className="text-xl text-gray-300">Marketplace</span>
        </Link>

        <div className="flex items-center gap-4">
          {/* Credit Balance */}
          {isAuthenticated && user && (
            <Link
              to="/credits"
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
            >
              <Coins className="h-4 w-4 text-synmax-500" />
              <span className="text-sm font-medium text-white">
                {formatPrice(user.credits)} Credits
              </span>
            </Link>
          )}

          {/* Connection Status */}
          {isAuthenticated && <ConnectionIndicator />}

          {/* Notifications */}
          {isAuthenticated && <NotificationCenter />}

          {/* User Icon */}
          <Link
            to={isAuthenticated ? '/dashboard' : '/account'}
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
