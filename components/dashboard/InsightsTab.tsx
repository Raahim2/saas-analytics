import { Card } from '@/components/ui/card';
import { SaaSUser, Plan } from '@/app/page';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Lightbulb } from 'lucide-react';

interface InsightsTabProps {
  users: SaaSUser[];
}

export function InsightsTab({ users }: InsightsTabProps) {
  if (users.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Lightbulb className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No Insights Yet</h3>
          <p className="text-slate-600">Generate data to see usage insights</p>
        </div>
      </div>
    );
  }

  const planMetrics: Record<Plan, {
    count: number;
    avgActiveDays: number;
    avgFeatureUsage: number;
    avgLimitHits: number;
    avgTeamInvites: number;
  }> = {
    Free: { count: 0, avgActiveDays: 0, avgFeatureUsage: 0, avgLimitHits: 0, avgTeamInvites: 0 },
    Starter: { count: 0, avgActiveDays: 0, avgFeatureUsage: 0, avgLimitHits: 0, avgTeamInvites: 0 },
    Pro: { count: 0, avgActiveDays: 0, avgFeatureUsage: 0, avgLimitHits: 0, avgTeamInvites: 0 },
  };

  users.forEach(user => {
    const metrics = planMetrics[user.currentPlan];
    metrics.count++;
    metrics.avgActiveDays += user.activeDays7d;
    metrics.avgFeatureUsage += user.featureUsage7d;
    metrics.avgLimitHits += user.limitHits30d;
    metrics.avgTeamInvites += user.teamInvites;
  });

  Object.values(planMetrics).forEach(metrics => {
    if (metrics.count > 0) {
      metrics.avgActiveDays = metrics.avgActiveDays / metrics.count;
      metrics.avgFeatureUsage = metrics.avgFeatureUsage / metrics.count;
      metrics.avgLimitHits = metrics.avgLimitHits / metrics.count;
      metrics.avgTeamInvites = metrics.avgTeamInvites / metrics.count;
    }
  });

  const featureImportance = [
    { feature: 'activeDays7d', importance: 0.30, label: 'Active Days (7d)' },
    { feature: 'limitHits30d', importance: 0.25, label: 'Limit Hits (30d)' },
    { feature: 'teamInvites', importance: 0.25, label: 'Team Invites' },
    { feature: 'featureUsage7d', importance: 0.20, label: 'Feature Usage (7d)' },
  ];

  const avgMetricsByPlan = Object.entries(planMetrics).map(([plan, metrics]) => ({
    plan,
    activeDays: Number(metrics.avgActiveDays.toFixed(1)),
    featureUsage: Number(metrics.avgFeatureUsage.toFixed(1)),
    limitHits: Number(metrics.avgLimitHits.toFixed(1)),
    teamInvites: Number(metrics.avgTeamInvites.toFixed(1)),
  }));

  const importanceColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Insights & Analytics</h2>
        <p className="text-slate-600">Usage patterns and feature importance</p>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Feature Importance</h3>
        <p className="text-sm text-slate-600 mb-6">
          Model weights showing which features best predict upgrade behavior
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={featureImportance} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" domain={[0, 0.35]} stroke="#64748b" />
            <YAxis type="category" dataKey="label" width={150} stroke="#64748b" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [`${(value * 100).toFixed(0)}%`, 'Importance']}
            />
            <Bar dataKey="importance" radius={[0, 8, 8, 0]}>
              {featureImportance.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={importanceColors[index]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Avg Active Days by Plan</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={avgMetricsByPlan}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="plan" stroke="#64748b" />
              <YAxis domain={[0, 7]} stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="activeDays" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Avg Feature Usage by Plan</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={avgMetricsByPlan}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="plan" stroke="#64748b" />
              <YAxis domain={[0, 100]} stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="featureUsage" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Avg Limit Hits by Plan</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={avgMetricsByPlan}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="plan" stroke="#64748b" />
              <YAxis domain={[0, 5]} stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="limitHits" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Avg Team Invites by Plan</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={avgMetricsByPlan}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="plan" stroke="#64748b" />
              <YAxis domain={[0, 20]} stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="teamInvites" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
          <Lightbulb className="h-5 w-5 mr-2 text-blue-600" />
          Key Insights
        </h3>
        <ul className="space-y-2 text-sm text-slate-700">
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>Users who hit feature limits are 25% more likely to upgrade</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>Team collaboration features drive 25% of upgrade propensity</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>Active engagement (7-day activity) is the strongest predictor at 30%</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>Pro plan users show 2x higher feature usage compared to Free plan</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
