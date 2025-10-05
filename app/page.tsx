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
  email: string;
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
  reason?: string;
}

type TabType = 'overview' | 'predictions' | 'insights' | 'messages';

export default function Home() {
  const [users, setUsers] = useState<SaaSUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<SaaSUser[]>([]);
  const [minPropensity, setMinPropensity] = useState(0.5);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [aiInsight, setAiInsight] = useState('');

  const generateSampleData = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const sampleUsers: SaaSUser[] = [];
      const plans: Plan[] = ['Free', 'Starter', 'Pro'];

      for (let i = 0; i < 500; i++) {
        const name = faker.person.fullName();
        const activeDays7d = faker.number.int({ min: 0, max: 7 });
        const teamInvites = faker.number.int({ min: 0, max: 20 });
        const limitHits30d = faker.number.int({ min: 0, max: 5 });
        const featureUsage7d = faker.number.int({ min: 0, max: 100 });
        const upgradedIn30d = faker.datatype.boolean();

        sampleUsers.push({
          id: faker.string.uuid(),
          name: name,
          email: faker.internet.email({ firstName: name.split(' ')[0], lastName: name.split(' ')[1] }),
          signupDate: faker.date.past({ years: 2 }).toISOString().split('T')[0],
          currentPlan: plans[faker.number.int({ min: 0, max: 2 })],
          region: faker.location.country(),
          featureUsage7d,
          limitHits30d,
          teamInvites,
          activeDays7d,
          upgradedIn30d,
          propensityScore: 0,
          recommendationMessage: '',
        });
      }

      setUsers(sampleUsers);
      setFilteredUsers([]);
      setIsGenerating(false);
      toast.success('Successfully generated sample users!');
    }, 500);
  };

  const importData = (file: File) => {
    setIsImporting(true);
    toast.info("Importing CSV data...");
    const reader = new FileReader();

    reader.onload = (e) => {
        const text = e.target?.result as string;
        try {
            const lines = text.split('\n').filter(line => line.trim() !== '');
            const headers = lines.shift()?.trim().split(',');

            if (!headers || lines.length === 0) throw new Error("CSV is empty or invalid.");

            const importedUsers: SaaSUser[] = lines.map(line => {
                const values = line.trim().split(',');
                return {
                    id: faker.string.uuid(),
                    name: values[0] || 'N/A',
                    email: values[1] || 'N/A',
                    signupDate: values[2] || new Date().toISOString().split('T')[0],
                    currentPlan: (values[3] as Plan) || 'Free',
                    region: values[4] || 'N/A',
                    featureUsage7d: parseInt(values[5]) || 0,
                    limitHits30d: parseInt(values[6]) || 0,
                    teamInvites: parseInt(values[7]) || 0,
                    activeDays7d: parseInt(values[8]) || 0,
                    upgradedIn30d: values[9] === 'true' || values[9] === '1',
                    propensityScore: 0,
                    recommendationMessage: '',
                    reason: ''
                };
            });

            setUsers(importedUsers);
            setFilteredUsers([]);
            toast.success(`${importedUsers.length} users imported successfully!`);
        } catch (error) {
            toast.error("Failed to parse CSV file. Please check the format.");
            console.error(error);
        }
        setIsImporting(false);
    };

    reader.onerror = () => {
        toast.error("Failed to read the file.");
        setIsImporting(false);
    };

    reader.readAsText(file);
  };

  const runRecommendationEngine = async () => {
    setIsRunning(true);
    toast.info('🚀 Sending user data to the AI for analysis...');

    try {
      const response = await fetch('/api/generate-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users }),
      });

      if (!response.ok) {
        throw new Error('AI analysis failed on the server.');
      }

      const aiPoweredUsers: SaaSUser[] = await response.json();
      setUsers(aiPoweredUsers);

      const filtered = aiPoweredUsers.filter(
        (user) => user.propensityScore >= minPropensity
      );
      setFilteredUsers(filtered);

      toast.success(
        `🤖 AI analysis complete! Found ${filtered.length} high-propensity users.`
      );
    } catch (error) {
      toast.error('An error occurred during AI analysis.');
      console.error(error);
    }

    setIsRunning(false);
  };

  const discoverInsights = async () => {
    toast.info('🕵️‍♂️ Asking the AI to analyze user cohorts for new insights...');
    try {
      const response = await fetch('/api/discover-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users }),
      });
      if (!response.ok) {
        throw new Error('Insight discovery failed on the server.');
      }
      const data = await response.json();
      setAiInsight(data.insight);
      toast.success('✨ New strategic insight discovered!');
    } catch (error) {
      toast.error('An error occurred during insight discovery.');
      console.error(error);
    }
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
        onGenerateData={generateSampleData}
        onImportData={importData}
        isImporting={isImporting}
        onRunEngine={runRecommendationEngine}
        minPropensity={minPropensity}
        onPropensityChange={setMinPropensity}
        isGenerating={isGenerating}
        isRunning={isRunning}
        hasData={users.length > 0}
        filteredUsers={filteredUsers}
        onDiscoverInsights={discoverInsights}
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
          {activeTab === 'overview' && (
            <OverviewTab
              users={users}
              filteredUsers={filteredUsers}
              aiInsight={aiInsight}
            />
          )}
          {activeTab === 'predictions' && <UserPredictionsTab users={filteredUsers} />}
          {activeTab === 'insights' && <InsightsTab users={users} />}
          {activeTab === 'messages' && <UpsellMessagesTab users={filteredUsers} />}
        </div>
      </main>

      <Toaster position="top-right" />
    </div>
  );
}

