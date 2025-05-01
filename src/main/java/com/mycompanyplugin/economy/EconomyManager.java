package com.mycompanyplugin.economy;

import com.Zrips.CMI.CMI;
import com.Zrips.CMI.Modules.Economy.CMIEconomy;
import com.mycompanyplugin.MyCompanyPlugin;
import com.mycompanyplugin.company.Company;
import com.mycompanyplugin.company.CompanyManager;
import net.milkbowl.vault.economy.Economy;
import net.milkbowl.vault.economy.EconomyResponse;
import org.bukkit.Bukkit;
import org.bukkit.OfflinePlayer;
import org.bukkit.plugin.RegisteredServiceProvider;

import java.util.UUID;

public class EconomyManager {

    private static EconomyManager instance;
    private Economy vaultEconomy;
    private CMIEconomy cmiEconomy;

    private EconomyManager() {
        setupVault();
        setupCMI();
    }

    public static EconomyManager getInstance() {
        if (instance == null) {
            instance = new EconomyManager();
        }
        return instance;
    }

    public boolean setupVault() {
        if (MyCompanyPlugin.getPlugin(MyCompanyPlugin.class).getServer().getPluginManager().getPlugin("Vault") == null) {
            return false;
        }
        RegisteredServiceProvider<Economy> rsp = MyCompanyPlugin.getPlugin(MyCompanyPlugin.class).getServer().getServicesManager().getRegistration(Economy.class);
        if (rsp == null) {
            return false;
        }
        vaultEconomy = rsp.getProvider();
        return vaultEconomy != null;
    }

    public boolean setupCMI() {
        if (MyCompanyPlugin.getPlugin(MyCompanyPlugin.class).getServer().getPluginManager().getPlugin("CMI") == null) {
            return false;
        }
        cmiEconomy = CMI.getInstance().getEconomy();
        return cmiEconomy != null;
    }

    public boolean has(UUID playerUUID, double amount) {
        if (vaultEconomy != null) {
            OfflinePlayer player = Bukkit.getOfflinePlayer(playerUUID);
            return vaultEconomy.has(player, amount);
        } else if (cmiEconomy != null) {
            return cmiEconomy.hasBalance(playerUUID, amount);
        }
        return false;
    }

    public boolean has(String playerName, double amount) {
        if (vaultEconomy != null) {
            OfflinePlayer player = Bukkit.getOfflinePlayer(playerName);
            return vaultEconomy.has(player, amount);
        } else if (cmiEconomy != null) {
            return cmiEconomy.hasBalance(playerName, amount);
        }
        return false;
    }

    public boolean withdraw(UUID playerUUID, double amount) {
        if (vaultEconomy != null) {
            OfflinePlayer player = Bukkit.getOfflinePlayer(playerUUID);
            EconomyResponse response = vaultEconomy.withdrawPlayer(player, amount);
            return response.transactionSuccess();
        } else if (cmiEconomy != null) {
            return cmiEconomy.removeBalance(playerUUID, amount);
        }
        return false;
    }

    public boolean withdraw(String playerName, double amount) {
        if (vaultEconomy != null) {
            OfflinePlayer player = Bukkit.getOfflinePlayer(playerName);
            EconomyResponse response = vaultEconomy.withdrawPlayer(player, amount);
            return response.transactionSuccess();
        } else if (cmiEconomy != null) {
            return cmiEconomy.removeBalance(playerName, amount);
        }
        return false;
    }

    public boolean deposit(UUID playerUUID, double amount) {
        if (vaultEconomy != null) {
            OfflinePlayer player = Bukkit.getOfflinePlayer(playerUUID);
            EconomyResponse response = vaultEconomy.depositPlayer(player, amount);
            return response.transactionSuccess();
        } else if (cmiEconomy != null) {
            return cmiEconomy.addBalance(playerUUID, amount);
        }
        return false;
    }

    public boolean deposit(String playerName, double amount) {
        if (vaultEconomy != null) {
            OfflinePlayer player = Bukkit.getOfflinePlayer(playerName);
            EconomyResponse response = vaultEconomy.depositPlayer(player, amount);
            return response.transactionSuccess();
        } else if (cmiEconomy != null) {
            return cmiEconomy.addBalance(playerName, amount);
        }
        return false;
    }

    public double getBalance(UUID playerUUID) {
        if (vaultEconomy != null) {
            OfflinePlayer player = Bukkit.getOfflinePlayer(playerUUID);
            return vaultEconomy.getBalance(player);
        } else if (cmiEconomy != null) {
            return cmiEconomy.getBalance(playerUUID);
        }
        return 0.0;
    }

    public double getBalance(String playerName) {
         if (vaultEconomy != null) {
            OfflinePlayer player = Bukkit.getOfflinePlayer(playerName);
            return vaultEconomy.getBalance(player);
        } else if (cmiEconomy != null) {
            return cmiEconomy.getBalance(playerName);
        }
        return 0.0;
    }
    public void setBalance(UUID playerUUID, double amount) {
         if (vaultEconomy != null) {
            OfflinePlayer player = Bukkit.getOfflinePlayer(playerUUID);
             vaultEconomy.withdrawPlayer(player, vaultEconomy.getBalance(player));
             vaultEconomy.depositPlayer(player, amount);
        } else if (cmiEconomy != null) {
              cmiEconomy.setBalance(playerUUID, amount);
        }
    }
     public void setBalance(String playerName, double amount) {
         if (vaultEconomy != null) {
            OfflinePlayer player = Bukkit.getOfflinePlayer(playerName);
               vaultEconomy.withdrawPlayer(player, vaultEconomy.getBalance(player));
             vaultEconomy.depositPlayer(player, amount);
        } else if (cmiEconomy != null) {
             cmiEconomy.setBalance(playerName, amount);
        }
    }

    public double getCompanyBalance(String companyName) {
        Company company = CompanyManager.getInstance().getCompany(companyName);
        if (company != null) {
            return company.getCapital();
        }
        return 0.0;
    }

    public void setCompanyBalance(String companyName, double amount) {
        Company company = CompanyManager.getInstance().getCompany(companyName);
        if (company != null) {
            company.setCapital(amount);
        }
    }
}