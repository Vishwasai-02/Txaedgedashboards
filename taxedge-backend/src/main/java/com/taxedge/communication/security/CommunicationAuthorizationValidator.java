package com.taxedge.communication.security;

import com.taxedge.communication.model.Conversation;
import com.taxedge.identity.model.User;
import com.taxedge.shared.DomainSecurityException;
import com.taxedge.shared.DomainType;
import com.taxedge.shared.Role;
import org.springframework.stereotype.Component;

@Component
public class CommunicationAuthorizationValidator {

    public void validateAccess(User user, Conversation conversation) {
        if (user == null) {
            throw new DomainSecurityException("ACCESS DENIED: Authentication required.");
        }

        // Super Admin access
        if (user.getRole() == Role.SUPER_ADMIN) {
            return;
        }

        // Domain isolation check
        if (user.getDomain() != conversation.getDomain()) {
            throw new DomainSecurityException(
                String.format("ACCESS DENIED: User domain '%s' cannot access '%s' domain communications.",
                    user.getDomain(), conversation.getDomain())
            );
        }

        // Role & team isolation check
        if (user.getRole() == Role.CA_MANAGER || user.getRole() == Role.LOAN_MANAGER) {
            if (!user.getId().equals(conversation.getManagerId())) {
                throw new DomainSecurityException("ACCESS DENIED: Manager is only authorized to communicate with their direct team members.");
            }
        } else if (user.getRole() == Role.CA_AGENT || user.getRole() == Role.LOAN_AGENT) {
            if (!user.getId().equals(conversation.getParticipantId())) {
                throw new DomainSecurityException("ACCESS DENIED: Agent cannot view communications between other team members.");
            }
        }
    }
}
