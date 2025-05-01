package com.mycompanyplugin.company;

import com.mycompanyplugin.config.ConfigManager;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class Company {
    private String name;
    private UUID leader;
    private List<UUID> members;
    private double capital;   
    private double stockPerCapitalPercentage;

    public Company(String name, UUID leader) {
        this.name = name;
        this.leader = leader;
        this.members = new ArrayList<>();
        ConfigManager configManager = ConfigManager.getInstance();
        this.capital = configManager.getDouble("default-capital");
        this.stockPerCapitalPercentage = configManager.getDouble("stock-per-capital-percentage");

    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public UUID getLeader() {
        return leader;
    }

    public void setLeader(UUID leader) {
        this.leader = leader;
    }

    public List<UUID> getMembers() {
        return members;
    }

    public void addMember(UUID member) {
        if (!members.contains(member)) {
            members.add(member);
        }
    }

    public void removeMember(UUID member) {
        members.remove(member);
    }

    public boolean isMember(UUID member) {
        return members.contains(member);
    }

    public int getMemberCount() {
        return members.size();
    }

    public double getCapital() {
        return capital;
    }

    public void addCapital(double amount) {
        this.capital += amount;
    }

    public void removeCapital(double amount) {
        this.capital -= amount;
    }

    public double getStockPerCapitalPercentage(){
        return stockPerCapitalPercentage;
    }

    public double getTaxPercentage() {
        if (getMemberCount() >= 15 && capital >= 15000) {
            return 5.0;
        } else if (getMemberCount() >= 10 && capital >= 10000) {
            return 4.0;
        } else if (getMemberCount() >= 5 && capital >= 5000) {
             return 3.0;
        } else if (getMemberCount() >= 2 && capital >= 1000) {
            return 2.0;
        } else {
            return 1.0;
        }
    }
}