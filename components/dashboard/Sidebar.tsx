import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Download, Play, Sparkles } from 'lucide-react';
import { SaaSUser } from '@/app/page';

interface SidebarProps {
  onGenerateData: () => void;
  onRunEngine: () => void;
  minPropensity: number;
  onPropensityChange: (value: number) => void;
  isGenerating: boolean;
  isRunning: boolean;
  hasData: boolean;
  filteredUsers: SaaSUser[];
}

export function Sidebar({
  onGenerateData,
  onRunEngine,
  minPropensity,
  onPropensityChange,
  isGenerating,
  isRunning,
  hasData,
  filteredUsers,
}: SidebarProps) {
  const downloadCSV = () => {
    if (filteredUsers.length === 0) return;

    const headers = [
      'ID',
      'Name',
      'Signup Date',
      'Current Plan',
      'Region',
      'Feature Usage 7d',
      'Limit Hits 30d',
      'Team Invites',
      'Active Days 7d',
      'Propensity Score',
      'Recommendation',
    ];

    const rows = filteredUsers.map(user => [
      user.id,
      user.name,
      user.signupDate,
      user.currentPlan,
      user.region,
      user.featureUsage7d,
      user.limitHits30d,
      user.teamInvites,
      user.activeDays7d,
      user.propensityScore.toFixed(2),
      user.recommendationMessage,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `upsell-recommendations-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <aside className="w-80 bg-white border-r border-slate-200 p-6 flex flex-col space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Smart SaaS</h1>
        <p className="text-sm text-slate-600 mt-1">Upsell Agent</p>
      </div>

      <Card className="p-4 space-y-4">
        <div>
          <h3 className="font-semibold text-slate-900 mb-3">Data Generation</h3>
          <Button
            onClick={onGenerateData}
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Fake SaaS Data
              </>
            )}
          </Button>
        </div>

        <div className="pt-4 border-t">
          <Label htmlFor="propensity-slider" className="text-sm font-medium">
            Minimum Propensity Score
          </Label>
          <div className="flex items-center space-x-3 mt-2">
            <Slider
              id="propensity-slider"
              min={0}
              max={1}
              step={0.01}
              value={[minPropensity]}
              onValueChange={(values) => onPropensityChange(values[0])}
              className="flex-1"
              disabled={!hasData}
            />
            <span className="text-sm font-semibold text-slate-900 w-12 text-right">
              {minPropensity.toFixed(2)}
            </span>
          </div>
        </div>

        <Button
          onClick={onRunEngine}
          disabled={isRunning || !hasData}
          className="w-full"
          variant="secondary"
          size="lg"
        >
          {isRunning ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-900 border-t-transparent mr-2" />
              Running...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Run Recommendation Engine
            </>
          )}
        </Button>

        <Button
          onClick={downloadCSV}
          disabled={filteredUsers.length === 0}
          className="w-full"
          variant="outline"
        >
          <Download className="mr-2 h-4 w-4" />
          Download CSV
        </Button>
      </Card>

      <div className="flex-1" />

      <div className="text-xs text-slate-500 space-y-1">
        <p>500 fake users generated</p>
        <p>Using faker-js for data</p>
        <p className="pt-2 border-t">No backend required</p>
      </div>
    </aside>
  );
}
