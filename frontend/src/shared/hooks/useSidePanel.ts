import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidePanelState {
  isOpen: boolean;
  type: string | null;
  data: any;
}

/**
 * Хук для управления side-panel с поддержкой URL и истории браузера
 */
export const useSidePanel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [state, setState] = useState<SidePanelState>({
    isOpen: false,
    type: null,
    data: null
  });

  // Парсим URL для определения состояния панели
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const panelType = searchParams.get('panel');
    const panelData = searchParams.get('data');

    if (panelType) {
      setState({
        isOpen: true,
        type: panelType,
        data: panelData ? JSON.parse(decodeURIComponent(panelData)) : null
      });
    } else {
      setState({
        isOpen: false,
        type: null,
        data: null
      });
    }
  }, [location.search]);

  // Открытие панели
  const openPanel = useCallback((type: string, data?: any) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('panel', type);
    
    if (data) {
      searchParams.set('data', encodeURIComponent(JSON.stringify(data)));
    }

    navigate({
      pathname: location.pathname,
      search: searchParams.toString()
    }, { replace: false });
  }, [navigate, location.pathname, location.search]);

  // Закрытие панели
  const closePanel = useCallback(() => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.delete('panel');
    searchParams.delete('data');

    navigate({
      pathname: location.pathname,
      search: searchParams.toString()
    }, { replace: true });
  }, [navigate, location.pathname, location.search]);

  // Обновление данных панели
  const updatePanelData = useCallback((data: any) => {
    if (state.isOpen && state.type) {
      const searchParams = new URLSearchParams(location.search);
      searchParams.set('data', encodeURIComponent(JSON.stringify(data)));

      navigate({
        pathname: location.pathname,
        search: searchParams.toString()
      }, { replace: true });
    }
  }, [state.isOpen, state.type, navigate, location.pathname, location.search]);

  return {
    isOpen: state.isOpen,
    type: state.type,
    data: state.data,
    openPanel,
    closePanel,
    updatePanelData
  };
};

export default useSidePanel;
