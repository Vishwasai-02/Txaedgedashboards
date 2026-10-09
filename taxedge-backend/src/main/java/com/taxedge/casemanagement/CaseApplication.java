package com.taxedge.casemanagement;

import com.taxedge.shared.DomainType;
import lombok.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CaseApplication {
    private String id;
    private String customerName;
    private String service;
    private DomainType domain;
    private String assignedExecutive;
    private String priority;
    private String status;
    private double finalAmount;
}
