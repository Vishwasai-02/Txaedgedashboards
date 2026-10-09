package com.taxedge.task;

import com.taxedge.shared.DomainType;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskItem {
    private String id;
    private String applicationId;
    private String customerName;
    private String service;
    private DomainType domain;
    private String assignedTo;
    private String priority;
    private String deadline;
    private String status;
}
