
/**
 * Represents a simulated player in the system.
 */
export interface Player {
  id: string;
  name: string;
  balance: number; // Simulated CMI Vault balance
}

/**
 * Represents a member within a company, linking a player to a rank.
 */
export interface Member {
  playerId: string;
  rank: 'CEO' | 'Manager' | 'Employee';
}

/**
 * Represents a task assigned within a company.
 */
export interface Task {
  id: string;
  description: string; // e.g., "Collect 64 Wood"
  assignedPlayerId: string;
  reward: number; // Coins awarded on completion
  penalty: number; // Coins deducted on failure
  deadline: Date;
  status: 'Pending' | 'Completed' | 'Failed' | 'Expired'; // Expired used if deadline passes before completion/failure marked
  createdAt: Date;
}

/**
 * Represents a player-created company.
 */
export interface Company {
  id: string;
  name: string;
  ownerId: string; // Player ID of the CEO
  members: Member[];
  capital: number; // Company treasury
  tasks: Task[];
  createdAt: Date;
}

/**
 * Represents different levels of permissions within a company.
 */
export enum CompanyPermission {
  MANAGE_MEMBERS = 'MANAGE_MEMBERS', // Invite, remove, change rank
  ASSIGN_TASKS = 'ASSIGN_TASKS',
  MANAGE_FINANCES = 'MANAGE_FINANCES', // Potentially withdraw/deposit (future)
  VIEW_COMPANY = 'VIEW_COMPANY',
}

/**
 * Maps ranks to their permissions.
 */
export const RankPermissions: Record<Member['rank'], CompanyPermission[]> = {
  CEO: [
    CompanyPermission.MANAGE_MEMBERS,
    CompanyPermission.ASSIGN_TASKS,
    CompanyPermission.MANAGE_FINANCES,
    CompanyPermission.VIEW_COMPANY,
  ],
  Manager: [CompanyPermission.ASSIGN_TASKS, CompanyPermission.VIEW_COMPANY],
  Employee: [CompanyPermission.VIEW_COMPANY],
};
