package com.taxedge.identity.service;

import com.taxedge.identity.dto.AuthResponse;
import com.taxedge.identity.dto.LoginRequest;
import com.taxedge.identity.model.User;
import com.taxedge.identity.repository.UserRepository;
import com.taxedge.shared.DomainType;
import com.taxedge.shared.Role;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;

    @PostConstruct
    public void seedInitialUsers() {
        if (userRepository.count() == 0) {
            List<User> seedList = List.of(
                User.builder()
                    .id("ADM001")
                    .email("admin@taxedge.in")
                    .password("Admin@2026")
                    .fullName("Rohan Sharma")
                    .role(Role.SUPER_ADMIN)
                    .domain(DomainType.GLOBAL)
                    .avatar("RS")
                    .build(),
                User.builder()
                    .id("MGR001")
                    .email("sanjay.verma@taxedge.in")
                    .password("Staff@2026")
                    .fullName("Sanjay Verma")
                    .role(Role.CA_MANAGER)
                    .domain(DomainType.CA)
                    .avatar("SV")
                    .build(),
                User.builder()
                    .id("MGR002")
                    .email("ananya.deshmukh@taxedge.in")
                    .password("Staff@2026")
                    .fullName("Ananya Deshmukh")
                    .role(Role.LOAN_MANAGER)
                    .domain(DomainType.LOAN)
                    .avatar("AD")
                    .build(),
                User.builder()
                    .id("AGT001")
                    .email("suresh.kumar@taxedge.in")
                    .password("Staff@2026")
                    .fullName("Suresh Kumar")
                    .role(Role.CA_AGENT)
                    .domain(DomainType.CA)
                    .managerId("MGR001")
                    .avatar("SK")
                    .build(),
                User.builder()
                    .id("AGT002")
                    .email("priya.sharma@taxedge.in")
                    .password("Staff@2026")
                    .fullName("Priya Sharma")
                    .role(Role.CA_AGENT)
                    .domain(DomainType.CA)
                    .managerId("MGR001")
                    .avatar("PS")
                    .build(),
                User.builder()
                    .id("AGT003")
                    .email("rajesh.patel@taxedge.in")
                    .password("Staff@2026")
                    .fullName("Rajesh Patel")
                    .role(Role.LOAN_AGENT)
                    .domain(DomainType.LOAN)
                    .managerId("MGR002")
                    .avatar("RP")
                    .build(),
                User.builder()
                    .id("AGT004")
                    .email("kavita.iyer@taxedge.in")
                    .password("Staff@2026")
                    .fullName("Kavita Iyer")
                    .role(Role.LOAN_AGENT)
                    .domain(DomainType.LOAN)
                    .managerId("MGR002")
                    .avatar("KI")
                    .build()
            );
            userRepository.saveAll(seedList);
        }
    }

    public AuthResponse authenticate(LoginRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
            .orElseGet(() -> {
                // Fallback demo resolution
                if (email.contains("loan") && email.contains("agent")) {
                    return userRepository.findById("AGT003").orElse(null);
                } else if (email.contains("loan") || email.contains("ananya")) {
                    return userRepository.findById("MGR002").orElse(null);
                } else if (email.contains("suresh") || email.contains("agent")) {
                    return userRepository.findById("AGT001").orElse(null);
                } else if (email.contains("admin")) {
                    return userRepository.findById("ADM001").orElse(null);
                }
                return userRepository.findById("MGR001").orElse(null);
            });

        if (user == null) {
            throw new RuntimeException("Invalid credentials");
        }

        List<String> permissions = new ArrayList<>();
        if (user.getRole() == Role.SUPER_ADMIN) {
            permissions.addAll(List.of("CAN_COMMUNICATE_MANAGER", "CAN_MONITOR_AGENTS"));
        } else if (user.getRole() == Role.CA_MANAGER || user.getRole() == Role.LOAN_MANAGER) {
            permissions.addAll(List.of("CAN_COMMUNICATE_AGENT", "CAN_AUDIT_DOCUMENTS"));
        } else {
            permissions.addAll(List.of("CAN_COMMUNICATE_MANAGER", "CAN_EXECUTE_TASKS"));
        }

        return AuthResponse.builder()
            .token("jwt_token_" + user.getId().toLowerCase() + "_" + System.currentTimeMillis())
            .user(AuthResponse.UserDto.builder()
                .id(user.getId())
                .name(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .domain(user.getDomain())
                .managerId(user.getManagerId())
                .avatar(user.getAvatar())
                .permissions(permissions)
                .build())
            .build();
    }

    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }
}
