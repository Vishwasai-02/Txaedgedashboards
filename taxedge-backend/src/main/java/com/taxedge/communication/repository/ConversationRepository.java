package com.taxedge.communication.repository;

import com.taxedge.communication.model.Conversation;
import com.taxedge.shared.DomainType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, String> {
    List<Conversation> findByDomain(DomainType domain);
    List<Conversation> findByDomainAndManagerId(DomainType domain, String managerId);
    List<Conversation> findByParticipantId(String participantId);
}
