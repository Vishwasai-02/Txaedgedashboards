package com.taxedge.casemanagement;

import com.taxedge.shared.DomainType;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CaseManagementService {
    private static final List<CaseApplication> CASES = List.of(
        CaseApplication.builder().id("APP001").customerName("Ravi Kumar").service("GST Registration").domain(DomainType.CA).assignedExecutive("Suresh Kumar").priority("HIGH").status("PROCESSING").finalAmount(5500).build(),
        CaseApplication.builder().id("APP002").customerName("Anil Sharma").service("ITR Filing (Salaried)").domain(DomainType.CA).assignedExecutive("Priya Sharma").priority("MEDIUM").status("PAYMENT_PENDING").finalAmount(2500).build(),
        CaseApplication.builder().id("APP003").customerName("Kumar Sanu").service("Business Loan Assistance").domain(DomainType.LOAN).assignedExecutive("Rajesh Patel").priority("HIGH").status("ADDITIONAL_DOCUMENT_REQUIRED").finalAmount(7500).build(),
        CaseApplication.builder().id("APP004").customerName("Meenakshi Enterprises").service("MSME Working Capital Loan").domain(DomainType.LOAN).assignedExecutive("Kavita Iyer").priority("HIGH").status("PROCESSING").finalAmount(12500).build()
    );

    public List<CaseApplication> getIncomingQueue(DomainType domain) {
        if (domain == null || domain == DomainType.GLOBAL) return CASES;
        return CASES.stream().filter(c -> c.getDomain() == domain).collect(Collectors.toList());
    }

    public CaseApplication getCaseById(String id, DomainType domain) {
        return CASES.stream()
            .filter(c -> c.getId().equals(id) && (domain == null || domain == DomainType.GLOBAL || c.getDomain() == domain))
            .findFirst()
            .orElse(null);
    }
}
