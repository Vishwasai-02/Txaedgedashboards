package com.taxedge.identity.controller;

import com.taxedge.identity.dto.AuthResponse;
import com.taxedge.identity.dto.LoginRequest;
import com.taxedge.identity.service.AuthService;
import com.taxedge.shared.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/identity")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {
    private final AuthService authService;

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@RequestBody LoginRequest request) {
        AuthResponse response = authService.authenticate(request);
        return ApiResponse.ok("Login successful", response);
    }

    @PostMapping("/logout")
    public ApiResponse<String> logout() {
        return ApiResponse.ok("Logged out successfully");
    }
}
