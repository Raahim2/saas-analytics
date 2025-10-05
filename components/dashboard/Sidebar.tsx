import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Download, Play, Sparkles, Upload } from 'lucide-react';
import { SaaSUser } from '@/app/page';
import { useRef } from 'react';

// ✨ 1. UPDATE THE INTERFACE TO ACCEPT THE NEW PROPS
interface SidebarProps {
  onGenerateData: () => void;
  onImportData: (file: File) => void;
  isImporting: boolean;
  onRunEngine: () => void;
  minPropensity: number;
  onPropensityChange: (value: number) => void;
  isGenerating: boolean;
  isRunning: boolean;
  hasData: boolean;
  filteredUsers: SaaSUser[];
  onDiscoverInsights: () => void;
}

export function Sidebar({
  onGenerateData,
  onImportData,
  isImporting,
  onRunEngine,
  minPropensity,
  onPropensityChange,
  isGenerating,
  isRunning,
  hasData,
  filteredUsers,
  onDiscoverInsights,
}: SidebarProps) {
  // ✨ 2. ADD LOGIC TO HANDLE THE FILE INPUT
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportData(file);
    }
    if(event.target) {
      event.target.value = '';
    }
  };

  const downloadCSV = () => {
    if (filteredUsers.length === 0) return;

    const headers = [
      'ID', 'Name', 'Email', 'Signup Date', 'Current Plan', 'Region', 
      'Feature Usage 7d', 'Limit Hits 30d', 'Team Invites', 
      'Active Days 7d', 'Propensity Score', 'AI Reason', 'Recommendation',
    ];

    const rows = filteredUsers.map(user => [
      user.id, user.name, user.email, user.signupDate, user.currentPlan, user.region,
      user.featureUsage7d, user.limitHits30d, user.teamInvites, user.activeDays7d,
      user.propensityScore.toFixed(2), `"${user.reason || ''}"`, `"${user.recommendationMessage}"`
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `upsell-recommendations-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <aside className="w-80 bg-white border-r border-slate-200 p-6 flex flex-col space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Synapse</h1>
        <p className="text-sm text-slate-600 mt-1">AI Upsell Agent</p>
      </div>

      <Card className="p-4 space-y-4">
        <div>
          <h3 className="font-semibold text-slate-900 mb-3">Data Source</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={onGenerateData} disabled={isGenerating || isImporting} className="w-full">
              {isGenerating ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" /> Gen...</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" /> Sample</>
              )}
            </Button>
            {/* ✨ 3. ADD THE NEW IMPORT BUTTON */}
            <Button onClick={handleImportClick} disabled={isGenerating || isImporting} variant="outline" className="w-full">
               {isImporting ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-900 border-t-transparent mr-2" /> Imp...</>
              ) : (
                <><Upload className="mr-2 h-4 w-4" /> Import</>
              )}
            </Button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".csv"
          />
        </div>

        <div className="pt-4 border-t">
          <h3 className="font-semibold text-slate-900 mb-3">Controls</h3>
          <div className="space-y-2">
             <Label htmlFor="propensity-slider" className="text-sm font-medium">
              Minimum Propensity Score
            </Label>
            <div className="flex items-center space-x-3">
              <Slider
                id="propensity-slider"
                min={0} max={1} step={0.01} value={[minPropensity]}
                onValueChange={(values) => onPropensityChange(values[0])}
                className="flex-1"
                disabled={!hasData}
              />
              <span className="text-sm font-semibold text-slate-900 w-12 text-right">
                {minPropensity.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 pt-4 border-t">
          <Button onClick={onRunEngine} disabled={isRunning || !hasData} className="w-full" variant="secondary" size="lg">
            {isRunning ? (
              <><div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-900 border-t-transparent mr-2" /> Running AI...</>
            ) : (
              <><Play className="mr-2 h-4 w-4" /> Run AI Recommendations</>
            )}
          </Button>

          <Button onClick={onDiscoverInsights} disabled={isRunning || !hasData} className="w-full bg-purple-600 text-white hover:bg-purple-700" size="lg">
            <Sparkles className="mr-2 h-4 w-4" />
            Discover AI Insights
          </Button>

          <Button onClick={downloadCSV} disabled={filteredUsers.length === 0} className="w-full" variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download CSV
          </Button>
        </div>
      </Card>
      
      <div className="flex-1" />
      
      <div className="text-xs text-slate-500 space-y-1 text-center">
        <p>Synapse AI Hackathon Project</p>
      </div>
    </aside>
  );
}

