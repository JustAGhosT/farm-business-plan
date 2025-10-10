-- Phase 2: Core Collaboration - Messaging System Migration
-- This migration adds tables needed for the stakeholder communication hub

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID NOT NULL,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    context_type VARCHAR(50) CHECK (context_type IN ('farm-plan', 'crop-plan', 'task', 'document', 'general')),
    context_id UUID,
    context_section VARCHAR(255),
    parent_message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false,
    edited_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_context ON messages(context_type, context_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_parent ON messages(parent_message_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);

COMMENT ON TABLE messages IS 'Threaded messaging system for stakeholder communication';
COMMENT ON COLUMN messages.thread_id IS 'Group messages into threads';
COMMENT ON COLUMN messages.context_type IS 'Type of entity the message is attached to';
COMMENT ON COLUMN messages.context_id IS 'ID of the entity the message is attached to';
COMMENT ON COLUMN messages.parent_message_id IS 'Parent message ID for threaded replies';

-- ============================================
-- MESSAGE ATTACHMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS message_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size INTEGER,
    file_url TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_message_attachments_message ON message_attachments(message_id);

COMMENT ON TABLE message_attachments IS 'File attachments for messages';

-- ============================================
-- MESSAGE MENTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS message_mentions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(message_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_message_mentions_user ON message_mentions(user_id);
CREATE INDEX IF NOT EXISTS idx_message_mentions_message ON message_mentions(message_id);

COMMENT ON TABLE message_mentions IS 'Track @mentions in messages for notifications';

-- ============================================
-- MESSAGE READ RECEIPTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS message_read_receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(message_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_message_read_receipts_message ON message_read_receipts(message_id);
CREATE INDEX IF NOT EXISTS idx_message_read_receipts_user ON message_read_receipts(user_id);

COMMENT ON TABLE message_read_receipts IS 'Track who has read which messages';

-- ============================================
-- HELPER FUNCTION: Parse and store mentions
-- ============================================
CREATE OR REPLACE FUNCTION process_message_mentions(
    p_message_id UUID,
    p_content TEXT
)
RETURNS INTEGER AS $$
DECLARE
    v_mention TEXT;
    v_user_id UUID;
    v_count INTEGER := 0;
BEGIN
    -- Extract @username patterns from content
    FOR v_mention IN
        SELECT DISTINCT regexp_matches[1]
        FROM regexp_matches(p_content, '@(\w+)', 'g') AS regexp_matches
    LOOP
        -- Find user by name or email
        SELECT id INTO v_user_id
        FROM users
        WHERE name = v_mention OR email = v_mention || '@%'
        LIMIT 1;
        
        IF v_user_id IS NOT NULL THEN
            -- Insert mention record
            INSERT INTO message_mentions (message_id, user_id)
            VALUES (p_message_id, v_user_id)
            ON CONFLICT (message_id, user_id) DO NOTHING;
            
            v_count := v_count + 1;
        END IF;
    END LOOP;
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION process_message_mentions IS 'Extract and store @mentions from message content';

-- ============================================
-- TRIGGER: Update message timestamp
-- ============================================
DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;
CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
