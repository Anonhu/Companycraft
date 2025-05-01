import type { Company, Player, Task, Member } from '@/types';
import { RankPermissions, CompanyPermission } from '@/types';

// --- In-Memory Data Store ---
let players: Player[] = [
  { id: 'player1', name: 'Steve', balance: 5000 },
  { id: 'player2', name: 'Alex', balance: 2500 },
  { id: 'player3', name: 'Zombie', balance: 100 },
  { id: 'player4', name: 'Villager', balance: 10000 },
];

let companies: Company[] = [
  {
    id: 'comp1',
    name: 'Miner Corp',
    ownerId: 'player1',
    members: [
      { playerId: 'player1', rank: 'CEO' },
      { playerId: 'player2', rank: 'Manager' },
      { playerId: 'player3', rank: 'Employee' },
    ],
    capital: 15000,
    tasks: [],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
];

let nextTaskId = 1;
let nextCompanyId = 2;

// --- Player Management (Simulates CMI Vault Interactions + Local State) ---
export const getPlayer = (playerId: string): Player | undefined => {
  return players.find((p) => p.id === playerId);
};

export const getPlayerByName = (playerName: string): Player | undefined => {
  return players.find((p) => p.name.toLowerCase() === playerName.toLowerCase());
}

export const updatePlayerBalance = (playerId: string, amount: number): boolean => {
  const playerIndex = players.findIndex((p) => p.id === playerId);
  if (playerIndex === -1) return false;
  players[playerIndex].balance += amount;
  // In a real scenario, this would interact with CMI Vault API
  console.log(`Updated balance for ${players[playerIndex].name}: ${players[playerIndex].balance}`);
  return true;
};

// --- Company Management ---
export const getCompany = (companyId: string): Company | undefined => {
  return companies.find((c) => c.id === companyId);
};

export const getCompanyByName = (companyName: string): Company | undefined => {
  return companies.find((c) => c.name.toLowerCase() === companyName.toLowerCase());
};

export const getPlayerCompany = (playerId: string): Company | undefined => {
  return companies.find((c) => c.members.some((m) => m.playerId === playerId));
};

export const createCompany = (ownerId: string, companyName: string): Company | string => {
  const owner = getPlayer(ownerId);
  if (!owner) return 'Player not found.';
  if (getPlayerCompany(ownerId)) return 'Player is already in a company.';
  if (getCompanyByName(companyName)) return 'Company name already exists.';

  const newCompany: Company = {
    id: `comp${nextCompanyId++}`,
    name: companyName,
    ownerId: ownerId,
    members: [{ playerId: ownerId, rank: 'CEO' }],
    capital: 1000, // Starting capital
    tasks: [],
    createdAt: new Date(),
  };
  companies.push(newCompany);
  console.log(`Company created: ${newCompany.name} by ${owner.name}`);
  return newCompany;
};

export const addCompanyMember = (companyId: string, inviterId: string, targetPlayerId: string): string => {
  const company = getCompany(companyId);
  const inviter = getPlayer(inviterId);
  const targetPlayer = getPlayer(targetPlayerId);

  if (!company) return 'Company not found.';
  if (!inviter) return 'Inviter not found.';
  if (!targetPlayer) return 'Target player not found.';

  const inviterMembership = company.members.find((m) => m.playerId === inviterId);
  if (!inviterMembership) return 'Inviter is not a member of this company.';
  if (!hasPermission(inviterMembership.rank, CompanyPermission.MANAGE_MEMBERS)) {
    return 'Inviter does not have permission to manage members.';
  }

  if (company.members.some((m) => m.playerId === targetPlayerId)) {
    return 'Target player is already a member of this company.';
  }
  if (getPlayerCompany(targetPlayerId)) {
    return 'Target player is already in another company.';
  }

  company.members.push({ playerId: targetPlayerId, rank: 'Employee' });
  console.log(`${targetPlayer.name} joined ${company.name}`);
  return `${targetPlayer.name} successfully joined ${company.name}.`;
};

export const removeCompanyMember = (companyId: string, removerId: string, targetPlayerId: string): string => {
    const company = getCompany(companyId);
    const remover = getPlayer(removerId);
    const targetPlayer = getPlayer(targetPlayerId);

    if (!company) return 'Company not found.';
    if (!remover) return 'Remover not found.';
    if (!targetPlayer) return 'Target player not found.';
    if (targetPlayerId === company.ownerId) return "Cannot remove the company owner.";

    const removerMembership = company.members.find((m) => m.playerId === removerId);
    if (!removerMembership) return 'Remover is not a member of this company.';
     if (!hasPermission(removerMembership.rank, CompanyPermission.MANAGE_MEMBERS)) {
        return 'Remover does not have permission to manage members.';
    }

    const targetMemberIndex = company.members.findIndex((m) => m.playerId === targetPlayerId);
    if (targetMemberIndex === -1) {
        return 'Target player is not a member of this company.';
    }

    // Check rank hierarchy (e.g., Managers can't remove CEO, Employees can't remove anyone without permission)
    const targetMembership = company.members[targetMemberIndex];
    if (removerMembership.rank === 'Manager' && targetMembership.rank === 'CEO') {
        return "Managers cannot remove the CEO.";
    }
     if (removerMembership.rank === 'Employee' && targetMembership.rank !== 'Employee') {
         // Basic check, assuming Employees can only remove other Employees if MANAGE_MEMBERS was granted,
         // which isn't default. This logic might need refinement based on specific rank rules.
         return "Employees cannot remove members of higher rank.";
     }


    company.members.splice(targetMemberIndex, 1);
    console.log(`${targetPlayer.name} removed from ${company.name}`);
    return `${targetPlayer.name} successfully removed from ${company.name}.`;
};

export const updateCompanyCapital = (companyId: string, amount: number): boolean => {
  const companyIndex = companies.findIndex((c) => c.id === companyId);
  if (companyIndex === -1) return false;
  companies[companyIndex].capital += amount;
  console.log(`Updated capital for ${companies[companyIndex].name}: ${companies[companyIndex].capital}`);
  return true;
};

// --- Task Management ---
export const addTask = (
  companyId: string,
  assignerId: string,
  assignedPlayerId: string,
  description: string,
  reward: number,
  penalty: number,
  deadline: Date
): Task | string => {
  const company = getCompany(companyId);
  const assigner = getPlayer(assignerId);
  const assignedPlayer = getPlayer(assignedPlayerId);

  if (!company) return 'Company not found.';
  if (!assigner) return 'Assigner not found.';
  if (!assignedPlayer) return 'Assigned player not found.';

  const assignerMembership = company.members.find((m) => m.playerId === assignerId);
  if (!assignerMembership) return 'Assigner is not a member of this company.';
   if (!hasPermission(assignerMembership.rank, CompanyPermission.ASSIGN_TASKS)) {
    return 'Assigner does not have permission to assign tasks.';
  }

  const assignedMembership = company.members.find((m) => m.playerId === assignedPlayerId);
    if (!assignedMembership) return 'Assigned player is not a member of this company.';


  if (company.capital < reward) return 'Company does not have enough capital for this reward.';

  const newTask: Task = {
    id: `task${nextTaskId++}`,
    description,
    assignedPlayerId,
    reward,
    penalty,
    deadline,
    status: 'Pending',
    createdAt: new Date(),
  };
  company.tasks.push(newTask);
  console.log(`Task assigned in ${company.name}: ${description} to ${assignedPlayer.name}`);
  return newTask;
};

export const completeTask = (taskId: string, completingPlayerId: string): string => {
  const company = getPlayerCompany(completingPlayerId);
  if (!company) return 'Player is not in a company.';

  const taskIndex = company.tasks.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) return 'Task not found in your company.';

  const task = company.tasks[taskIndex];
  if (task.assignedPlayerId !== completingPlayerId) return 'This task is not assigned to you.';
  if (task.status !== 'Pending') return `Task status is already ${task.status}.`;
  if (new Date() > task.deadline) {
    task.status = 'Expired';
    return 'Task deadline has passed.';
  }

  // Simulate resource check/submission - In real plugin, this would check inventory/storage
  console.log(`Simulating completion check for task: ${task.description}`);

  // Transfer reward
  if (company.capital < task.reward) {
      return 'Company cannot afford the reward for this task!';
  }
  if (updateCompanyCapital(company.id, -task.reward) && updatePlayerBalance(completingPlayerId, task.reward)) {
    task.status = 'Completed';
    console.log(`Task ${taskId} completed by ${getPlayer(completingPlayerId)?.name}. Reward paid.`);
    return `Task "${task.description}" completed! You received ${task.reward} coins.`;
  } else {
      // Revert capital change if player balance update failed (should ideally be transactional)
      updateCompanyCapital(company.id, task.reward);
      return 'Error processing reward payment.';
  }

};

