import { useEffect } from 'react';
import { useUIStore } from '../../stores/uiStore';
import { AnimatePresence, motion } from 'framer-motion';

export default function NotificationToast() {
  const notifications = useUIStore((s) => s.notifications);
  const removeNotification = useUIStore((s) => s.dismissNotification);

  return (
    <div className="pointer-events-none fixed bottom-4 left-3 right-3 sm:left-auto sm:right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {notifications.map((n) => (
          <NotificationItem
            key={n.id}
            id={n.id}
            type={n.type}
            message={n.message}
            onDismiss={removeNotification}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function NotificationItem({
  id,
  type,
  message,
  onDismiss,
}: {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(id), 5000);
    return () => clearTimeout(t);
  }, [id, onDismiss]);

  const colors: Record<string, string> = {
    info: 'border-cyan-500 bg-cyan-900/40',
    success: 'border-emerald-500 bg-emerald-900/40',
    warning: 'border-yellow-500 bg-yellow-900/40',
    error: 'border-red-500 bg-red-900/40',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 80 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 80 }}
      className={`pointer-events-auto cursor-pointer rounded-lg border-l-4 px-3 sm:px-4 py-2 text-xs sm:text-sm text-white shadow-lg ${colors[type]}`}
      onClick={() => onDismiss(id)}
    >
      {message}
    </motion.div>
  );
}
