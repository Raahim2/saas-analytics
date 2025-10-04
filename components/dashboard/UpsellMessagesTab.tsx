import { Card } from '@/components/ui/card';
import { SaaSUser } from '@/app/page';
import { Badge } from '@/components/ui/badge';
import { Mail, Target } from 'lucide-react';

interface UpsellMessagesTabProps {
  users: SaaSUser[];
}

export function UpsellMessagesTab({ users }: UpsellMessagesTabProps) {
  if (users.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Mail className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No Messages Yet</h3>
          <p className="text-slate-600">Run the recommendation engine to generate upsell messages</p>
        </div>
      </div>
    );
  }

  const topUsers = [...users]
    .sort((a, b) => b.propensityScore - a.propensityScore)
    .slice(0, 10);

  const getScoreBadge = (score: number) => {
    if (score >= 0.8) {
      return <Badge className="bg-green-100 text-green-800">High Priority</Badge>;
    } else if (score >= 0.6) {
      return <Badge className="bg-blue-100 text-blue-800">Medium Priority</Badge>;
    }
    return <Badge className="bg-slate-100 text-slate-800">Low Priority</Badge>;
  };

  const exampleUser = topUsers[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Upsell Messages</h2>
        <p className="text-slate-600">Top 10 users with personalized upgrade recommendations</p>
      </div>

      <div className="space-y-4">
        {topUsers.map((user, index) => (
          <Card key={user.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold text-slate-900">{user.name}</h3>
                    {getScoreBadge(user.propensityScore)}
                  </div>
                  <p className="text-sm text-slate-600 mt-1">
                    Current Plan: {user.currentPlan} • Score: {user.propensityScore.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-900">#{index + 1}</div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-start space-x-2">
                <Target className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-slate-700">{user.recommendationMessage}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-slate-600">Active Days</p>
                <p className="font-semibold text-slate-900">{user.activeDays7d}/7</p>
              </div>
              <div>
                <p className="text-slate-600">Feature Usage</p>
                <p className="font-semibold text-slate-900">{user.featureUsage7d}%</p>
              </div>
              <div>
                <p className="text-slate-600">Limit Hits</p>
                <p className="font-semibold text-slate-900">{user.limitHits30d}</p>
              </div>
              <div>
                <p className="text-slate-600">Team Invites</p>
                <p className="font-semibold text-slate-900">{user.teamInvites}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {exampleUser && (
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-slate-50 border-blue-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <Mail className="h-5 w-5 mr-2 text-blue-600" />
            Email Preview
          </h3>

          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-600 uppercase font-semibold mb-1">To</p>
                <p className="text-slate-900">{exampleUser.name}</p>
              </div>

              <div>
                <p className="text-xs text-slate-600 uppercase font-semibold mb-1">Subject</p>
                <p className="text-slate-900 font-medium">
                  Unlock Pro features for your growing team!
                </p>
              </div>

              <div className="border-t pt-4">
                <p className="text-xs text-slate-600 uppercase font-semibold mb-3">Body</p>
                <div className="space-y-3 text-slate-700">
                  <p>Hi {exampleUser.name.split(' ')[0]},</p>

                  <p>
                    We noticed you've been actively using our platform lately — {exampleUser.activeDays7d} active
                    days in the past week! That's great to see.
                  </p>

                  <p>
                    {exampleUser.recommendationMessage}
                  </p>

                  <p>
                    Upgrade to Pro today and get:
                  </p>

                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Unlimited exports and API calls</li>
                    <li>Advanced automation workflows</li>
                    <li>Priority support</li>
                    <li>Custom integrations</li>
                  </ul>

                  <p>
                    Click here to upgrade and unlock the full potential of our platform.
                  </p>

                  <p className="pt-2">
                    Best regards,<br />
                    The Smart SaaS Team
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
