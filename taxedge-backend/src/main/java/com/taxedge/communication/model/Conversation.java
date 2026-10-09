package com.taxedge.communication.model;

import com.taxedge.shared.DomainType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tx_conversations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Conversation {
    @Id
    @Column(name = "conversation_id", length = 32)
    private String id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DomainType domain;

    @Column(name = "manager_id")
    private String managerId;

    @Column(name = "participant_id", nullable = false)
    private String participantId;

    @Column(name = "participant_name", nullable = false)
    private String participantName;

    @Column(name = "participant_role", nullable = false)
    private String participantRole;

    @Column(name = "last_message")
    private String lastMessage;

    @Column(name = "last_message_time")
    private LocalDateTime lastMessageTime;

    @Column(name = "unread_count")
    private int unreadCount;
}
