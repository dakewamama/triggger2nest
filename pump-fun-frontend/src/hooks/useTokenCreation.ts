import { useState } from 'react';
import { pumpService } from '../services/api/pump.service';
import { CreateTokenDto, TokenResponse } from '../services/api/pump.service';
import { getErrorMessage } from '../utils/helpers';

interface UseTokenCreationReturn {
  createToken: (data: CreateTokenDto, imageFile?: File) => Promise<TokenResponse | null>;
  isLoading: boolean;
  error: string | null;
  success: TokenResponse | null;
  reset: () => void;
}

export function useTokenCreation(): UseTokenCreationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<TokenResponse | null>(null);
  
  const createToken = async (
    data: CreateTokenDto,
    imageFile?: File
  ): Promise<TokenResponse | null> => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await pumpService.createToken(data, imageFile);
      setSuccess(response);
      return response;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const reset = () => {
    setError(null);
    setSuccess(null);
    setIsLoading(false);
  };
  
  return {
    createToken,
    isLoading,
    error,
    success,
    reset,
  };
}
