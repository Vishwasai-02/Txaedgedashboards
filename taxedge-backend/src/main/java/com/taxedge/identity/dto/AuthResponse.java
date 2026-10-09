package com.taxedge.identity.dto;

import com.taxedge.shared.DomainType;
import com.taxedge.shared.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private UserDto user;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserDto {
        private String id;
        private String name;
        private String email;
        private Role role;
        private DomainType domain;
        private String managerId;
        private String avatar;
        private List<String> permissions;
    }
}
