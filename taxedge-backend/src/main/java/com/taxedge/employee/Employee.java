package com.taxedge.employee;

import com.taxedge.shared.DomainType;
import com.taxedge.shared.Role;
import lombok.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Employee {
    private String id;
    private String name;
    private Role role;
    private DomainType domain;
    private String managerId;
    private int activeCases;
    private double rating;
}
