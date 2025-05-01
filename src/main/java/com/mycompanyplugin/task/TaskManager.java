package com.mycompanyplugin.task;

import org.bukkit.configuration.file.FileConfiguration;
import java.util.Set;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class TaskManager {

    private static TaskManager instance;
    private Map<UUID, List<Task>> tasks;

    private TaskManager() {
        tasks = new HashMap<>();
        clearTasks();
    }

    public static TaskManager getInstance() {
        if (instance == null) {
            instance = new TaskManager();
        }
        return instance;
    }

    public void addTask(UUID companyId, Task task) {
        if (!tasks.containsKey(companyId)) {
            tasks.put(companyId, new ArrayList<>());
        }
        tasks.get(companyId).add(task);
    }

    public void removeTask(UUID companyId, Task task) {
        if (tasks.containsKey(companyId)) {
            tasks.get(companyId).remove(task);
        }
    }

    public List<Task> getCompanyTasks(UUID companyId) {
        return tasks.getOrDefault(companyId, new ArrayList<>());
    }

    public List<Task> getAllTasks() {
        List<Task> allTasks = new ArrayList<>();
        for (List<Task> companyTasks : tasks.values()) {
            allTasks.addAll(companyTasks);
        }
        return allTasks;
    }
    
    public Task getTaskByTargetPlayer(UUID targetPlayer) {
        for (List<Task> companyTasks : tasks.values()) {
            for (Task task : companyTasks) {
                if (task.getTargetPlayer().equals(targetPlayer)) {
                    return task;
                }
            }
        }
        return null;
    }
    public void saveTasks(FileConfiguration config) {
        config.set("tasks", null);
        for (Map.Entry<UUID, List<Task>> entry : tasks.entrySet()) {
            String companyId = entry.getKey().toString();
            List<Task> companyTasks = entry.getValue();
            for (int i = 0; i < companyTasks.size(); i++) {
                Task task = companyTasks.get(i);
                String taskPath = "tasks." + companyId + "." + i + ".";
                config.set(taskPath + "issuer", task.getIssuer().toString());
                config.set(taskPath + "targetPlayer", task.getTargetPlayer().toString());
                config.set(taskPath + "itemName", task.getItemName());
                config.set(taskPath + "amount", task.getAmount());
                config.set(taskPath + "reward", task.getReward());
                config.set(taskPath + "fine", task.getFine());
                config.set(taskPath + "deadline", task.getDeadline());
            }
        }
    }

    public void loadTasks(FileConfiguration config) {
        clearTasks();
        if (config.getConfigurationSection("tasks") == null) return;
        Set<String> companyIds = config.getConfigurationSection("tasks").getKeys(false);
        for (String companyIdStr : companyIds) {
            UUID companyId = UUID.fromString(companyIdStr);
            for (String taskIndex : config.getConfigurationSection("tasks." + companyIdStr).getKeys(false)) {
                String taskPath = "tasks." + companyIdStr + "." + taskIndex + ".";
                UUID issuer = UUID.fromString(config.getString(taskPath + "issuer"));
                UUID targetPlayer = UUID.fromString(config.getString(taskPath + "targetPlayer"));
                String itemName = config.getString(taskPath + "itemName");
                int amount = config.getInt(taskPath + "amount");
                double reward = config.getDouble(taskPath + "reward");
                double fine = config.getDouble(taskPath + "fine");
                long deadline = config.getLong(taskPath + "deadline");
                addTask(companyId, new Task(issuer, targetPlayer, itemName, amount, reward, fine, deadline));
            }
        }
    }
    public void clearTasks(){tasks.clear();}
}