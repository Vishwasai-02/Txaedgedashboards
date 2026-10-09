package com.taxedge.communication.dto;

import com.taxedge.shared.DomainType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentMonitoringDto {
    private String id;
    private String name;
    private DomainType domain;
    private String manager;
    private String status;
    private String currentApplication;
    private String currentTask;
    private String lastActivity;
    private boolean online;
}
