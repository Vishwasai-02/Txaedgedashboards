package com.taxedge.communication.dto;

import com.taxedge.shared.DomainType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThreadDto {
    private String id;
    private DomainType domain;
    private String managerId;
    private String participantId;
    private String participantName;
    private String role;
    private int unreadCount;
    private String lastMessage;
    private String lastMessageTime;
    private List<MessageDto> messages;
}
