package com.taxedge.communication.service;

import com.taxedge.communication.dto.AgentMonitoringDto;
import com.taxedge.communication.dto.MessageDto;
import com.taxedge.communication.dto.ThreadDto;
import com.taxedge.communication.model.Conversation;
import com.taxedge.communication.model.Message;
import com.taxedge.communication.repository.ConversationRepository;
import com.taxedge.communication.repository.MessageRepository;
import com.taxedge.communication.security.CommunicationAuthorizationValidator;
import com.taxedge.identity.model.User;
import com.taxedge.shared.DomainSecurityException;
import com.taxedge.shared.DomainType;
import com.taxedge.shared.Role;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommunicationService {
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final CommunicationAuthorizationValidator validator;

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");

    @PostConstruct
    public void seedInitialThreads() {
        if (conversationRepository.count() == 0) {
            Conversation c1 = Conversation.builder()
                .id("TH-001")
                .domain(DomainType.CA)
                .managerId("MGR001")
                .participantId("MGR001")
                .participantName("Sanjay Verma (CA Manager)")
                .participantRole("Case Manager - Direct Tax & MCA")
                .unreadCount(2)
                .lastMessage("All high priority GST cases for Q2 have been verified.")
                .lastMessageTime(LocalDateTime.now().minusMinutes(40))
                .build();

            Conversation c2 = Conversation.builder()
                .id("TH-002")
                .domain(DomainType.LOAN)
                .managerId("MGR002")
                .participantId("MGR002")
                .participantName("Ananya Deshmukh (Loan Manager)")
                .participantRole("Case Manager - Loans & Advisory")
                .unreadCount(0)
                .lastMessage("Sanction letter received from HDFC for Zenith Tech.")
                .lastMessageTime(LocalDateTime.now().minusHours(2))
                .build();

            Conversation sthCa1 = Conversation.builder()
                .id("STH-CA-01")
                .domain(DomainType.CA)
                .managerId("MGR001")
                .participantId("AGT001")
                .participantName("Suresh Kumar (CA Agent)")
                .participantRole("Direct Tax Executive")
                .unreadCount(1)
                .lastMessage("GST REG-01 submitted for Ravi Kumar. Awaiting ARN acknowledgment.")
                .lastMessageTime(LocalDateTime.now().minusMinutes(50))
                .build();

            Conversation sthCa2 = Conversation.builder()
                .id("STH-CA-02")
                .domain(DomainType.CA)
                .managerId("MGR001")
                .participantId("AGT002")
                .participantName("Priya Sharma (CA Agent)")
                .participantRole("ITR & Compliance Executive")
                .unreadCount(0)
                .lastMessage("Form 16 TDS reconciliation completed for Anil Sharma.")
                .lastMessageTime(LocalDateTime.now().minusHours(3))
                .build();

            Conversation sthLn1 = Conversation.builder()
                .id("STH-LN-01")
                .domain(DomainType.LOAN)
                .managerId("MGR002")
                .participantId("AGT003")
                .participantName("Rajesh Patel (Loan Agent)")
                .participantRole("Business Loan Credit Executive")
                .unreadCount(1)
                .lastMessage("Customer Kumar Sanu uploaded revised unmasked bank statement.")
                .lastMessageTime(LocalDateTime.now().minusMinutes(20))
                .build();

            Conversation sthLn2 = Conversation.builder()
                .id("STH-LN-02")
                .domain(DomainType.LOAN)
                .managerId("MGR002")
                .participantId("AGT004")
                .participantName("Kavita Iyer (Loan Agent)")
                .participantRole("Underwriting & Appraisal Executive")
                .unreadCount(0)
                .lastMessage("MSME credit appraisal note sent to NBFC risk desk for APP004.")
                .lastMessageTime(LocalDateTime.now().minusHours(4))
                .build();

            conversationRepository.saveAll(List.of(c1, c2, sthCa1, sthCa2, sthLn1, sthLn2));

            // Seed initial messages
            Message m1 = Message.builder()
                .id("M1").conversationId("TH-001").senderId("MGR001")
                .text("Hi Admin, regarding the urgent GST filings for Apex Logistics.")
                .sentAt(LocalDateTime.now().minusMinutes(55)).build();
            Message m2 = Message.builder()
                .id("M2").conversationId("TH-001").senderId("ADM001")
                .text("Yes Sanjay, did the customer provide the amended electricity bill?")
                .sentAt(LocalDateTime.now().minusMinutes(48)).build();
            Message m3 = Message.builder()
                .id("M3").conversationId("TH-001").senderId("MGR001")
                .text("All high priority GST cases for Q2 have been verified.")
                .sentAt(LocalDateTime.now().minusMinutes(40)).build();

            Message sm1 = Message.builder()
                .id("SM1").conversationId("STH-CA-01").senderId("MGR001")
                .text("Suresh, please check the electricity bill for APP001.")
                .sentAt(LocalDateTime.now().minusMinutes(75)).build();
            Message sm2 = Message.builder()
                .id("SM2").conversationId("STH-CA-01").senderId("AGT001")
                .text("GST REG-01 submitted for Ravi Kumar. Awaiting ARN acknowledgment.")
                .sentAt(LocalDateTime.now().minusMinutes(50)).build();

            messageRepository.saveAll(List.of(m1, m2, m3, sm1, sm2));
        }
    }

    public List<ThreadDto> getAdminThreads(DomainType domainFilter) {
        List<Conversation> list;
        if (domainFilter == null || domainFilter == DomainType.GLOBAL) {
            list = conversationRepository.findAll().stream()
                .filter(c -> c.getId().startsWith("TH-"))
                .collect(Collectors.toList());
        } else {
            list = conversationRepository.findByDomain(domainFilter).stream()
                .filter(c -> c.getId().startsWith("TH-"))
                .collect(Collectors.toList());
        }
        return list.stream().map(this::toThreadDto).collect(Collectors.toList());
    }

    public List<ThreadDto> getStaffThreads(User user) {
        if (user == null) return Collections.emptyList();

        List<Conversation> list;
        if (user.getRole() == Role.CA_MANAGER || user.getRole() == Role.LOAN_MANAGER) {
            list = conversationRepository.findByDomainAndManagerId(user.getDomain(), user.getId());
        } else {
            list = conversationRepository.findByParticipantId(user.getId());
        }

        return list.stream().map(conv -> {
            ThreadDto dto = toThreadDto(conv);
            // From Agent perspective, participant is their Manager
            if (user.getRole() == Role.CA_AGENT) {
                dto.setParticipantName("Sanjay Verma (CA Manager)");
                dto.setRole("Case Manager - Direct Tax & MCA");
            } else if (user.getRole() == Role.LOAN_AGENT) {
                dto.setParticipantName("Ananya Deshmukh (Loan Manager)");
                dto.setRole("Case Manager - Loans & Advisory");
            }
            return dto;
        }).collect(Collectors.toList());
    }

    public List<AgentMonitoringDto> getAgentMonitoring(DomainType domainFilter) {
        List<AgentMonitoringDto> list = List.of(
            AgentMonitoringDto.builder().id("AGT001").name("Suresh Kumar").domain(DomainType.CA)
                .manager("Sanjay Verma").status("ACTIVE").currentApplication("APP001 - GST Registration")
                .currentTask("GST REG-01 Portal Entry").lastActivity("3 mins ago").online(true).build(),
            AgentMonitoringDto.builder().id("AGT002").name("Priya Sharma").domain(DomainType.CA)
                .manager("Sanjay Verma").status("IN_REVIEW").currentApplication("APP002 - ITR-1 Salaried")
                .currentTask("Form 16 TDS Reconciliation").lastActivity("12 mins ago").online(true).build(),
            AgentMonitoringDto.builder().id("AGT003").name("Rajesh Patel").domain(DomainType.LOAN)
                .manager("Ananya Deshmukh").status("ACTIVE").currentApplication("APP003 - Business Loan")
                .currentTask("Financial Cash Flow Appraisal").lastActivity("8 mins ago").online(true).build(),
            AgentMonitoringDto.builder().id("AGT004").name("Kavita Iyer").domain(DomainType.LOAN)
                .manager("Ananya Deshmukh").status("IDLE").currentApplication("APP004 - MSME Working Capital")
                .currentTask("Credit Sanction Letter Audit").lastActivity("25 mins ago").online(false).build()
        );

        if (domainFilter == null || domainFilter == DomainType.GLOBAL) {
            return list;
        }
        return list.stream().filter(a -> a.getDomain() == domainFilter).collect(Collectors.toList());
    }

    @Transactional
    public MessageDto sendMessage(String conversationId, String text, User sender) {
        Conversation conv = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new RuntimeException("Conversation not found"));

        validator.validateAccess(sender, conv);

        Message msg = Message.builder()
            .id("M_" + System.currentTimeMillis())
            .conversationId(conversationId)
            .senderId(sender != null ? sender.getId() : "SYS")
            .text(text)
            .sentAt(LocalDateTime.now())
            .build();

        messageRepository.save(msg);

        conv.setLastMessage(text);
        conv.setLastMessageTime(LocalDateTime.now());
        conversationRepository.save(conv);

        return MessageDto.builder()
            .id(msg.getId())
            .sender(msg.getSenderId())
            .text(msg.getText())
            .time(msg.getSentAt().format(TIME_FMT))
            .build();
    }

    private ThreadDto toThreadDto(Conversation conv) {
        List<Message> msgs = messageRepository.findByConversationIdOrderBySentAtAsc(conv.getId());
        List<MessageDto> messageDtos = msgs.stream().map(m -> MessageDto.builder()
            .id(m.getId())
            .sender(m.getSenderId())
            .text(m.getText())
            .time(m.getSentAt().format(TIME_FMT))
            .build()).collect(Collectors.toList());

        return ThreadDto.builder()
            .id(conv.getId())
            .domain(conv.getDomain())
            .managerId(conv.getManagerId())
            .participantId(conv.getParticipantId())
            .participantName(conv.getParticipantName())
            .role(conv.getParticipantRole())
            .unreadCount(conv.getUnreadCount())
            .lastMessage(conv.getLastMessage())
            .lastMessageTime(conv.getLastMessageTime() != null ? conv.getLastMessageTime().format(TIME_FMT) : "")
            .messages(messageDtos)
            .build();
    }
}
