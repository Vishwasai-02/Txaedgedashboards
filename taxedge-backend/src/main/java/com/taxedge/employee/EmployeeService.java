package com.taxedge.employee;

import com.taxedge.shared.DomainType;
import com.taxedge.shared.Role;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmployeeService {
    private static final List<Employee> EMPLOYEES = List.of(
        Employee.builder().id("MGR001").name("Sanjay Verma").role(Role.CA_MANAGER).domain(DomainType.CA).activeCases(25).rating(4.9).build(),
        Employee.builder().id("MGR002").name("Ananya Deshmukh").role(Role.LOAN_MANAGER).domain(DomainType.LOAN).activeCases(19).rating(4.8).build(),
        Employee.builder().id("AGT001").name("Suresh Kumar").role(Role.CA_AGENT).domain(DomainType.CA).managerId("MGR001").activeCases(14).rating(4.8).build(),
        Employee.builder().id("AGT002").name("Priya Sharma").role(Role.CA_AGENT).domain(DomainType.CA).managerId("MGR001").activeCases(11).rating(4.9).build(),
        Employee.builder().id("AGT003").name("Rajesh Patel").role(Role.LOAN_AGENT).domain(DomainType.LOAN).managerId("MGR002").activeCases(8).rating(4.6).build(),
        Employee.builder().id("AGT004").name("Kavita Iyer").role(Role.LOAN_AGENT).domain(DomainType.LOAN).managerId("MGR002").activeCases(9).rating(4.7).build()
    );

    public List<Employee> getEmployeesByDomain(DomainType domain) {
        if (domain == null || domain == DomainType.GLOBAL) return EMPLOYEES;
        return EMPLOYEES.stream().filter(e -> e.getDomain() == domain).collect(Collectors.toList());
    }

    public List<Employee> getTeamByManager(String managerId) {
        return EMPLOYEES.stream().filter(e -> managerId.equals(e.getManagerId())).collect(Collectors.toList());
    }
}