export const failTask = (taskId: string, failingPlayerId: string): string => {
    const company = getPlayerCompany(failingPlayerId);
    if (!company) return 'Player is not in a company.';

    const taskIndex = company.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return 'Task not found in your company.';

    const task = company.tasks[taskIndex];
    if (task.assignedPlayerId !== failingPlayerId) return 'This task is not assigned to you.';
     if (task.status !== 'Pending' && task.status !== 'Expired') return `Task status is already ${task.status}.`; // Can fail expired tasks if penalty applies


    // Apply penalty
    if (updatePlayerBalance(failingPlayerId, -task.penalty)) {
      // Optionally, decide if penalty goes to company capital or disappears
      // updateCompanyCapital(company.id, task.penalty);
      task.status = 'Failed';
      console.log(`Task ${taskId} failed by ${getPlayer(failingPlayerId)?.name}. Penalty applied.`);
      return `Task "${task.description}" failed. Penalty of ${task.penalty} coins applied.`;
    } else {
      return 'Error applying penalty.';
    }
}

// --- Utility Functions ---
export const calculateTax = (company: Company): number => {
  const memberCount = company.members.length;
  let taxRate = 0.0; // Default 0%

  if (memberCount >= 1 && memberCount < 5) taxRate = 0.01; // 1%
  else if (memberCount >= 5 && memberCount < 10) taxRate = 0.03; // 3%
  else if (memberCount >= 10 && memberCount < 20) taxRate = 0.05; // 5%
  else if (memberCount >= 20) taxRate = 0.07; // 7%

  const taxAmount = Math.floor(company.capital * taxRate);
  return taxAmount > 0 ? taxAmount : 0; // Ensure tax is not negative
};

