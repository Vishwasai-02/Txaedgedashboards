package com.taxedge.audit;

import org.springframework.stereotype.Component;

@Component
public class AuditModule {
    public String getModuleName() {
        return "Audit";
    }
}
