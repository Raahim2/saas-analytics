import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { SaaSUser } from '@/app/page';
import { ArrowUpDown, Search, BrainCircuit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface UserPredictionsTabProps {
  users: SaaSUser[];
}

type SortField = 'name' | 'currentPlan' | 'propensityScore';
type SortDirection = 'asc' | 'desc';

export function UserPredictionsTab({ users }: UserPredictionsTabProps) {
  const [sortField, setSortField] = useState<SortField>('propensityScore');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // ✨ This new function creates a smart placeholder if the AI reason is missing.
  const getReasonPlaceholder = (user: SaaSUser): string => {
    if (user.limitHits30d > 3) {
      return "High number of feature limit hits.";
    }
    if (user.teamInvites > 10) {
      return "Significant team invite activity.";
    }
    if (user.activeDays7d >= 6) {
      return "Very high recent user activity.";
    }
    return "General positive usage signals.";
  };

  if (users.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Search className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No Results</h3>
          <p className="text-slate-600">Run the recommendation engine to see predictions</p>
        </div>
      </div>
    );
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    let aValue: string | number = a[sortField];
    let bValue: string | number = b[sortField];

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = (bValue as string).toLowerCase();
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Free': return 'bg-slate-100 text-slate-800';
      case 'Starter': return 'bg-green-100 text-green-800';
      case 'Pro': return 'bg-amber-100 text-amber-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 font-semibold';
    if (score >= 0.6) return 'text-blue-600 font-semibold';
    if (score >= 0.4) return 'text-amber-600 font-semibold';
    return 'text-slate-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">User Predictions</h2>
          <p className="text-slate-600">{users.length} users with high upgrade potential</p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">ID</th>
                <th
                  className="text-left px-6 py-4 text-sm font-semibold text-slate-900 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center space-x-2">
                    <span>Name</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                <th
                  className="text-left px-6 py-4 text-sm font-semibold text-slate-900 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('currentPlan')}
                >
                  <div className="flex items-center space-x-2">
                    <span>Current Plan</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                <th
                  className="text-left px-6 py-4 text-sm font-semibold text-slate-900 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('propensityScore')}
                >
                  <div className="flex items-center space-x-2">
                    <span>Propensity Score</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
                  <div className="flex items-center space-x-2">
                    <BrainCircuit className="h-4 w-4" />
                    <span>Reason</span>
                  </div>
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
                  Recommendation
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                    {user.id.slice(0, 8)}...
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 font-medium">{user.name}</td>
                  <td className="px-6 py-4">
                    <Badge className={getPlanColor(user.currentPlan)}>{user.currentPlan}</Badge>
                  </td>
                  <td className={`px-6 py-4 text-sm ${getScoreColor(user.propensityScore)}`}>
                    {user.propensityScore.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 max-w-xs italic">
                    {/* ✨ This line now shows the real reason OR the smart placeholder */}
                    {user.reason || getReasonPlaceholder(user)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 max-w-md">
                    {user.recommendationMessage}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}