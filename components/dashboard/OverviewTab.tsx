import { Card } from '@/components/ui/card';
import { SaaSUser } from '@/app/page';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Users, DollarSign, Sparkles } from 'lucide-react'; // Import Sparkles for the icon

// ✨ 1. UPDATE THE PROPS INTERFACE TO ACCEPT THE NEW 'aiInsight' PROP
interface OverviewTabProps {
  users: SaaSUser[];
  filteredUsers: SaaSUser[];
  aiInsight: string; 
}

export function OverviewTab({ users, filteredUsers, aiInsight }: OverviewTabProps) { // ✨ 2. RECEIVE THE PROP
  if (users.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Users className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No Data Yet</h3>
          <p className="text-slate-600">Generate Sample SaaS data to get started</p>
        </div>
      </div>
    );
  }

  const totalUsers = users.length;
  const likelyToUpgrade = filteredUsers.length;
  const upgradePercentage = totalUsers > 0 ? ((likelyToUpgrade / totalUsers) * 100).toFixed(1) : '0.0';
  const estimatedMRR = likelyToUpgrade * 49;

  const planCounts = users.reduce((acc, user) => {
    acc[user.currentPlan] = (acc[user.currentPlan] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const planData = Object.entries(planCounts).map(([plan, count]) => ({ plan, count }));

  const propensityBuckets = [
    { range: '0.0-0.2', min: 0, max: 0.2, count: 0 },
    { range: '0.2-0.4', min: 0.2, max: 0.4, count: 0 },
    { range: '0.4-0.6', min: 0.4, max: 0.6, count: 0 },
    { range: '0.6-0.8', min: 0.6, max: 0.8, count: 0 },
    { range: '0.8-1.0', min: 0.8, max: 1.0, count: 0 },
  ];

  users.forEach(user => {
    const bucket = propensityBuckets.find(
      b => user.propensityScore >= b.min && user.propensityScore < b.max
    );
    if (bucket) {
      bucket.count++;
    } else if (user.propensityScore === 1.0) {
      propensityBuckets[propensityBuckets.length - 1].count++;
    }
  });

  const planColors: Record<string, string> = {
    Free: '#3b82f6',
    Starter: '#10b981',
    Pro: '#f59e0b',
  };

  return (
    <div className="space-y-6">
      {/* --- ✨ 3. THIS NEW CARD WILL DISPLAY THE AI INSIGHT WHEN IT EXISTS --- */}
      {aiInsight && (
        <Card className="bg-purple-100 border-l-4 border-purple-500 text-purple-800 p-4" role="alert">
          <div className="flex items-start space-x-3">
            <Sparkles className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-1">AI-Powered Strategic Insight</p>
              <p className="text-purple-700">{aiInsight}</p>
            </div>
          </div>
        </Card>
      )}
      {/* --- END OF NEW CARD --- */}

      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Dashboard Overview</h2>
        <p className="text-slate-600">Key metrics and user distribution</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Users</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{totalUsers}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Likely to Upgrade</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{upgradePercentage}%</p>
              <p className="text-xs text-slate-500 mt-1">{likelyToUpgrade} users</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Estimated MRR Uplift</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">${estimatedMRR.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">at $49/user/mo</p>
            </div>
            <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Users by Plan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={planData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="plan" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {planData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={planColors[entry.plan] || '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Propensity Score Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={propensityBuckets}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="range" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}