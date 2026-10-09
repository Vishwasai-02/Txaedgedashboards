package com.taxedge.task;

import com.taxedge.shared.DomainType;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {
    private static final List<TaskItem> TASKS = List.of(
        TaskItem.builder().id("TSK-101").applicationId("APP001").customerName("Ravi Kumar").service("GST Registration").domain(DomainType.CA).assignedTo("AGT001").priority("HIGH").deadline("2026-09-24").status("IN_PROGRESS").build(),
        TaskItem.builder().id("TSK-102").applicationId("APP004").customerName("Meenakshi Sundaram").service("Private Limited Incorporation").domain(DomainType.CA).assignedTo("AGT001").priority("MEDIUM").deadline("2026-09-26").status("PENDING_MCA_APPROVAL").build(),
        TaskItem.builder().id("TSK-103").applicationId("APP005").customerName("Vikramaditya Rao").service("GST Monthly Return Filing").domain(DomainType.CA).assignedTo("AGT001").priority("LOW").deadline("2026-09-27").status("COMPLETED").build(),
        TaskItem.builder().id("TSK-201").applicationId("APP003").customerName("Kumar Sanu").service("Business Loan Financial Appraisal").domain(DomainType.LOAN).assignedTo("AGT003").priority("HIGH").deadline("2026-09-23").status("IN_PROGRESS").build(),
        TaskItem.builder().id("TSK-202").applicationId("APP004").customerName("Meenakshi Enterprises").service("MSME Working Capital Underwriting").domain(DomainType.LOAN).assignedTo("AGT003").priority("MEDIUM").deadline("2026-09-25").status("PENDING_MCA_APPROVAL").build()
    );

    public List<TaskItem> getAgentTasks(DomainType domain) {
        if (domain == null || domain == DomainType.GLOBAL) return TASKS;
        return TASKS.stream().filter(t -> t.getDomain() == domain).collect(Collectors.toList());
    }

    public TaskItem getTaskById(String taskId) {
        return TASKS.stream().filter(t -> t.getId().equals(taskId)).findFirst().orElse(null);
    }
}
