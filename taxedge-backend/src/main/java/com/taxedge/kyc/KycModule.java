package com.taxedge.kyc;

import org.springframework.stereotype.Component;

@Component
public class KycModule {
    public String getModuleName() {
        return "KYC";
    }
}
