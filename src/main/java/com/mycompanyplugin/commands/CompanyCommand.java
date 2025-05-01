package com.mycompanyplugin.commands;

import com.mycompanyplugin.MyCompanyPlugin;
import com.mycompanyplugin.company.Company;
import com.mycompanyplugin.company.CompanyManager;
import com.mycompanyplugin.task.Task;
import com.mycompanyplugin.task.TaskManager;
import org.bukkit.ChatColor;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.OfflinePlayer;
import org.bukkit.Bukkit;
import org.bukkit.inventory.ItemStack;
import org.bukkit.Material;

import org.bukkit.entity.Player;

public class CompanyCommand implements CommandExecutor {

    private final MyCompanyPlugin plugin;

    public CompanyCommand(MyCompanyPlugin plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player)) {
            sender.sendMessage(ChatColor.RED + "Only players can use this command.");
            return false;
        }

        Player player = (Player) sender;

        if (!player.hasPermission("mycompanyplugin.company")) { // Check for the basic permission
            player.sendMessage(ChatColor.RED + "You do not have permission to use this command.");
            return true;
        }

        if (args.length == 0) {
            sendUsage(player);
            return false;
        }

        String subCommand = args[0].toLowerCase();
        if (!isInCompany(player)){
            if (!subCommand.equals("create")){
                player.sendMessage(ChatColor.RED + "You are not in a company.");
                return true;
            }
        }
        
        if (subCommand.equals("help")){
            sendUsage(player);
            return true;
        }

         if (isInCompany(player)){
            if (subCommand.equals("create")){
                 player.sendMessage(ChatColor.RED + "You already in company.");
                return true;
            }
         }
        if (subCommand.equals("create")) {
            if (args.length != 2) {
                sendUsage(player); 
                return true;
            }
            if (!player.hasPermission("mycompanyplugin.company.create")) {
                player.sendMessage(ChatColor.RED + "You do not have permission to create a company.");
                return true;
            }
        
            String companyName = args[1];
            Company company = new Company(companyName, player.getUniqueId());
            CompanyManager.getInstance().addCompany(company);
            player.sendMessage(ChatColor.GREEN + "Company " + companyName + " created successfully.");
            return true;
        } else if (subCommand.equals("info")) {
            if (!isInCompany(player)){
                player.sendMessage(ChatColor.RED + "You are not in a company.");
                return true;
            }
            if (!player.hasPermission("mycompanyplugin.company.info")) {
                player.sendMessage(ChatColor.RED + "You are not in a company.");
                return true;
            }
           Company company = getPlayerCompany(player);
           if (company == null){
                player.sendMessage(ChatColor.RED + "You are not in a company.");
                return true;
            }
            player.sendMessage(ChatColor.GOLD + "Company Name: " + ChatColor.YELLOW + company.getName());
            player.sendMessage(ChatColor.GOLD + "Leader: " + ChatColor.YELLOW + Bukkit.getOfflinePlayer(company.getLeader()).getName());
            player.sendMessage(ChatColor.GOLD + "Members: " + ChatColor.YELLOW + company.getMembers().size());
            player.sendMessage(ChatColor.GOLD + "Capital: " + ChatColor.YELLOW + company.getCapital());
           return true;

        } else if (subCommand.equals("add")) {
            if (!player.hasPermission("mycompanyplugin.company.add")) {
                player.sendMessage(ChatColor.RED + "You do not have permission to use this command.");
                return true;
            }
             if (args.length != 2) {
                sendUsage(player);
                return true;
            }
           if (!isLeader(player)){
                player.sendMessage(ChatColor.RED + "You are not the leader of the company.");
                return true;
           }
           if (!isInCompany(player)){
                player.sendMessage(ChatColor.RED + "You are not in a company.");
                return true;
            }
            Player target = Bukkit.getPlayer(args[1]);
            if (target == null) {
                player.sendMessage(ChatColor.RED + "Player not found.");
                return true;
            }
            if (isInCompany(target)){
                player.sendMessage(ChatColor.RED + "Player already in company.");
                return true;
            }
             Company company = getPlayerCompany(player);
           company.addMember(target.getUniqueId());
            player.sendMessage(ChatColor.GREEN + "Player " + target.getName() + " added to the company.");
            return true;

        } else if (subCommand.equals("remove")) {
            if (!player.hasPermission("mycompanyplugin.company.removeplayer")) {
                player.sendMessage(ChatColor.RED + "You do not have permission to use this command.");
                return true;
            }
            if (args.length != 2) {
                sendUsage(player);
                return true;
            }
            if (!isLeader(player)){
                player.sendMessage(ChatColor.RED + "You are not the leader of the company.");
                return true;
           }
           if (!isInCompany(player)){
                player.sendMessage(ChatColor.RED + "You are not in a company.");
                return true;
            }
           Player target = Bukkit.getPlayer(args[1]);
            if (target == null) {
                player.sendMessage(ChatColor.RED + "Player not found.");
                return true;
            }
            if (!player.hasPermission("mycompanyplugin.company.removeplayer")) {
                player.sendMessage(ChatColor.RED + "You do not have permission to use this command.");
                return true;
            }
            Company company = getPlayerCompany(player);
           company.removeMember(target.getUniqueId());
            player.sendMessage(ChatColor.GREEN + "Player " + target.getName() + " removed from the company.");
            return true;
        } else if (subCommand.equals("list")) {
               if (!player.hasPermission("mycompanyplugin.company.list")) {
                player.sendMessage(ChatColor.RED + "You do not have permission to use this command.");
            for (Company company : CompanyManager.getInstance().getAllCompanies()) {
                player.sendMessage(ChatColor.YELLOW + "- " + company.getName() + " (Leader: " + Bukkit.getOfflinePlayer(company.getLeader()).getName() + ")");
            }
            return true;
        } else if (subCommand.equals("setleader")) {
            if (!player.hasPermission("mycompanyplugin.company.setleader")) {
                player.sendMessage(ChatColor.RED + "You do not have permission to use this command.");
                return true;
            }
            if (!isInCompany(player)){
                player.sendMessage(ChatColor.RED + "You are not in a company.");
                return true;
            }
            if (!isLeader(player)){
                player.sendMessage(ChatColor.RED + "You are not the leader of the company.");
                return true;
           }
        } else if (subCommand.equals("task")) {
            if (!player.hasPermission("mycompanyplugin.company.task")) {
                player.sendMessage(ChatColor.RED + "You do not have permission to use this command.");
                return true;
            }
            if (!isLeader(player)) {
                player.sendMessage(ChatColor.RED + "You are not the leader of the company.");
                return true;
            }
            if (args.length != 6) {
                sendUsage(player);
                return true;
            }
            Player targetPlayer = Bukkit.getPlayer(args[1]);
            if (targetPlayer == null) {
                player.sendMessage(ChatColor.RED + "Player not found.");
                return true;
            }
            if (!isInCompany(targetPlayer)){
                player.sendMessage(ChatColor.RED + "You do not have permission to use this command.");
                return true;
            }
            if (!player.hasPermission("mycompanyplugin.company.task")) {
                player.sendMessage(ChatColor.RED + "Player not in company.");
                return true;
            }
            String itemName = args[2];
            int amount;
            double fine;
            try {
                amount = Integer.parseInt(args[3]);
                fine = Double.parseDouble(args[4]);
            } catch (NumberFormatException e) {
                player.sendMessage(ChatColor.RED + "Amount and fine must be numbers.");
                return true;
            }
            long deadline = parseTime(args[5]);
            if (deadline == -1) {
                player.sendMessage(ChatColor.RED + "Invalid time format. Use 3d, 12h, or 30m.");
                return true;
            }
            Task task = new Task(player.getUniqueId(), targetPlayer.getUniqueId(), itemName, amount, 0.0, fine, deadline);
            Company company = getPlayerCompany(player);
            TaskManager.getInstance().addTask(company.getCompanyId(), task);
            player.sendMessage(ChatColor.GREEN + "Task created successfully.");
            return true;
        } else if (subCommand.equals("remove")) {
            if (args.length != 1) {
                sendUsage(player);
                return true;
            }
            if (!player.hasPermission("mycompanyplugin.company.remove")) {
                player.sendMessage(ChatColor.RED + "You do not have permission to use this command.");
                return true;
            }
             Company company = CompanyManager.getInstance().getCompanyByLeader(player.getUniqueId());
            if (company == null) {
              player.sendMessage(ChatColor.RED + "You do not have a company.");               return true;
            }
            CompanyManager.getInstance().removeCompany(company.getName());
            player.sendMessage(ChatColor.GREEN + "Company " + company.getName() + " removed successfully.");
            return true;
        } else {
            sendUsage(player);
            return false;
        }
    }
      private long parseTime(String time) {
        long multiplier;
        if (time.endsWith("d")) {
            multiplier = 86400000L; // days
        } else if (time.endsWith("h")) {
            multiplier = 3600000L; // hours
        } else if (time.endsWith("m")) {
            multiplier = 60000L; // minutes
        } else {
            return -1;
        }
        try {
            return System.currentTimeMillis() + Long.parseLong(time.substring(0, time.length() - 1)) * multiplier;
        } catch (NumberFormatException e) {
            return -1;
        }
    }
        private boolean isLeader(Player player){
         Company company = CompanyManager.getInstance().getCompanyByLeader(player.getUniqueId());
         if (company == null){
            return false;
         }
         return true;
    }
    private boolean isInCompany(Player player){
         Company company = getPlayerCompany(player);
         if (company == null){
            return false;
         }
         return true;
    }
     private Company getPlayerCompany(Player player) {
        for (Company company : CompanyManager.getInstance().getAllCompanies()) {
            if (company.getLeader().equals(player.getUniqueId()) || company.getMembers().contains(player.getUniqueId())) {
                return company;
            }
        }
        return null;
    }

    private void sendUsage(Player player) {
        player.sendMessage(ChatColor.YELLOW + "/company help");
        player.sendMessage(ChatColor.YELLOW + "/company create <company name> - mycompanyplugin.company.create");
        player.sendMessage(ChatColor.YELLOW + "/company remove - mycompanyplugin.company.remove");
        player.sendMessage(ChatColor.YELLOW + "/company info - mycompanyplugin.company.info");
        player.sendMessage(ChatColor.YELLOW + "/company add <player> - mycompanyplugin.company.add");
        player.sendMessage(ChatColor.YELLOW + "/company remove <player> - mycompanyplugin.company.removeplayer");
        player.sendMessage(ChatColor.YELLOW + "/company task <player> <item> <amount> <fine> <time> - mycompanyplugin.company.task");
    }
}