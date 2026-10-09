package com.taxedge.communication.controller;

import com.taxedge.communication.dto.AgentMonitoringDto;
import com.taxedge.communication.dto.MessageDto;
import com.taxedge.communication.dto.SendMessageRequest;
import com.taxedge.communication.dto.ThreadDto;
import com.taxedge.communication.service.CommunicationService;
import com.taxedge.identity.model.User;
import com.taxedge.identity.service.AuthService;
import com.taxedge.shared.ApiResponse;
import com.taxedge.shared.DomainType;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/communication")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CommunicationController {
    private final CommunicationService communicationService;
    private final AuthService authService;

    @GetMapping("/admin/threads")
    public ApiResponse<List<ThreadDto>> getAdminThreads(@RequestParam(required = false, defaultValue = "ALL") String domain) {
        DomainType d = "ALL".equalsIgnoreCase(domain) ? DomainType.GLOBAL : DomainType.valueOf(domain.toUpperCase());
        List<ThreadDto> threads = communicationService.getAdminThreads(d);
        return ApiResponse.ok(threads);
    }

    @GetMapping("/admin/monitoring")
    public ApiResponse<List<AgentMonitoringDto>> getAgentMonitoring(@RequestParam(required = false, defaultValue = "ALL") String domain) {
        DomainType d = "ALL".equalsIgnoreCase(domain) ? DomainType.GLOBAL : DomainType.valueOf(domain.toUpperCase());
        List<AgentMonitoringDto> monitoring = communicationService.getAgentMonitoring(d);
        return ApiResponse.ok(monitoring);
    }

    @GetMapping("/staff/threads")
    public ApiResponse<List<ThreadDto>> getStaffThreads(
            @RequestParam(required = false) String domain,
            @RequestParam(required = false, defaultValue = "MGR001") String userId) {
        User user = authService.getUserById(userId).orElse(null);
        List<ThreadDto> threads = communicationService.getStaffThreads(user);
        return ApiResponse.ok(threads);
    }

    @PostMapping("/admin/threads/{id}/messages")
    public ApiResponse<MessageDto> sendAdminMessage(
            @PathVariable String id,
            @RequestBody SendMessageRequest request) {
        User admin = authService.getUserById("ADM001").orElse(null);
        MessageDto msg = communicationService.sendMessage(id, request.getText(), admin);
        return ApiResponse.ok(msg);
    }

    @PostMapping("/staff/threads/{id}/messages")
    public ResponseEntity<ApiResponse<MessageDto>> sendStaffMessage(
            @PathVariable String id,
            @RequestBody SendMessageRequest request) {
        try {
            User sender = authService.getUserById(request.getSenderId()).orElse(null);
            MessageDto msg = communicationService.sendMessage(id, request.getText(), sender);
            return ResponseEntity.ok(ApiResponse.ok(msg));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(e.getMessage()));
        }
    }
}
