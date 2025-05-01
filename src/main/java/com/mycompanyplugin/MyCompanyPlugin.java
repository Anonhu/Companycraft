package com.mycompanyplugin;

import com.mycompanyplugin.commands.CompanyCommand;
import com.mycompanyplugin.data.DataManager;
import com.mycompanyplugin.economy.EconomyManager;
import com.mycompanyplugin.task.TaskManager;
import com.mycompanyplugin.listeners.PlayerEventListener;

import com.mycompanyplugin.config.ConfigManager;
import net.milkbowl.vault.economy.Economy;
import org.bukkit.Bukkit;
import org.bukkit.plugin.RegisteredServiceProvider;
import org.bukkit.plugin.java.JavaPlugin;

import java.util.logging.Logger;

public final class MyCompanyPlugin extends JavaPlugin {

    private static final Logger log = Logger.getLogger("Minecraft");
    private RegisteredServiceProvider<Economy> rspVault;
    private RegisteredServiceProvider<Object> rspCMI;

    @Override

    

    
    public void onEnable() {
        //Config
        try {
            ConfigManager.loadConfig();
            log.info("Config has been loaded!");
        } catch (Exception e) {
            log.severe("Error during config loading: " + e.getMessage());
        }
        //DataManager
        DataManager dataManager = DataManager.getInstance();
        dataManager.loadAll();
        log.info("DataManager has been loaded!");
        
        //Clean data
        dataManager.clearData();
        log.info("DataManager has been cleared!");

        

        //EconomyManager
        EconomyManager economyManager = EconomyManager.getInstance();
        economyManager.setupVault();
        economyManager.setupCMI();
        if (economyManager.getVaultEconomy() == null || economyManager.getCMIEconomy() == null) {
            log.severe("Error during EconomyManager loading, vaultEconomy or cmiEconomy is null");
        } else log.info("EconomyManager has been loaded!");
        //TaskManager
        TaskManager.getInstance();

        //Register listener
        getServer().getPluginManager().registerEvents(new PlayerEventListener(TaskManager.getInstance()), this);
        log.info("PlayerEventListener has been loaded!");
        
        // Vault
        if (getServer().getPluginManager().getPlugin("Vault") != null) {
            rspVault = getServer().getServicesManager().getRegistration(Economy.class);
            if (rspVault != null) {
                log.info("Vault found and hooked.");
            } else {
                log.warning("Vault found but economy service is not available.");
            }
        } else {
            log.warning("Vault not found!");
        }
        // CMI
        if (getServer().getPluginManager().getPlugin("CMI") != null) {
            rspCMI = getServer().getServicesManager().getRegistration((Class<Object>)Object.class);
            if (rspCMI != null) {
                log.info("CMI found and hooked.");
            } else {
                log.warning("CMI found but service is not available.");
            }
        } else {
            log.warning("CMI not found!");
        }
        log.info("TaskManager has been loaded!");
        // Register Command
        getCommand("company").setExecutor(new CompanyCommand(this));
    }

    @Override
    public void onDisable() {
        //DataManager
        DataManager dataManager = DataManager.getInstance();
        dataManager.saveAll();
        log.info("DataManager has been saved!");

        log.info("MyCompanyPlugin has been disabled!");        
        if (rspVault != null) {
            rspVault = null;
        }
        if (rspCMI != null) {
            rspCMI = null;
        }
    }
}