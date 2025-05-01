package com.mycompanyplugin.task;

import java.util.UUID;

public class Task {
    private UUID issuer;
    private UUID targetPlayer;
    private String itemName;
    private int amount;
    private double reward;
    private double fine;
    private long deadline;

    public Task(UUID issuer, UUID targetPlayer, String itemName, int amount, double reward, double fine, long deadline) {
        this.issuer = issuer;
        this.targetPlayer = targetPlayer;
        this.itemName = itemName;
        this.amount = amount;
        this.reward = reward;
        this.fine = fine;
        this.deadline = deadline;
    }

    public UUID getIssuer() {
        return issuer;
    }

    public void setIssuer(UUID issuer) {
        this.issuer = issuer;
    }

    public UUID getTargetPlayer() {
        return targetPlayer;
    }

    public void setTargetPlayer(UUID targetPlayer) {
        this.targetPlayer = targetPlayer;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public int getAmount() {
        return amount;
    }

    public void setAmount(int amount) {
        this.amount = amount;
    }

    public double getReward() {
        return reward;
    }

    public void setReward(double reward) {
        this.reward = reward;
    }

    public double getFine() {
        return fine;
    }

    public void setFine(double fine) {
        this.fine = fine;
    }

    public long getDeadline() {
        return deadline;
    }

    public void setDeadline(long deadline) {
        this.deadline = deadline;
    }

    public boolean isExpired() {
        return System.currentTimeMillis() > deadline;
    }

    public long getTimeRemaining() {
        long remainingTime = deadline - System.currentTimeMillis();
        return Math.max(0, remainingTime);
    }
}