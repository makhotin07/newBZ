import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface UseDrawerOptions {
  paramName?: string;
  onOpen?: () => void;
  onClose?: () => void;
}

/**
 * Хук для управления состоянием drawer с синхронизацией URL
 * Поддерживает открытие/закрытие через URL параметры
 */
export const useDrawer = (options: UseDrawerOptions = {}) => {
  const { paramName = 'preview', onOpen, onClose } = options;
  const navigate = useNavigate();
  const location = useLocation();
  
  // Получаем значение из URL
  const getDrawerValue = useCallback(() => {
    const params = new URLSearchParams(location.search);
    return params.get(paramName);
  }, [location.search, paramName]);

  // Состояние drawer
  const [isOpen, setIsOpen] = useState(false);
  const [drawerValue, setDrawerValue] = useState<string | null>(getDrawerValue());

  // Синхронизируем состояние с URL
  useEffect(() => {
    const value = getDrawerValue();
    setDrawerValue(value);
    setIsOpen(!!value);
  }, [getDrawerValue]);

  // Открыть drawer
  const openDrawer = useCallback((value: string) => {
    const params = new URLSearchParams(location.search);
    params.set(paramName, value);
    
    navigate({
      pathname: location.pathname,
      search: params.toString()
    }, { replace: true });
    
    setDrawerValue(value);
    setIsOpen(true);
    onOpen?.();
  }, [navigate, location.pathname, location.search, paramName, onOpen]);

  // Закрыть drawer
  const closeDrawer = useCallback(() => {
    const params = new URLSearchParams(location.search);
    params.delete(paramName);
    
    navigate({
      pathname: location.pathname,
      search: params.toString()
    }, { replace: true });
    
    setDrawerValue(null);
    setIsOpen(false);
    onClose?.();
  }, [navigate, location.pathname, location.search, paramName, onClose]);

  // Переключить drawer
  const toggleDrawer = useCallback((value?: string) => {
    if (isOpen) {
      closeDrawer();
    } else if (value) {
      openDrawer(value);
    }
  }, [isOpen, openDrawer, closeDrawer]);

  return {
    isOpen,
    drawerValue,
    openDrawer,
    closeDrawer,
    toggleDrawer,
  };
};

export default useDrawer;
