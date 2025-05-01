package com.mycompanyplugin.data;

import com.mycompanyplugin.MyCompanyPlugin;
import com.mycompanyplugin.company.Company;
import com.mycompanyplugin.company.CompanyManager;
import com.mycompanyplugin.task.Task;
import com.mycompanyplugin.task.TaskManager;
import org.bukkit.configuration.file.FileConfiguration;
import org.bukkit.configuration.file.YamlConfiguration;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class DataManager {

    private static DataManager instance;
    private final File companiesFile;
    private final FileConfiguration companiesConfig;
    private final File tasksFile;
    private final FileConfiguration tasksConfig;
    private final MyCompanyPlugin plugin;

    private DataManager(MyCompanyPlugin plugin) {
        this.plugin = plugin;
        File dataFolder = plugin.getDataFolder();

        if (!dataFolder.exists()) {
            dataFolder.mkdirs();
        }

        companiesFile = new File(dataFolder, "companies.yml");
        if (!companiesFile.exists()) {
            try {
                companiesFile.createNewFile();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        companiesConfig = YamlConfiguration.loadConfiguration(companiesFile);

        tasksFile = new File(dataFolder, "tasks.yml");
        if (!tasksFile.exists()) {
            try {
                tasksFile.createNewFile();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        tasksConfig = YamlConfiguration.loadConfiguration(tasksFile);
    }

    public static DataManager getInstance(MyCompanyPlugin plugin) {
        if (instance == null) {
            instance = new DataManager(plugin);
        }
        return instance;
    }

    public void loadCompanies() {
        CompanyManager companyManager = CompanyManager.getInstance();
        companiesConfig.getKeys(false).forEach(companyName -> {
            UUID leader = UUID.fromString(companiesConfig.getString(companyName + ".leader"));
            double capital = companiesConfig.getDouble(companyName + ".capital");
            List<UUID> members = new ArrayList<>();
            if (companiesConfig.contains(companyName + ".members")) {
                companiesConfig.getStringList(companyName + ".members").forEach(member -> members.add(UUID.fromString(member)));
            }
            Company company = new Company(companyName, leader);
            company.setCapital(capital);
            members.forEach(company::addMember);
            companyManager.addCompany(company);
        });
        plugin.getLogger().info("Companies load!");
    }

    public void saveCompanies() {
        CompanyManager companyManager = CompanyManager.getInstance();
        companiesConfig.getKeys(false).forEach(key -> companiesConfig.set(key, null));
        companyManager.getAllCompanies().forEach(company -> {
            companiesConfig.set(company.getName() + ".leader", company.getLeader().toString());
            companiesConfig.set(company.getName() + ".capital", company.getCapital());
            List<String> members = new ArrayList<>();
            company.getMembers().forEach(member -> members.add(member.toString()));
            companiesConfig.set(company.getName() + ".members", members);
        });

        try {
            companiesConfig.save(companiesFile);
            plugin.getLogger().info("Companies save!");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void loadTasks() {
        TaskManager taskManager = TaskManager.getInstance();
        tasksConfig.getKeys(false).forEach(companyIdStr -> {
            UUID companyId = UUID.fromString(companyIdStr);
            tasksConfig.getConfigurationSection(companyIdStr).getKeys(false).forEach(taskIdStr -> {
                UUID issuer = UUID.fromString(tasksConfig.getString(companyIdStr + "." + taskIdStr + ".issuer"));
                UUID targetPlayer = UUID.fromString(tasksConfig.getString(companyIdStr + "." + taskIdStr + ".targetPlayer"));
                String itemName = tasksConfig.getString(companyIdStr + "." + taskIdStr + ".itemName");
                int amount = tasksConfig.getInt(companyIdStr + "." + taskIdStr + ".amount");
                double reward = tasksConfig.getDouble(companyIdStr + "." + taskIdStr + ".reward");
                double fine = tasksConfig.getDouble(companyIdStr + "." + taskIdStr + ".fine");
                long deadline = tasksConfig.getLong(companyIdStr + "." + taskIdStr + ".deadline");
                Task task = new Task(issuer, targetPlayer, itemName, amount, reward, fine, deadline);
                taskManager.addTask(companyId, task);
            });
        });
        plugin.getLogger().info("Tasks load!");
    }

    public void saveTasks() {
        TaskManager taskManager = TaskManager.getInstance();
        tasksConfig.getKeys(false).forEach(tasksConfig::set);
        taskManager.getAllTasks().forEach((companyId, taskList) -> {
            for (int i = 0; i < taskList.size(); i++) {
                Task task = taskList.get(i);
                tasksConfig.set(companyId.toString() + "." + i + ".issuer", task.getIssuer().toString());
                tasksConfig.set(companyId.toString() + "." + i + ".targetPlayer", task.getTargetPlayer().toString());
                tasksConfig.set(companyId.toString() + "." + i + ".itemName", task.getItemName());
                tasksConfig.set(companyId.toString() + "." + i + ".amount", task.getAmount());
                tasksConfig.set(companyId.toString() + "." + i + ".reward", task.getReward());
                tasksConfig.set(companyId.toString() + "." + i + ".fine", task.getFine());
                tasksConfig.set(companyId.toString() + "." + i + ".deadline", task.getDeadline());
            }
        });

        try {
            tasksConfig.save(tasksFile);
            plugin.getLogger().info("Tasks save!");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void saveAll() {
        saveCompanies();
        saveTasks();
    }
    public void loadAll() {
        loadCompanies();
        loadTasks();
    }
    public void clearData() {
        CompanyManager.getInstance().getAllCompanies().clear();
        TaskManager.getInstance().getAllTasks().clear();
    }
}