import { Inbox } from 'lucide-react';
export default function EmptyState({ title = 'Nothing here yet', description = 'There are no records to show.', action }) {
  return <div className="empty-state"><span className="empty-icon"><Inbox size={21}/></span><strong>{title}</strong><p>{description}</p>{action}</div>;
}
