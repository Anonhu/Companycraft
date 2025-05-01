package com.mycompanyplugin.config;

import com.mycompanyplugin.MyCompanyPlugin;
import org.bukkit.configuration.file.FileConfiguration;
import org.bukkit.configuration.file.YamlConfiguration;

import java.io.File;
import java.io.IOException;

public class ConfigManager {

    private static MyCompanyPlugin plugin;
    private FileConfiguration config;
    private File configFile;
    private static ConfigManager instance;

    private ConfigManager() {
        configFile = new File(plugin.getDataFolder(), "config.yml");
        loadConfig();
    }

    public static ConfigManager getInstance(MyCompanyPlugin plugin) {
        ConfigManager.plugin = plugin;
        if (instance == null) {
            instance = new ConfigManager();
        }
        return instance;
    }

    public void loadConfig() {
        if (!configFile.exists()) {
            plugin.saveResource("config.yml", false);
        }
        config = YamlConfiguration.loadConfiguration(configFile);
    }

    public void saveConfig() {
        try {
            config.save(configFile);
        } catch (IOException e) {
            plugin.getLogger().severe("Could not save config.yml!");
            e.printStackTrace();
        }
    }

    public double getDouble(String path) {
        return config.getDouble(path);
    }

    public String getString(String path) {
        return config.getString(path);
    }

    public boolean getBoolean(String path) {
        return config.getBoolean(path);
    }
    
    public int getInt(String path){
        return config.getInt(path);
    }
}