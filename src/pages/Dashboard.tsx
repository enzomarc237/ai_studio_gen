import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Lightbulb, LayoutTemplate, MessageSquare, Plus } from 'lucide-react';

export default function Dashboard() {
  const [docs, setDocs] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/documents')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDocs(data);
        }
      })
      .catch(() => {});
  }, []);

  const quickActions = [
    { name: 'New PRD', path: '/app/generator?type=prd', icon: FileText, color: 'bg-indigo-50 text-indigo-600' },
    { name: 'Brainstorm', path: '/app/brainstorm', icon: Lightbulb, color: 'bg-amber-50 text-amber-600' },
    { name: 'UI Wireframe', path: '/app/ui-generator', icon: LayoutTemplate, color: 'bg-emerald-50 text-emerald-600' },
    { name: 'Chat with AI', path: '/app/chatbot', icon: MessageSquare, color: 'bg-violet-50 text-violet-600' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Dashboard</h1>
        <Link to="/app/generator" className="bg-zinc-900 text-white px-4 py-2 rounded-xl flex items-center hover:bg-zinc-800 transition-colors shadow-sm">
          <Plus className="h-4 w-4 mr-2" />
          Create Document
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.name} to={action.path} className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 hover:shadow-md transition-all hover:-translate-y-0.5 group">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 ${action.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 group-hover:text-indigo-600 transition-colors">{action.name}</h3>
            </Link>
          );
        })}
      </div>

      <h2 className="text-xl font-bold tracking-tight text-zinc-900 mb-6">Recent Documents</h2>
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
        {docs.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No documents yet. Start creating!</p>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {docs.map((doc) => (
              <li key={doc.id} className="p-4 hover:bg-zinc-50 transition-colors flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-zinc-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{doc.title}</p>
                    <p className="text-xs text-zinc-500">{new Date(doc.created_at).toLocaleDateString()} • {doc.type.toUpperCase()}</p>
                  </div>
                </div>
                <Link to={`/app/generator?id=${doc.id}`} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium px-3 py-1 rounded-lg hover:bg-indigo-50 transition-colors">
                  View
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
