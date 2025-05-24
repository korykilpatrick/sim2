import { ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'

interface MinimalHeaderProps {
  showCart?: boolean
}

export default function MinimalHeader({ showCart = true }: MinimalHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-dark-500 px-4 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-white">SYNMAX</span>
          <span className="text-xl text-gray-300">Marketplace</span>
        </Link>

        {showCart && (
          <div className="flex items-center">
            {/* Cart Icon */}
            <Link
              to="/cart"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}