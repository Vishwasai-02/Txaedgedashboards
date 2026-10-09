package com.taxedge.identity.repository;

import com.taxedge.identity.model.User;
import com.taxedge.shared.DomainType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
    List<User> findByDomain(DomainType domain);
    List<User> findByManagerId(String managerId);
}
