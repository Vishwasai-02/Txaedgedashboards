package com.taxedge.payment;

import org.springframework.stereotype.Component;

@Component
public class PaymentModule {
    public String getModuleName() {
        return "Payment";
    }
}
