package com.mycompanyplugin.listeners;

import com.mycompanyplugin.MyCompanyPlugin;
import com.mycompanyplugin.economy.EconomyManager;
import com.mycompanyplugin.task.Task;
import com.mycompanyplugin.task.TaskManager;
import org.bukkit.Bukkit;
import org.bukkit.Material;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.inventory.InventoryClickEvent;
import org.bukkit.inventory.ItemStack;
import org.bukkit.inventory.PlayerInventory;

import java.util.UUID;

public class PlayerEventListener implements Listener {

    private final TaskManager taskManager;
    private final EconomyManager economyManager;

    public PlayerEventListener(TaskManager taskManager, EconomyManager economyManager) {
        this.taskManager = taskManager;
        this.economyManager = economyManager;
    }

    @EventHandler
    public void onInventoryClick(InventoryClickEvent event) {
        if (!(event.getWhoClicked() instanceof Player)) {
            return;
        }

        Player player = (Player) event.getWhoClicked();
        UUID playerUUID = player.getUniqueId();

        Task task = taskManager.getTaskByTargetPlayer(playerUUID);
        if (task == null) {
            Bukkit.getLogger().info("Player " + player.getName() + " does not have a task.");
            return;
        }

        if (task.isExpired()) {
            handleExpiredTask(player, task);
            return;
        }

        if (event.getCurrentItem() == null || event.getCurrentItem().getType() == Material.AIR) {
            return;
        }

        ItemStack clickedItem = event.getCurrentItem();

        if (clickedItem.getType().name().equalsIgnoreCase(task.getItemName()) ) {
            if(clickedItem.getAmount() >= task.getAmount()){
                completeTask(player, task, clickedItem);
            }
        }
    }

    private void completeTask(Player player, Task task, ItemStack clickedItem) {
        PlayerInventory inventory = player.getInventory();
        inventory.removeItem(new ItemStack(clickedItem.getType(), task.getAmount()));

        economyManager.deposit(task.getTargetPlayer(), task.getReward());
        taskManager.removeTask(null, task); //todo remove company id
        player.sendMessage("Task completed! You received " + task.getReward() + " coins.");
        Bukkit.getLogger().info("Player " + player.getName() + " completed task with id " + task.toString());
    }
    
    private void handleExpiredTask(Player player, Task task) {
        if(economyManager.has(task.getTargetPlayer(), task.getFine())){
            economyManager.withdraw(task.getTargetPlayer(), task.getFine());
            player.sendMessage("§cTask expired! You lost §e" + task.getFine() + " §ccoins.");
            Bukkit.getLogger().info("Player " + player.getName() + " lost task with id " + task.toString());
        } else {
            player.sendMessage("§cTask expired! You dont have §e" + task.getFine() + " §ccoins.");
            Bukkit.getLogger().info("Player " + player.getName() + " dont have money for lost task with id " + task.toString());
        }

        //todo remove company id
        //todo notification about remove
        taskManager.removeTask(null, task);
    }

    public static void registerEvents(MyCompanyPlugin plugin, TaskManager taskManager, EconomyManager economyManager){
        plugin.getServer().getPluginManager().registerEvents(new PlayerEventListener(taskManager, economyManager), plugin);
    }
}
```
```java
package com.mycompanyplugin;

import com.mycompanyplugin.commands.CompanyCommand;
import com.mycompanyplugin.company.CompanyManager;
import com.mycompanyplugin.config.ConfigManager;
import com.mycompanyplugin.economy.EconomyManager;
import com.mycompanyplugin.listeners.PlayerEventListener;
import com.mycompanyplugin.task.TaskManager;
import net.milkbowl.vault.economy.Economy;
import org.bukkit.Bukkit;
import org.bukkit.plugin.RegisteredServiceProvider;
import org.bukkit.plugin.java.JavaPlugin;
import ru.komiss77.economy.CMIEconomy;

public final class MyCompanyPlugin extends JavaPlugin {

    private RegisteredServiceProvider<Economy> vaultProvider = null;
    private RegisteredServiceProvider<CMIEconomy> cmiProvider = null;

    @Override
    public void onEnable() {
        ConfigManager.loadConfig(this);
        EconomyManager economyManager = EconomyManager.getInstance();
        TaskManager taskManager = TaskManager.getInstance();
        ConfigManager.getInstance();
        if (economyManager.setupVault()) {
            Bukkit.getLogger().info("Vault has been hooked!");
        } else {
            Bukkit.getLogger().warning("Vault not found!");
        }

        if (economyManager.setupCMI()) {
            Bukkit.getLogger().info("CMI has been hooked!");
        } else {
            Bukkit.getLogger().warning("CMI not found!");
        }
        PlayerEventListener.registerEvents(this, taskManager, economyManager);

        getCommand("company").setExecutor(new CompanyCommand(this));

        Bukkit.getLogger().info("Config loaded!");
        Bukkit.getLogger().info("EconomyManager loaded!");
        Bukkit.getLogger().info("TaskManager loaded!");
    }

    @Override
    public void onDisable() {
        Bukkit.getLogger().info("MyCompanyPlugin has been disabled!");
    }

    public RegisteredServiceProvider<Economy> getVaultProvider() {
        return vaultProvider;
    }

    public RegisteredServiceProvider<CMIEconomy> getCmiProvider() {
        return cmiProvider;
    }
}