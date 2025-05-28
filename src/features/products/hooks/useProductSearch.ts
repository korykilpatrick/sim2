import { useState, useCallback } from 'react'
import { Product } from '@/types/product'
import { searchProducts } from '@/constants/products'

export default function useProductSearch() {
  const [results, setResults] = useState<Product[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const search = useCallback((query: string) => {
    setIsSearching(true)

    // Simulate async search
    setTimeout(() => {
      if (query.trim()) {
        const searchResults = searchProducts(query)
        setResults(searchResults)
      } else {
        setResults([])
      }
      setIsSearching(false)
    }, 100)
  }, [])

  return {
    results,
    isSearching,
    search,
  }
}
