-- TaxEdge Advanced Modular Monolith Database Schema (V1)

CREATE TABLE IF NOT EXISTS tx_users (
    user_id VARCHAR(32) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL,
    domain VARCHAR(32) NOT NULL,
    manager_id VARCHAR(32),
    avatar VARCHAR(10)
);

CREATE TABLE IF NOT EXISTS tx_conversations (
    conversation_id VARCHAR(32) PRIMARY KEY,
    domain VARCHAR(32) NOT NULL,
    manager_id VARCHAR(32),
    participant_id VARCHAR(32) NOT NULL,
    participant_name VARCHAR(255) NOT NULL,
    participant_role VARCHAR(255) NOT NULL,
    last_message TEXT,
    last_message_time TIMESTAMP,
    unread_count INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tx_messages (
    message_id VARCHAR(32) PRIMARY KEY,
    conversation_id VARCHAR(32) NOT NULL,
    sender_id VARCHAR(32) NOT NULL,
    text TEXT NOT NULL,
    sent_at TIMESTAMP NOT NULL
);
