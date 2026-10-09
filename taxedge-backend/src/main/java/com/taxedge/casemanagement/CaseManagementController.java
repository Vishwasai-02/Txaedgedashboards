package com.taxedge.casemanagement;

import com.taxedge.shared.ApiResponse;
import com.taxedge.shared.DomainType;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/casemanagement")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CaseManagementController {
    private final CaseManagementService caseManagementService;

    @GetMapping("/incoming")
    public ApiResponse<List<CaseApplication>> getIncoming(@RequestParam(required = false, defaultValue = "CA") String domain) {
        DomainType d = "GLOBAL".equalsIgnoreCase(domain) || "ALL".equalsIgnoreCase(domain) ? DomainType.GLOBAL : DomainType.valueOf(domain.toUpperCase());
        return ApiResponse.ok(caseManagementService.getIncomingQueue(d));
    }

    @GetMapping("/applications/{id}")
    public ApiResponse<CaseApplication> getApplication(@PathVariable String id, @RequestParam(required = false) String domain) {
        DomainType d = domain != null ? DomainType.valueOf(domain.toUpperCase()) : null;
        return ApiResponse.ok(caseManagementService.getCaseById(id, d));
    }
}
