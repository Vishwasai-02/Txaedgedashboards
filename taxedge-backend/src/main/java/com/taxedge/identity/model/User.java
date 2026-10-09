package com.taxedge.identity.model;

import com.taxedge.shared.DomainType;
import com.taxedge.shared.Role;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tx_users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @Column(name = "user_id", length = 32)
    private String id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DomainType domain;

    @Column(name = "manager_id")
    private String managerId;

    private String avatar;
}
