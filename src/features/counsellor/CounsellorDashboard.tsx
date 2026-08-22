import React, { useEffect, useState } from 'react';
import { dashboardService } from '../../services/dashboardService';
import type { CounsellorSignal } from '../../services/types';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import TrendingFlatRoundedIcon from '@mui/icons-material/TrendingFlatRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import { cn } from '../../utils/cn';

export default function CounsellorDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [signals, setSignals] = useState<CounsellorSignal[]>([]);
  const [filter, setFilter] = useState<'all' | 'new' | 'reviewed' | 'contacted' | 'closed'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    await dashboardService.seedMockCounsellorData();
    const data = await dashboardService.listSignals();
    setSignals(data);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passphrase === 'demo') { // Mock gate
      setIsAuthenticated(true);
    } else {
      alert('Mock passphrase is "demo"');
    }
  };

  const handleStatusChange = async (id: string, newStatus: CounsellorSignal['status']) => {
    await dashboardService.updateSignalStatus(id, newStatus);
    loadData();
  };

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-md mx-auto w-full">
        <div className="bg-bg-secondary p-8 rounded-3xl w-full border border-border-subtle shadow-sm text-center">
          <h1 className="text-2xl font-semibold mb-2">Counsellor Access</h1>
          <p className="text-fg-secondary mb-8 text-sm">This is a mock gate. Enter "demo" to view the dashboard.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Passphrase"
              className="w-full bg-bg-primary border border-border-subtle rounded-xl p-4 text-fg-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
            />
            <button
              type="submit"
              className="w-full py-4 px-6 bg-teal-800 hover:bg-teal-900 text-white dark:bg-mint-700 dark:hover:bg-mint-800 rounded-xl font-medium transition-colors focus-ring shadow-sm"
            >
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filteredSignals = signals.filter(s => filter === 'all' || s.status === filter);

  return (
    <div className="flex-1 flex flex-col p-4 max-w-6xl mx-auto w-full pt-8 pb-20">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-fg-heading">Signals Dashboard</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="bg-bg-secondary border border-border-subtle rounded-xl py-2 px-4 focus-ring"
        >
          <option value="all">All Statuses</option>
          <option value="new">New</option>
          <option value="reviewed">Reviewed</option>
          <option value="contacted">Contacted</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="bg-bg-secondary rounded-3xl border border-border-subtle overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-primary border-b border-border-subtle text-sm text-fg-secondary">
                <th className="p-4 font-medium">Anon ID</th>
                <th className="p-4 font-medium">Trend</th>
                <th className="p-4 font-medium">Consent</th>
                <th className="p-4 font-medium">Last Check-in</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSignals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-fg-secondary">No signals found.</td>
                </tr>
              ) : (
                filteredSignals.map(signal => (
                  <React.Fragment key={signal.id}>
                    <tr 
                      className={cn(
                        "border-b border-border-subtle transition-colors cursor-pointer hover:bg-bg-primary",
                        expandedId === signal.id && "bg-bg-primary"
                      )}
                      onClick={() => setExpandedId(expandedId === signal.id ? null : signal.id)}
                    >
                      <td className="p-4">
                        <div className="flex items-center">
                          <span className="font-mono text-teal-800 dark:text-mint-200 font-medium">{signal.anonId}</span>
                          {signal.isDemoData && (
                            <span className="ml-2 text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                              Demo
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          {signal.trendDirection === 'worsening' && <TrendingDownRoundedIcon className="text-red-500 mr-2" fontSize="small" />}
                          {signal.trendDirection === 'improving' && <TrendingUpRoundedIcon className="text-mint-600 mr-2" fontSize="small" />}
                          {signal.trendDirection === 'steady' && <TrendingFlatRoundedIcon className="text-amber-500 mr-2" fontSize="small" />}
                          <span className="capitalize">{signal.trendDirection}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {signal.consentOptedIn ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-mint-100 text-mint-800 dark:bg-mint-900/50 dark:text-mint-200 border border-mint-200 dark:border-mint-800">
                            Opted In
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                            Anonymous
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-sm">
                        {new Date(signal.lastCheckinDate).toLocaleDateString()}
                      </td>
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={signal.status}
                          onChange={(e) => handleStatusChange(signal.id, e.target.value as any)}
                          className="bg-bg-secondary border border-border-subtle rounded-md py-1 px-2 text-sm focus-ring"
                        >
                          <option value="new">New</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="contacted">Contacted</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>
                    </tr>
                    
                    {/* Detail Drawer / Expanded Row */}
                    {expandedId === signal.id && (
                      <tr className="bg-bg-primary border-b border-border-subtle">
                        <td colSpan={5} className="p-0">
                          <div className="p-6">
                            <h3 className="text-sm font-medium text-teal-800 dark:text-teal-200 mb-4 flex items-center">
                              <InfoRoundedIcon fontSize="small" className="mr-2" />
                              Recent Check-in History
                            </h3>
                            <div className="flex space-x-2">
                              {signal.history.map((record) => (
                                <div key={record.id} className="flex-1 bg-bg-secondary border border-border-subtle rounded-xl p-3">
                                  <div className="text-xs text-fg-secondary mb-2">{new Date(record.timestamp).toLocaleDateString()}</div>
                                  <div className="space-y-1">
                                    {Object.entries(record.answers).map(([key, val]) => (
                                      <div key={key} className="flex justify-between items-center">
                                        <span className="text-xs capitalize truncate max-w-[80px]">{key}</span>
                                        <span className={cn(
                                          "w-2 h-2 rounded-full",
                                          val >= 2 ? "bg-red-400" : val === 1 ? "bg-amber-400" : "bg-mint-400"
                                        )} />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
