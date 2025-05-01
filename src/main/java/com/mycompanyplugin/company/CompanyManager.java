package com.mycompanyplugin.company;

import com.mycompanyplugin.config.ConfigManager;
import com.mycompanyplugin.data.DataManager;
import com.mycompanyplugin.economy.EconomyManager;
import org.bukkit.Bukkit;
import org.bukkit.entity.Player;
import org.bukkit.configuration.ConfigurationSection;
import org.bukkit.ChatColor;
import org.bukkit.configuration.file.FileConfiguration;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class CompanyManager {

    private static CompanyManager instance;
    private final Map<String, Company> companies;


    private CompanyManager() {
        this.companies = new HashMap<>();
        clearCompanies();
        Bukkit.getScheduler().runTaskTimerAsynchronously(ConfigManager.getInstance().getPlugin(), () -> {
            for (Company company : getAllCompanies()) {
                applyTax(company.getId());
            }
        }, 0L, 1728000L);
    }

    public static CompanyManager getInstance() {

        if (instance == null) {
            instance = new CompanyManager();
        }
        return instance;
    }

    public Company getCompany(String name) {
        return companies.get(name);
    }

    public Company getCompany(UUID uuid) {
        return companies.values().stream().filter(company -> company.getId().equals(uuid)).findFirst().orElse(null);
    }

    public Company getCompanyByName(String name) {
        return companies.get(name);
    }

    public void addCompany(Company company) {
        companies.put(company.getName(), company);
    }

    public void removeCompany(String name) {
        companies.remove(name);
    }
    
    public Collection<Company> getAllCompanies() {
        return companies.values();
    }

    public void applyTax(UUID companyId) {
        Company company = null;
        for (Company comp : getAllCompanies()) {
            if (comp.getId().equals(companyId)) {
                company = comp;
                break;
            }
        }
        if (company == null) return;

        double taxPercentage = ConfigManager.getInstance().getDouble("tax-percentage") / 100;
        double taxAmount = company.getCapital() * taxPercentage;

         if (!EconomyManager.getInstance().withdrawCompany(company.getName(), taxAmount)) {
            Bukkit.getLogger().warning("Not enough money in company " + company.getName() + " for pay tax");
        }
         Bukkit.getLogger().info("Company " + company.getName() + " pay tax: " + taxAmount);
         sendTaxNotification(company, taxAmount);

    }

    private void sendTaxNotification(Company company, double taxAmount) {
        for (UUID memberId : company.getMembers()) {
            Player member = Bukkit.getPlayer(memberId);
            if (member != null && member.isOnline()) {
                member.sendMessage(ChatColor.translateAlternateColorCodes('&',
                        "&a[Company] &eYour company &6" + company.getName() + "&e pay tax &c" + taxAmount + "&e."));
            }
        }
        Player leader = Bukkit.getPlayer(company.getLeader());
        if (leader != null && leader.isOnline()){
            leader.sendMessage(ChatColor.translateAlternateColorCodes('&', "&a[Company] &eYour company &6" + company.getName() + "&e pay tax &c" + taxAmount + "&e."));
        }
    }

    public void saveCompanies(FileConfiguration config) {
        config.set("companies", null);
        for (Company company : companies.values()) {
            String companyName = company.getName();
            config.set("companies." + companyName + ".id", company.getId().toString());
            config.set("companies." + companyName + ".leader", company.getLeader().toString());
            config.set("companies." + companyName + ".capital", company.getCapital());
            config.set("companies." + companyName + ".stockPerCapitalPercentage", company.getStockPerCapitalPercentage());

            for (UUID member : company.getMembers()) {
                config.set("companies." + companyName + ".members."+ member.toString(), member.toString());
            }

        }
    }

    public void loadCompanies(FileConfiguration config) {
        ConfigurationSection companiesSection = config.getConfigurationSection("companies");

        if (companiesSection == null) return;
        for (String companyName : companiesSection.getKeys(false)) {
            UUID id = UUID.fromString(config.getString("companies." + companyName + ".id"));
            UUID leader = UUID.fromString(config.getString("companies." + companyName + ".leader"));
            double capital = config.getDouble("companies." + companyName + ".capital");
            double stockPerCapitalPercentage = config.getDouble("companies." + companyName + ".stockPerCapitalPercentage");
            Company company = new Company(companyName, leader, id, capital, stockPerCapitalPercentage);
            ConfigurationSection membersSection = config.getConfigurationSection("companies." + companyName + ".members");
            if(membersSection != null){
                for(String uuidString : membersSection.getKeys(false)){
                    UUID uuid = UUID.fromString(uuidString);
                    company.addMember(uuid);
                }
            }


            addCompany(company);
        }
    }

    public void clearCompanies(){
        companies.clear();
    }
    public Collection<Company> getCompanies() {
        return companies.values();
    }
}