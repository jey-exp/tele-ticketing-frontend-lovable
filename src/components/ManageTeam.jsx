import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandEmpty, CommandList, CommandGroup, CommandItem } from '@/components/ui/command';
import { Check, ChevronsUpDown, Loader2, UserPlus, X } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/services/api';
import { cn } from '@/lib/utils';

const ManageTeam = () => {
    const [team, setTeam] = useState(null);
    const [availableEngineers, setAvailableEngineers] = useState([]);
    const [selectedEngineerId, setSelectedEngineerId] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [teamRes, engineersRes] = await Promise.all([
                apiClient.get('/team-lead/team').catch(err => err),
                apiClient.get('/users/unassigned-engineers')
            ]);
            
            if (teamRes.status === 200) {
                setTeam(teamRes.data);
            } else {
                setTeam({ name: 'Your Team (Not yet created)', members: [] });
            }
            setAvailableEngineers(engineersRes.data);
        } catch (err) {
            toast.error("Failed to load team data.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdate = async (payload) => {
        setIsSubmitting(true);
        try {
            await apiClient.patch('/team-lead/team/members', payload);
            toast.success("Team updated successfully.");
            setSelectedEngineerId(''); // Reset selection
            fetchData(); // Refresh all data
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update team.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

    return (
        <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Manage Your Team</h1>
            <p className="text-muted-foreground">Add or remove engineers from your team.</p>
            
            {/* Add Members Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Add New Member</CardTitle>
                    <CardDescription>Select an unassigned engineer to add to your team.</CardDescription>
                </CardHeader>
                <CardContent className="flex gap-4">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" className="w-full justify-between">
                                {availableEngineers.find(e => e.id === selectedEngineerId)?.fullName || "Select an engineer..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command><CommandInput /><CommandList><CommandEmpty>No unassigned engineers available.</CommandEmpty>
                                <CommandGroup>
                                    {availableEngineers.map(e => (
                                        <CommandItem key={e.id} value={e.fullName} onSelect={() => setSelectedEngineerId(e.id)}>
                                            <Check className={cn('mr-2 h-4 w-4', selectedEngineerId === e.id ? "opacity-100" : "opacity-0")} />
                                            {e.fullName} ({e.username})
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList></Command>
                        </PopoverContent>
                    </Popover>
                    <Button onClick={() => handleUpdate({ userIdsToAdd: [selectedEngineerId] })} disabled={!selectedEngineerId || isSubmitting}>
                        {isSubmitting ? <Loader2 className="animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
                        Add to Team
                    </Button>
                </CardContent>
            </Card>

            {/* Current Members Card */}
            <Card>
                <CardHeader><CardTitle>{team?.name || 'Your Team'}</CardTitle><CardDescription>Current team members</CardDescription></CardHeader>
                <CardContent>
                    {team?.members?.length > 0 ? (
                        <ul className="space-y-2">
                            {team.members.map(member => (
                                <li key={member.id} className="flex items-center justify-between p-2 rounded-md bg-muted">
                                    <span>
                                        {member.fullName} ({member.username})
                                        {team.teamLead?.id === member.id && <span className="text-xs font-semibold text-primary ml-2">(Lead)</span>}
                                    </span>
                                    {team.teamLead?.id !== member.id && ( // Prevent removing the lead
                                        <Button size="icon" variant="ghost" onClick={() => handleUpdate({ userIdsToRemove: [member.id] })} disabled={isSubmitting}>
                                            <X className="h-4 w-4 text-destructive" />
                                        </Button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-muted-foreground">Your team has no members yet. Add an engineer to get started.</p>}
                </CardContent>
            </Card>
        </div>
    );
};

export default ManageTeam;