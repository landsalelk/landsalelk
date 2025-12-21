'use client';

import { useState, useEffect, useCallback } from 'react';
import { databases } from '@/appwrite';
import { DB_ID, COLLECTION_SUBSCRIBERS } from '@/appwrite/config';
import { Query } from 'appwrite';
import { Loader2, Download, Search, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function NewsletterAdminPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  const loadSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      const queries = [
        Query.orderDesc('subscribed_at'),
        Query.limit(50) // Basic pagination for now
      ];

      if (search) {
        queries.push(Query.startsWith('email', search));
      }

      const res = await databases.listDocuments(
        DB_ID,
        COLLECTION_SUBSCRIBERS,
        queries
      );
      setSubscribers(res.documents);
      setTotal(res.total);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadSubscribers();
  }, [loadSubscribers]);

  const exportCSV = () => {
    const headers = ['Email', 'Status', 'Subscribed At', 'Is Active'];
    const rows = subscribers.map(s => [
      s.email,
      s.status,
      new Date(s.subscribed_at).toLocaleString(),
      s.is_active ? 'Yes' : 'No'
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "subscribers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Newsletter Subscribers</h1>
          <p className="text-slate-500">Total: {total}</p>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search email..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-green-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 font-semibold text-slate-600">Email</th>
                <th className="p-4 font-semibold text-slate-600">Status</th>
                <th className="p-4 font-semibold text-slate-600">Date</th>
                <th className="p-4 font-semibold text-slate-600">Active</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-green-500 mx-auto" />
                  </td>
                </tr>
              ) : subscribers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">
                    No subscribers found
                  </td>
                </tr>
              ) : (
                subscribers.map((sub) => (
                  <tr key={sub.$id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-medium text-slate-800">{sub.email}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize
                        ${sub.status === 'active' ? 'bg-green-100 text-green-700' :
                          sub.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                        {sub.status === 'active' && <CheckCircle className="w-3 h-3" />}
                        {sub.status === 'pending' && <Clock className="w-3 h-3" />}
                        {sub.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 text-sm">
                      {new Date(sub.subscribed_at).toLocaleString()}
                    </td>
                    <td className="p-4">
                      {sub.is_active ? (
                        <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold">Yes</span>
                      ) : (
                        <span className="text-slate-400 bg-slate-100 px-2 py-1 rounded text-xs font-bold">No</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
