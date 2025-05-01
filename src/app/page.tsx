'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import { PickaxeIcon, GoldIngotIcon, CompassIcon, UserIcon, BriefcaseIcon, TaskIcon } from '@/components/icons/minecraft-icons'; // Assuming you create these
import { RefreshCw, UserPlus, UserMinus, LogOut, ChevronsUpDown, PlusCircle, CheckCircle2, XCircle, Clock } from 'lucide-react';

import type { Player, Company, Task, Member } from '@/types';
import {
  getPlayer,
  getPlayerCompany,
  getCompany,
  createCompany,
  addCompanyMember,
  removeCompanyMember,
  addTask,
  completeTask,
  failTask,
  calculateTax,
  getStockPrice,
  parseDuration,
  getPlayerByName,
  updatePlayerBalance, // Import for simulating actions
  updateCompanyCapital, // Import for simulating actions
  applyDailyTaxes,
  checkExpiredTasks
} from '@/lib/data'; // Using the in-memory store

export default function CompanyCraftDashboard() {
  // Simulate logged-in player ID (replace with actual auth state later)
  const loggedInPlayerId = 'player1'; // Start as Steve (CEO of Miner Corp)
  // const loggedInPlayerId = 'player2'; // Start as Alex (Manager of Miner Corp)
  // const loggedInPlayerId = 'player4'; // Start as Villager (no company)


  const [player, setPlayer] = React.useState<Player | null>(null);
  const [company, setCompany] = React.useState<Company | null>(null);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0); // To force re-renders
  const [commandOutput, setCommandOutput] = React.useState<string>(''); // To display results of commands

  // Command input states
   const [commandInput, setCommandInput] = React.useState('');

  // --- Effects ---
  React.useEffect(() => {
    const currentPlayer = getPlayer(loggedInPlayerId);
    if (currentPlayer) {
      setPlayer(currentPlayer);
      const currentCompany = getPlayerCompany(loggedInPlayerId);
      setCompany(currentCompany ?? null);
    } else {
      setPlayer(null);
      setCompany(null);
    }
    setCommandOutput(''); // Clear output on refresh
  }, [loggedInPlayerId, refreshTrigger]);


  // --- Command Handling ---
   const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;
    executeCommand(commandInput);
    setCommandInput(''); // Clear input after submission
  };

  const executeCommand = (fullCommand: string) => {
    const args = fullCommand.trim().split(/\s+/);
    const command = args[0]?.toLowerCase();
    let output = `Executing: ${fullCommand}\n`;

    if (!player) {
        setCommandOutput(output + "Error: Player not loaded.");
        return;
    }

    try { // Wrap command logic in try...catch for better error handling
        switch (command) {
        case '/company':
            if (args.length === 1) {
                 // Display own company info
                 output += company ? `Your Company: ${company.name} (ID: ${company.id})\nCapital: ${company.capital}\nMembers: ${company.members.length}\nTax/day: ${calculateTax(company)}\nStock Price: ${getStockPrice(company)}` : "You are not in a company.";
            } else if (args.length === 3 && args[1].toLowerCase() === 'create') {
                // /company create <name>
                const companyName = args[2];
                const result = createCompany(player.id, companyName);
                if (typeof result === 'string') {
                    output += `Error: ${result}`;
                } else {
                    output += `Company "${result.name}" created successfully!`;
                    setRefreshTrigger(prev => prev + 1); // Refresh data
                }
            } else if (args.length === 3 && args[1].toLowerCase() === 'info') {
                // /company info <name>
                const companyInfo = getCompany(args[2]) || getPlayerCompany(getPlayerByName(args[2])?.id ?? '');
                 output += companyInfo ? `Company: ${companyInfo.name} (ID: ${companyInfo.id})\nCapital: ${companyInfo.capital}\nMembers: ${companyInfo.members.length}\nTax/day: ${calculateTax(companyInfo)}\nStock Price: ${getStockPrice(companyInfo)}` : "Company or player not found.";
            } else if (args.length === 3 && args[1].toLowerCase() === 'invite') {
                 // /company invite <playerName>
                if (!company) { output += "You are not in a company."; break; }
                const targetPlayer = getPlayerByName(args[2]);
                if (!targetPlayer) { output += "Target player not found."; break; }
                const result = addCompanyMember(company.id, player.id, targetPlayer.id);
                output += result;
                 if (result.includes('successfully')) setRefreshTrigger(prev => prev + 1);
            } else if (args.length === 3 && args[1].toLowerCase() === 'kick') {
                 // /company kick <playerName>
                 if (!company) { output += "You are not in a company."; break; }
                 const targetPlayer = getPlayerByName(args[2]);
                 if (!targetPlayer) { output += "Target player not found."; break; }
                 const result = removeCompanyMember(company.id, player.id, targetPlayer.id);
                 output += result;
                 if (result.includes('successfully')) setRefreshTrigger(prev => prev + 1);
            } else if (args.length === 2 && args[1].toLowerCase() === 'leave') {
                 // /company leave
                  if (!company) { output += "You are not in a company."; break; }
                  if (player.id === company.ownerId) { output += "Owner cannot leave the company. Transfer ownership or disband."; break;} // Add disband later
                 const result = removeCompanyMember(company.id, player.id, player.id); // Use remove logic, ensuring self-removal is allowed if not owner
                  output += `Successfully left ${company.name}.`;
                  setRefreshTrigger(prev => prev + 1);
            }
            // Add other subcommands: members, ranks, etc.
            else {
                output += 'Unknown /company command or invalid arguments. Usage:\n/company\n/company create <name>\n/company info <name/player>\n/company invite <player>\n/company kick <player>\n/company leave';
            }
            break;

        case '/tasks':
             if (args.length === 1) {
                // /tasks - list own tasks
                 if (!company) { output += "You are not in a company."; break; }
                 const myTasks = company.tasks.filter(t => t.assignedPlayerId === player.id && (t.status === 'Pending' || t.status === 'Expired'));
                 if (myTasks.length === 0) { output += "You have no pending tasks."; }
                 else {
                    output += "Your tasks:\n";
                    myTasks.forEach(t => {
                         output += `- ID: ${t.id}, Desc: ${t.description}, Reward: ${t.reward}, Penalty: ${t.penalty}, Deadline: ${t.deadline.toLocaleString()}, Status: ${t.status}\n`;
                    });
                 }
            } else if (args.length === 2 && args[1].toLowerCase() === 'list') {
                // /tasks list - list all company tasks (requires permission)
                if (!company) { output += "You are not in a company."; break; }
                // Check permission here if needed
                 if (company.tasks.length === 0) { output += "No tasks assigned in the company."; }
                 else {
                    output += `All tasks for ${company.name}:\n`;
                    company.tasks.forEach(t => {
                        const assigned = getPlayer(t.assignedPlayerId)?.name ?? 'Unknown';
                        output += `- ID: ${t.id}, Assigned: ${assigned}, Desc: ${t.description}, Reward: ${t.reward}, Penalty: ${t.penalty}, Deadline: ${t.deadline.toLocaleString()}, Status: ${t.status}\n`;
                    });
                 }
            }
             else if (args.length >= 7 && args[1].toLowerCase() === 'assign') {
                // /tasks assign <playerName> <reward> <penalty> <duration> <description...>
                if (!company) { output += "You are not in a company."; break; }
                const targetPlayerName = args[2];
                const reward = parseInt(args[3], 10);
                const penalty = parseInt(args[4], 10);
                const durationStr = args[5];
                const description = args.slice(6).join(' ');

                 const targetPlayer = getPlayerByName(targetPlayerName);
                const deadline = parseDuration(durationStr);

                if (!targetPlayer) { output += `Player "${targetPlayerName}" not found.`; break; }
                if (isNaN(reward) || reward <= 0) { output += "Invalid reward amount."; break; }
                if (isNaN(penalty) || penalty < 0) { output += "Invalid penalty amount (must be 0 or positive)."; break; }
                if (!deadline) { output += "Invalid duration format (e.g., 5m, 2h, 3d)."; break; }
                if (!description) { output += "Task description cannot be empty."; break; }


                 const result = addTask(company.id, player.id, targetPlayer.id, description, reward, penalty, deadline);
                 if (typeof result === 'string') {
                    output += `Error: ${result}`;
                 } else {
                    output += `Task assigned successfully to ${targetPlayerName}. Task ID: ${result.id}`;
                     setRefreshTrigger(prev => prev + 1);
                 }
            } else if (args.length === 3 && args[1].toLowerCase() === 'complete') {
                // /tasks complete <taskId>
                 const taskId = args[2];
                 const result = completeTask(taskId, player.id);
                 output += result;
                 if (result.includes('completed!')) setRefreshTrigger(prev => prev + 1);
            } else if (args.length === 3 && args[1].toLowerCase() === 'fail') {
                 // /tasks fail <taskId>
                  const taskId = args[2];
                 const result = failTask(taskId, player.id);
                 output += result;
                 if (result.includes('failed.')) setRefreshTrigger(prev => prev + 1);
            }

             else {
                 output += 'Unknown /tasks command or invalid arguments. Usage:\n/tasks\n/tasks list\n/tasks assign <player> <reward> <penalty> <duration> <description...>\n/tasks complete <taskId>\n/tasks fail <taskId>';
            }
            break;
         // --- Simulation Commands (for testing) ---
         case '/sim':
             if (args.length === 2 && args[1].toLowerCase() === 'nextday') {
                 applyDailyTaxes();
                 checkExpiredTasks();
                 output += "Simulated next day: Taxes applied and expired tasks checked.";
                 setRefreshTrigger(prev => prev + 1);
             } else if (args.length === 4 && args[1].toLowerCase() === 'addbalance') {
                 // /sim addbalance <playerName> <amount>
                 const targetPlayer = getPlayerByName(args[2]);
                 const amount = parseInt(args[3], 10);
                  if (!targetPlayer) { output += "Target player not found."; break; }
                 if (isNaN(amount)) { output += "Invalid amount."; break; }
                 if (updatePlayerBalance(targetPlayer.id, amount)) {
                    output += `Added ${amount} to ${targetPlayer.name}'s balance.`;
                     setRefreshTrigger(prev => prev + 1);
                 } else {
                     output += "Failed to update balance.";
                 }
             } else if (args.length === 3 && args[1].toLowerCase() === 'addcapital') {
                 // /sim addcapital <amount>
                  if (!company) { output += "You are not in a company to add capital to."; break; }
                 const amount = parseInt(args[2], 10);
                 if (isNaN(amount)) { output += "Invalid amount."; break; }
                 if (updateCompanyCapital(company.id, amount)) {
                     output += `Added ${amount} to ${company.name}'s capital.`;
                     setRefreshTrigger(prev => prev + 1);
                 } else {
                     output += "Failed to update capital.";
                 }
             }
              else {
                 output += 'Unknown /sim command. Usage:\n/sim nextday\n/sim addbalance <player> <amount>\n/sim addcapital <amount>';
             }
             break;
        default:
            output += `Unknown command: ${command}`;
        }
     } catch (error: any) {
        console.error("Command execution error:", error);
        output += `\nError executing command: ${error.message || 'Unknown error'}`;
    }


    setCommandOutput(output);
  };


  // --- Render Logic ---
  if (!player) {
    return <div className="p-4">Loading player data...</div>;
  }

  const getRankPermissions = (rank: Member['rank']) => {
    // Simple lookup from RankPermissions (defined in types/index.ts or lib/data.ts)
    // Example: return RankPermissions[rank] || [];
    return []; // Placeholder
  }

  const PlayerInfo = () => (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
           <UserIcon className="w-5 h-5 text-primary" /> Player: {player.name}
        </CardTitle>
        <CardDescription>Your current status and balance.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
           <GoldIngotIcon className="w-5 h-5 text-accent" />
          <span>Balance: {player.balance} Coins</span>
        </div>
      </CardContent>
       <CardFooter>
         <Button variant="outline" size="sm" onClick={() => setRefreshTrigger(prev => prev + 1)}>
           <RefreshCw className="mr-2 h-4 w-4" /> Refresh Data
         </Button>
       </CardFooter>
    </Card>
  );

  const CompanyInfo = () => {
    if (!company) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BriefcaseIcon className="w-5 h-5 text-primary" /> Company Status
            </CardTitle>
            <CardDescription>You are not currently part of any company.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Use <code className="font-mono bg-muted px-1 rounded">/company create [CompanyName]</code> to start your own.</p>
             <p className="mt-2 text-sm text-muted-foreground">Example: <code className="font-mono bg-muted px-1 rounded">/company create TechCorp</code></p>
          </CardContent>
        </Card>
      );
    }

    const tax = calculateTax(company);
    const stockPrice = getStockPrice(company);
    const ownRank = company.members.find(m => m.playerId === player.id)?.rank || 'Unknown';

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
             <BriefcaseIcon className="w-5 h-5 text-primary" /> Company: {company.name}
          </CardTitle>
          <CardDescription>Managed by {getPlayer(company.ownerId)?.name || 'Unknown CEO'}. Your Rank: {ownRank}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">Capital</Label>
              <div className="flex items-center gap-1 font-semibold">
                 <GoldIngotIcon className="w-4 h-4 text-accent" />
                {company.capital} Coins
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Daily Tax</Label>
              <div className="font-semibold">{tax} Coins</div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Members</Label>
              <div className="font-semibold">{company.members.length}</div>
            </div>
             <div>
               <Label className="text-sm text-muted-foreground">Stock Price (per share)</Label>
                <div className="flex items-center gap-1 font-semibold">
                    <GoldIngotIcon className="w-4 h-4 text-accent" />
                   {stockPrice} Coins
                </div>
            </div>
          </div>

          <Separator />

          <Accordion type="single" collapsible className="w-full">
             <AccordionItem value="members">
                <AccordionTrigger>
                  <div className="flex items-center gap-2"><UsersIcon className="w-4 h-4" />Members ({company.members.length})</div>
                </AccordionTrigger>
                <AccordionContent>
                   <Table>
                     {/* <TableCaption>Company member list.</TableCaption> */}
                     <TableHeader>
                       <TableRow>
                         <TableHead>Name</TableHead>
                         <TableHead>Rank</TableHead>
                         <TableHead className="text-right">Actions</TableHead>
                       </TableRow>
                     </TableHeader>
                     <TableBody>
                       {company.members.map((member) => {
                         const memberPlayer = getPlayer(member.playerId);
                         const canManage = hasPermission(ownRank, CompanyPermission.MANAGE_MEMBERS) && member.playerId !== player.id && member.playerId !== company.ownerId;
                         return (
                           <TableRow key={member.playerId}>
                             <TableCell>{memberPlayer?.name || 'Unknown Player'}</TableCell>
                             <TableCell>
                                <Badge variant={member.rank === 'CEO' ? 'default' : member.rank === 'Manager' ? 'secondary' : 'outline'}>
                                  {member.rank}
                                </Badge>
                             </TableCell>
                             <TableCell className="text-right space-x-1">
                               {canManage && (
                                <TooltipProvider>
                                     <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => executeCommand(`/company kick ${memberPlayer?.name}`)}>
                                            <UserMinus className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Kick {memberPlayer?.name}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    {/* Add Promote/Demote later */}
                                     {/* <Tooltip>...</Tooltip> */}
                                </TooltipProvider>

                               )}
                                {player.id === member.playerId && player.id !== company.ownerId && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => executeCommand(`/company leave`)}>
                                                    <LogOut className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Leave Company</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}

                             </TableCell>
                           </TableRow>
                         );
                       })}
                     </TableBody>
                   </Table>
                   {hasPermission(ownRank, CompanyPermission.MANAGE_MEMBERS) && (
                     <div className="mt-2 text-sm text-muted-foreground">
                        Use <code className="font-mono bg-muted px-1 rounded">/company invite [PlayerName]</code> to add members.
                     </div>
                   )}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="tasks">
                 <AccordionTrigger>
                   <div className="flex items-center gap-2"><TaskIcon className="w-4 h-4" />Assigned Tasks ({company.tasks.filter(t => t.status === 'Pending' || t.status === 'Expired').length})</div>
                 </AccordionTrigger>
                 <AccordionContent>
                    <CompanyTasks company={company} currentPlayerId={player.id} />
                     {hasPermission(ownRank, CompanyPermission.ASSIGN_TASKS) && (
                       <div className="mt-2 text-sm text-muted-foreground">
                          Use <code className="font-mono bg-muted px-1 rounded">/tasks assign [Player] [Reward] [Penalty] [Duration] [Description...]</code> to assign tasks.
                          <br/>Example: <code className="font-mono bg-muted px-1 rounded">/tasks assign Alex 100 10 1d Collect 64 Iron Ore</code>
                       </div>
                     )}
                 </AccordionContent>
               </AccordionItem>
          </Accordion>


        </CardContent>
         <CardFooter className="flex justify-between">
            <span className="text-xs text-muted-foreground">Company created: {company.createdAt.toLocaleDateString()}</span>
             {/* Add more actions like deposit/withdraw later if needed */}
          </CardFooter>
      </Card>
    );
  };

 const CompanyTasks = ({ company, currentPlayerId }: { company: Company; currentPlayerId: string }) => {
     const tasks = company.tasks;
     const ownRank = company.members.find(m => m.playerId === currentPlayerId)?.rank || 'Unknown';
      const canManageAnyTask = hasPermission(ownRank, CompanyPermission.ASSIGN_TASKS); // Or a more specific "manage tasks" permission

     if (tasks.length === 0) {
       return <p className="text-sm text-muted-foreground">No tasks have been assigned yet.</p>;
     }

     // Filter tasks: Show all if manager/CEO, only own if employee
      const relevantTasks = canManageAnyTask ? tasks : tasks.filter(t => t.assignedPlayerId === currentPlayerId);

      if (relevantTasks.length === 0 && !canManageAnyTask) {
          return <p className="text-sm text-muted-foreground">You have no assigned tasks.</p>;
      }
       if (relevantTasks.length === 0 && canManageAnyTask) {
           return <p className="text-sm text-muted-foreground">No tasks currently assigned in the company.</p>;
       }


     return (
       <Table>
         <TableHeader>
           <TableRow>
             {canManageAnyTask && <TableHead>Assigned To</TableHead>}
             <TableHead>Task</TableHead>
             <TableHead>Reward</TableHead>
             <TableHead>Penalty</TableHead>
             <TableHead>Deadline</TableHead>
             <TableHead>Status</TableHead>
             <TableHead className="text-right">Actions</TableHead>
           </TableRow>
         </TableHeader>
         <TableBody>
           {relevantTasks.map((task) => {
             const isOwnTask = task.assignedPlayerId === currentPlayerId;
             const assignedPlayer = getPlayer(task.assignedPlayerId);
             const isPending = task.status === 'Pending';
              const isExpired = task.status === 'Expired';
              const isComplete = task.status === 'Completed';
               const isFailed = task.status === 'Failed';
               const canCompleteOrFail = isOwnTask && (isPending || isExpired); // Can fail expired tasks if penalty applies

             return (
               <TableRow key={task.id}>
                  {canManageAnyTask && <TableCell>{assignedPlayer?.name || 'Unknown'}</TableCell>}
                 <TableCell className="font-medium">{task.description}</TableCell>
                 <TableCell className="text-green-600">{task.reward}</TableCell>
                 <TableCell className="text-red-600">{task.penalty}</TableCell>
                 <TableCell>{task.deadline.toLocaleString()}</TableCell>
                 <TableCell>
                   <Badge
                     variant={
                       isComplete ? 'default' // Use primary (grass) for completed
                       : isFailed || isExpired ? 'destructive'
                       : 'secondary' // Stone for pending
                     }
                   >
                     {isComplete ? <CheckCircle2 className="w-3 h-3 mr-1"/> :
                      isFailed || isExpired ? <XCircle className="w-3 h-3 mr-1"/> :
                      <Clock className="w-3 h-3 mr-1"/>
                     }
                     {task.status}
                   </Badge>
                 </TableCell>
                  <TableCell className="text-right space-x-1">
                    {canCompleteOrFail && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => executeCommand(`/tasks complete ${task.id}`)}>
                                    <CheckCircle2 className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Complete Task</p>
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                     <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => executeCommand(`/tasks fail ${task.id}`)}>
                                     <XCircle className="h-4 w-4" />
                                     </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Fail Task (Apply Penalty)</p>
                                </TooltipContent>
                             </Tooltip>
                        </TooltipProvider>
                    )}
                    {/* Add cancel task button for managers/CEO later */}
                   </TableCell>
               </TableRow>
             );
           })}
         </TableBody>
       </Table>
     );
   };

  const CommandInterface = () => (
     <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><CompassIcon className="w-5 h-5 text-primary"/> Command Console</CardTitle>
            <CardDescription>Enter commands to manage your company and tasks.</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleCommandSubmit} className="flex gap-2">
                <Input
                 type="text"
                 placeholder="/company help"
                 value={commandInput}
                 onChange={(e) => setCommandInput(e.target.value)}
                 className="flex-grow font-mono"
                />
                <Button type="submit">Run</Button>
            </form>
             {commandOutput && (
                <div className="mt-4 p-3 bg-muted rounded text-sm font-mono whitespace-pre-wrap overflow-auto max-h-48">
                 {commandOutput}
                </div>
            )}
        </CardContent>
         <CardFooter className="text-xs text-muted-foreground">
            Common Commands: /company, /tasks, /company create, /company invite, /tasks assign
         </CardFooter>
     </Card>
  );


  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center text-primary flex items-center justify-center gap-2">
         <PickaxeIcon className="w-8 h-8" /> CompanyCraft Dashboard <PickaxeIcon className="w-8 h-8" />
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <PlayerInfo />
          <CompanyInfo />
      </div>

        <CommandInterface />


    </div>
  );
}

// Helper Icon components (could be moved)
const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
