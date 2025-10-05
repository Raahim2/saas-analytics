import { Card } from '@/components/ui/card';
import { SaaSUser } from '@/app/page';
import { Badge } from '@/components/ui/badge';
import { Mail, Target, Zap, Users, Edit, ChevronsUpDown, Rocket } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface UpsellMessagesTabProps {
  users: SaaSUser[];
}

export function UpsellMessagesTab({ users }: UpsellMessagesTabProps) {
  const [editedMessages, setEditedMessages] = useState<Record<string, string>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('');
  const [editText, setEditText] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const sendToAgent = async (user: SaaSUser, message: string) => {
    const API_ENDPOINT_URL = '/api/trigger-workflow';
    try {
      await fetch(API_ENDPOINT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: user.name, email: user.email, message, plan: user.currentPlan }),
      });
    } catch (error) { 
      console.error(`Failed to trigger for ${user.name}:`, error); 
      throw error; 
    }
  };

  const runBulkCampaign = async (category: string, usersToMessage: SaaSUser[]) => {
    if (usersToMessage.length === 0) return;
    const demoUsers = usersToMessage.slice(0, 2);
    const toastId = toast.loading(`Starting campaign for "${getCategoryName(category)}"...`);
    const messageToSend = editedMessages[category] || category;

    try {
      for (const user of demoUsers) {
        await sendToAgent(user, messageToSend);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      toast.success(`Campaign successfully sent!`, { id: toastId });
    } catch (error) { 
      toast.error('Campaign failed.', { id: toastId }); 
    }
  };
  
  const runAllCampaigns = async () => {
    const allCategories = Object.entries(usersByCategory);
    if (allCategories.length === 0) return;

    const toastId = toast.loading(`Launching all ${allCategories.length} campaigns...`);
    
    try {
      for (const [category, categoryUsers] of allCategories) {
        const demoUser = categoryUsers[0]; 
        if(demoUser){
            const messageToSend = editedMessages[category] || category;
            await sendToAgent(demoUser, messageToSend);
            await new Promise(resolve => setTimeout(resolve, 700));
        }
      }
      toast.success('All campaigns have been successfully triggered!', { id: toastId, duration: 5000 });
    } catch (error) {
      toast.error('One or more campaigns failed.', { id: toastId });
    }
  };


  const getCategoryName = (message: string) => {
    if (message.toLowerCase().includes('team')) return 'Team Expansion Campaign';
    if (message.toLowerCase().includes('limit')) return 'Usage Limit Campaign';
    return 'Pro Feature Adoption Campaign';
  };

  const handleOpenEditModal = (category: string) => {
    setCurrentCategory(category);
    setEditText(editedMessages[category] || category);
    setIsModalOpen(true);
  };

  const handleSaveChanges = () => {
    setEditedMessages(prev => ({ ...prev, [currentCategory]: editText }));
    setIsModalOpen(false);
    toast.success("Campaign message updated!");
  };

  const toggleExpanded = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) newSet.delete(category);
      else newSet.add(category);
      return newSet;
    });
  };

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

  const usersByCategory = users.reduce((acc, user) => {
    const category = user.recommendationMessage;
    if (!acc[category]) acc[category] = [];
    acc[category].push(user);
    return acc;
  }, {} as Record<string, SaaSUser[]>);

  return (
    <>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Upsell Campaigns</h2>
            <p className="text-slate-600">Launch targeted campaigns for different user segments identified by the AI.</p>
          </div>
          <Button onClick={runAllCampaigns} size="lg" className="bg-red-600 hover:bg-red-700">
             <Rocket className="mr-2 h-4 w-4" />
             Run All Campaigns
          </Button>
        </div>

        {Object.entries(usersByCategory).map(([category, categoryUsers]) => {
          const isExpanded = expandedCategories.has(category);
          const usersToShow = isExpanded ? categoryUsers : categoryUsers.slice(0, 5);

          return (
            <Card key={category} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-blue-600 uppercase font-semibold">{getCategoryName(category)}</p>
                  <h3 className="text-lg font-semibold text-slate-800 mt-1">
                    {editedMessages[category] || category}
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleOpenEditModal(category)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Message
                  </Button>
                  <Button onClick={() => runBulkCampaign(category, categoryUsers)} className="bg-blue-600 hover:bg-blue-700">
                    <Zap className="mr-2 h-4 w-4" />
                    Run Campaign ({categoryUsers.length} Users)
                  </Button>
                </div>
              </div>
              <p className="text-sm text-slate-500 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                {isExpanded ? `Showing all ${categoryUsers.length} users` : `Showing first 5 of ${categoryUsers.length} users`}
              </p>
              <div className="mt-4 space-y-2">
                {usersToShow.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-md">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-medium text-slate-700">{user.name}</span>
                    </div>
                    <Badge variant="secondary">Score: {user.propensityScore.toFixed(2)}</Badge>
                  </div>
                ))}
              </div>
              {categoryUsers.length > 5 && (
                <div className="mt-4 text-center">
                  <Button variant="ghost" size="sm" onClick={() => toggleExpanded(category)}>
                    <ChevronsUpDown className="mr-2 h-4 w-4" />
                    {isExpanded ? 'Show Less' : 'Show All'}
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Edit Campaign Message</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="message">Message Template</Label>
              <Textarea
                id="message"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveChanges}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

