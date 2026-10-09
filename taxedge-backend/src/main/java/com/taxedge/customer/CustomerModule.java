package com.taxedge.customer;

import org.springframework.stereotype.Component;

@Component
public class CustomerModule {
    public String getModuleName() {
        return "Customer";
    }
}
