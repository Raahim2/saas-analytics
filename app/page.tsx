'use client';

import { useState } from 'react';
import { faker } from '@faker-js/faker';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { OverviewTab } from '@/components/dashboard/OverviewTab';
import { UserPredictionsTab } from '@/components/dashboard/UserPredictionsTab';
import { InsightsTab } from '@/components/dashboard/InsightsTab';
import { UpsellMessagesTab } from '@/components/dashboard/UpsellMessagesTab';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

export type Plan = 'Free' | 'Starter' | 'Pro';

export interface SaaSUser {
  id: string;
  name: string;
  signupDate: string;
  currentPlan: Plan;
  region: string;
  featureUsage7d: number;
  limitHits30d: number;
  teamInvites: number;
  activeDays7d: number;
  upgradedIn30d: boolean;
  propensityScore: number;
  recommendationMessage: string;
}

type TabType = 'overview' | 'predictions' | 'insights' | 'messages';

export default function Home() {
  const [users, setUsers] = useState<SaaSUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<SaaSUser[]>([]);
  const [minPropensity, setMinPropensity] = useState(0.5);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const generateFakeData = () => {
    setIsGenerating(true);

    setTimeout(() => {
      const fakeUsers: SaaSUser[] = [];
      const plans: Plan[] = ['Free', 'Starter', 'Pro'];

      for (let i = 0; i < 500; i++) {
        const activeDays7d = faker.number.int({ min: 0, max: 7 });
        const teamInvites = faker.number.int({ min: 0, max: 20 });
        const limitHits30d = faker.number.int({ min: 0, max: 5 });
        const featureUsage7d = faker.number.int({ min: 0, max: 100 });
        const upgradedIn30d = faker.datatype.boolean();

        const propensityScore = Math.min(
          1,
          Math.max(
            0,
            0.1 * activeDays7d +
            0.15 * teamInvites +
            0.25 * limitHits30d +
            0.2 * (featureUsage7d / 100) +
            faker.number.float({ min: 0, max: 0.3 })
          )
        );

        let recommendationMessage = '';
        if (limitHits30d > 2) {
          recommendationMessage = "You're hitting your feature limits — upgrade to Pro for unlimited access.";
        } else if (teamInvites > 10) {
          recommendationMessage = "Your team is growing fast! Try the Team plan for better collaboration.";
        } else {
          recommendationMessage = "Unlock automation and analytics with the Pro plan!";
        }

        fakeUsers.push({
          id: faker.string.uuid(),
          name: faker.person.fullName(),
          signupDate: faker.date.past({ years: 2 }).toISOString().split('T')[0],
          currentPlan: plans[faker.number.int({ min: 0, max: 2 })],
          region: faker.location.country(),
          featureUsage7d,
          limitHits30d,
          teamInvites,
          activeDays7d,
          upgradedIn30d,
          propensityScore,
          recommendationMessage,
        });
      }

      setUsers(fakeUsers);
      setFilteredUsers([]);
      setIsGenerating(false);
      toast.success('Successfully generated 500 fake SaaS users!');
    }, 500);
  };

  const runRecommendationEngine = () => {
    setIsRunning(true);

    setTimeout(() => {
      const filtered = users.filter(user => user.propensityScore >= minPropensity);
      setFilteredUsers(filtered);
      setIsRunning(false);
      toast.success(`Found ${filtered.length} users with propensity score >= ${minPropensity.toFixed(2)}`);
    }, 300);
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'predictions', label: 'User Predictions' },
    { id: 'insights', label: 'Insights' },
    { id: 'messages', label: 'Upsell Messages' },
  ] as const;

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar
        onGenerateData={generateFakeData}
        onRunEngine={runRecommendationEngine}
        minPropensity={minPropensity}
        onPropensityChange={setMinPropensity}
        isGenerating={isGenerating}
        isRunning={isRunning}
        hasData={users.length > 0}
        filteredUsers={filteredUsers}
      />

      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="border-b bg-white">
          <div className="flex space-x-1 p-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'overview' && <OverviewTab users={users} filteredUsers={filteredUsers} />}
          {activeTab === 'predictions' && <UserPredictionsTab users={filteredUsers} />}
          {activeTab === 'insights' && <InsightsTab users={users} />}
          {activeTab === 'messages' && <UpsellMessagesTab users={filteredUsers} />}
        </div>
      </main>

      <Toaster position="top-right" />
    </div>
  );
}
