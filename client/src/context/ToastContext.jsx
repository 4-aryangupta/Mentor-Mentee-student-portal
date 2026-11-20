import { createContext, useContext, useState } from 'react';
import { CheckCircle2, CircleAlert, X } from 'lucide-react';
const ToastContext = createContext(null);
export const ToastProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const notify = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setItems((current) => [...current, { id, message, type }]);
    window.setTimeout(() => setItems((current) => current.filter((item) => item.id !== id)), 4200);
  };
  const dismiss = (id) => setItems((current) => current.filter((item) => item.id !== id));
  return <ToastContext.Provider value={notify}>{children}<div className="toast-stack" aria-live="polite">{items.map((item) => <div className={`toast toast-${item.type}`} key={item.id}><span>{item.type === 'error' ? <CircleAlert size={17}/> : <CheckCircle2 size={17}/>}</span><p>{item.message}</p><button aria-label="Dismiss notification" onClick={() => dismiss(item.id)}><X size={15}/></button></div>)}</div></ToastContext.Provider>;
};
export const useToast = () => useContext(ToastContext);
