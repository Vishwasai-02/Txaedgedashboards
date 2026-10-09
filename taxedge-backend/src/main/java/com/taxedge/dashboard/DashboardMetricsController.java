package com.taxedge.dashboard;

import com.taxedge.shared.ApiResponse;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/dashboard")
@CrossOrigin(origins = "*")
public class DashboardMetricsController {

    @GetMapping("/manager/metrics")
    public ApiResponse<Map<String, Object>> getManagerMetrics(@RequestParam(required = false, defaultValue = "CA") String domain) {
        if ("LOAN".equalsIgnoreCase(domain)) {
            return ApiResponse.ok(Map.of(
                "totalCustomers", "185",
                "totalApplications", "340",
                "newApplications", "8",
                "pendingApplications", "19",
                "documentsPending", "7",
                "paymentsPending", "4",
                "tasksPending", "12",
                "completedApplications", "321",
                "todaysTasks", "15",
                "overdueTasks", "1",
                "revenue", "₹ 18.6 L"
            ));
        }

        return ApiResponse.ok(Map.of(
            "totalCustomers", "420",
            "totalApplications", "840",
            "newApplications", "18",
            "pendingApplications", "42",
            "documentsPending", "14",
            "paymentsPending", "9",
            "tasksPending", "26",
            "completedApplications", "798",
            "todaysTasks", "34",
            "overdueTasks", "2",
            "revenue", "₹ 12.4 L"
        ));
    }
}
