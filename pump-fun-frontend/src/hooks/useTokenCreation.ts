import { useState } from 'react'
import { pumpService } from '../services/pumpService'
import type { CreateTokenDto, TokenResponse, ApiError } from '../types'

interface UseTokenCreationReturn {
  createToken: (data: CreateTokenDto, imageFile?: File) => Promise<TokenResponse | null>
  isLoading: boolean
  error: ApiError | null
  success: TokenResponse | null
  reset: () => void
}

export function useTokenCreation(): UseTokenCreationReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [success, setSuccess] = useState<TokenResponse | null>(null)

  const createToken = async (data: CreateTokenDto, imageFile?: File): Promise<TokenResponse | null> => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await pumpService.createToken(data, imageFile)
      setSuccess(response)
      return response
    } catch (err: any) {
      const apiError: ApiError = {
        message: err.response?.data?.error || err.message || 'Failed to create token',
        status: err.response?.status,
      }
      setError(apiError)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const reset = () => {
    setError(null)
    setSuccess(null)
    setIsLoading(false)
  }

  return {
    createToken,
    isLoading,
    error,
    success,
    reset,
  }
}