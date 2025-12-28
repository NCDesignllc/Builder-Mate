import { useNavigate } from 'react-router-dom';
import { routeTo } from '../router/routes';

/**
 * Small helper for SPA navigation + optional store priming.
 * Usage:
 *   const openProject = useOpenProject((id)=>{...setActive...});
 *   openProject(id)
 */
export function useOpenProject(prime?: (id: string) => void) {
  const navigate = useNavigate();
  return (id: string) => {
    if (!id) return;
    try {
      prime?.(id);
    } finally {
      navigate(routeTo.projectDetail(id));
    }
  };
}