export const getStockPrice = (company: Company): number => {
  // 1 stock = 10% of capital
  const price = Math.floor(company.capital * 0.10);
   return price > 0 ? price : 1; // Minimum stock price of 1
};

export const hasPermission = (rank: Member['rank'], permission: CompanyPermission): boolean => {
  return RankPermissions[rank]?.includes(permission) ?? false;
};

export const parseDuration = (durationString: string): Date | null => {
    const regex = /^(\d+)([mhd])$/;
    const match = durationString.match(regex);

    if (!match) return null; // Invalid format

    const value = parseInt(match[1], 10);
    const unit = match[2];
    const now = new Date();

    switch (unit) {
        case 'm':
            return new Date(now.getTime() + value * 60 * 1000);
        case 'h': // Added hours for flexibility
             return new Date(now.getTime() + value * 60 * 60 * 1000);
        case 'd':
            return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
        default:
            return null;
    }
}

// Simulate daily tax collection (could be run periodically)
export const applyDailyTaxes = () => {
    console.log("\nApplying daily taxes...");
    companies.forEach(company => {
        const tax = calculateTax(company);
        if (tax > 0) {
             if (updateCompanyCapital(company.id, -tax)) {
                 console.log(`Tax of ${tax} applied to ${company.name}. New capital: ${company.capital}`);
             } else {
                 console.error(`Failed to apply tax to ${company.name}`);
             }
        } else {
             console.log(`No tax applicable for ${company.name}.`);
        }
    });
     console.log("Daily tax application complete.\n");
}

// Simulate checking for expired tasks (could be run periodically)
export const checkExpiredTasks = () => {
     console.log("\nChecking for expired tasks...");
    const now = new Date();
    companies.forEach(company => {
        company.tasks.forEach(task => {
            if (task.status === 'Pending' && now > task.deadline) {
                 // Decide if expired tasks automatically fail and apply penalty
                 console.log(`Task ${task.id} (${task.description}) for player ${task.assignedPlayerId} in company ${company.name} has expired.`);
                 // Option 1: Just mark as expired
                 // task.status = 'Expired';
                 // Option 2: Mark as failed and attempt penalty
                 const result = failTask(task.id, task.assignedPlayerId);
                 console.log(`Expired task auto-fail result: ${result}`)
            }
        })
    });
     console.log("Expired task check complete.\n");
}


// Example: Simulate running daily processes (in a real app, this would be scheduled)
// setTimeout(applyDailyTaxes, 5000); // Apply taxes after 5 seconds
// setTimeout(checkExpiredTasks, 7000); // Check expired tasks after 7 seconds

