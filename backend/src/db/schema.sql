-- GhostPipes Database Schema for Amazon Aurora PostgreSQL
-- Optimized for pipeline storage with JSON support

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false
);

CREATE INDEX idx_users_email ON users(email);


-- Refresh tokens for JWT rotation
-- CREATE TABLE refresh_tokens (
--     token_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
--     token_hash VARCHAR(255) NOT NULL,
--     expires_at TIMESTAMP NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     revoked BOOLEAN DEFAULT false,
--     device_fingerprint VARCHAR(255)
-- );

-- CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
-- CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);

-- Pipelines table (stores complete pipeline configs as JSONB)
CREATE TABLE pipelines (
    pipeline_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    config JSONB NOT NULL,  -- Complete pipeline configuration
    is_public BOOLEAN DEFAULT false,
    is_template BOOLEAN DEFAULT false,
    category VARCHAR(50),  -- e.g., 'data-processing', 'web-scraping'
    tags TEXT[],
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_run TIMESTAMP,
    run_count INTEGER DEFAULT 0,
    clone_count INTEGER DEFAULT 0
);

CREATE INDEX idx_pipelines_user ON pipelines(user_id);
-- CREATE INDEX idx_pipelines_public ON pipelines(is_public) WHERE is_public = true;
-- CREATE INDEX idx_pipelines_template ON pipelines(is_template) WHERE is_template = true;
-- CREATE INDEX idx_pipelines_category ON pipelines(category);
-- CREATE INDEX idx_pipelines_tags ON pipelines USING GIN(tags);
-- CREATE INDEX idx_pipelines_config ON pipelines USING GIN(config);

-- Webhooks table (tracks webhook endpoints)
CREATE TABLE webhooks (
    webhook_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pipeline_id UUID NOT NULL REFERENCES pipelines(pipeline_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    webhook_url VARCHAR(255) UNIQUE NOT NULL,  -- e.g., /webhooks/:webhook_id
    method VARCHAR(10) NOT NULL DEFAULT 'POST',  -- GET, POST, PUT, DELETE
    secret_hash VARCHAR(255),  -- Optional HMAC secret
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_triggered TIMESTAMP,
    trigger_count INTEGER DEFAULT 0,
    rate_limit INTEGER DEFAULT 100  -- requests per hour
);

CREATE INDEX idx_webhooks_pipeline ON webhooks(pipeline_id);
-- CREATE INDEX idx_webhooks_user ON webhooks(user_id);
-- CREATE INDEX idx_webhooks_url ON webhooks(webhook_url);

-- Webhook logs (track webhook invocations)
-- CREATE TABLE webhook_logs (
--     log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     webhook_id UUID NOT NULL REFERENCES webhooks(webhook_id) ON DELETE CASCADE,
--     request_method VARCHAR(10),
--     request_headers JSONB,
--     request_body JSONB,
--     response_status INTEGER,
--     response_body JSONB,
--     execution_time_ms INTEGER,
--     error_message TEXT,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- CREATE INDEX idx_webhook_logs_webhook ON webhook_logs(webhook_id);
-- CREATE INDEX idx_webhook_logs_created ON webhook_logs(created_at DESC);

-- Pipeline shares (for collaborative sharing)
-- CREATE TABLE pipeline_shares (
--     share_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     pipeline_id UUID NOT NULL REFERENCES pipelines(pipeline_id) ON DELETE CASCADE,
--     shared_by UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
--     share_token VARCHAR(255) UNIQUE NOT NULL,  -- Public share link token
--     access_level VARCHAR(20) DEFAULT 'view',  -- view, clone, edit
--     expires_at TIMESTAMP,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     access_count INTEGER DEFAULT 0,
--     last_accessed TIMESTAMP
-- );

-- CREATE INDEX idx_pipeline_shares_pipeline ON pipeline_shares(pipeline_id);
-- CREATE INDEX idx_pipeline_shares_token ON pipeline_shares(share_token);

-- -- Pipeline clones (track pipeline derivations)
-- CREATE TABLE pipeline_clones (
--     clone_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     original_pipeline_id UUID NOT NULL REFERENCES pipelines(pipeline_id) ON DELETE SET NULL,
--     cloned_pipeline_id UUID NOT NULL REFERENCES pipelines(pipeline_id) ON DELETE CASCADE,
--     cloned_by UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- CREATE INDEX idx_pipeline_clones_original ON pipeline_clones(original_pipeline_id);
-- CREATE INDEX idx_pipeline_clones_cloned ON pipeline_clones(cloned_pipeline_id);

-- -- Web push subscriptions (for browser notifications)
-- CREATE TABLE push_subscriptions (
--     subscription_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
--     endpoint TEXT NOT NULL,
--     p256dh_key TEXT NOT NULL,
--     auth_key TEXT NOT NULL,
--     user_agent TEXT,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     last_used TIMESTAMP
-- );

-- CREATE INDEX idx_push_subscriptions_user ON push_subscriptions(user_id);

-- -- Pipeline execution history (for analytics)
-- CREATE TABLE pipeline_executions (
--     execution_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     pipeline_id UUID NOT NULL REFERENCES pipelines(pipeline_id) ON DELETE CASCADE,
--     user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
--     trigger_type VARCHAR(50),  -- manual, webhook, schedule
--     status VARCHAR(20),  -- running, success, failed
--     started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     completed_at TIMESTAMP,
--     execution_time_ms INTEGER,
--     input_data JSONB,
--     output_data JSONB,
--     error_message TEXT,
--     node_metrics JSONB  -- Performance per node
-- );

-- CREATE INDEX idx_pipeline_executions_pipeline ON pipeline_executions(pipeline_id);
-- CREATE INDEX idx_pipeline_executions_user ON pipeline_executions(user_id);
-- CREATE INDEX idx_pipeline_executions_started ON pipeline_executions(started_at DESC);

-- -- Updated_at trigger function
-- CREATE OR REPLACE FUNCTION update_updated_at_column()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     NEW.updated_at = CURRENT_TIMESTAMP;
--     RETURN NEW;
-- END;
-- $$ language 'plpgsql';

-- -- Apply updated_at triggers
-- CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
--     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- CREATE TRIGGER update_pipelines_updated_at BEFORE UPDATE ON pipelines
--     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -- Views for analytics
-- CREATE VIEW pipeline_stats AS
-- SELECT 
--     p.pipeline_id,
--     p.name,
--     p.user_id,
--     p.run_count,
--     p.clone_count,
--     COUNT(DISTINCT ps.share_id) as share_count,
--     COUNT(DISTINCT pe.execution_id) as execution_count,
--     AVG(pe.execution_time_ms) as avg_execution_time
-- FROM pipelines p
-- LEFT JOIN pipeline_shares ps ON p.pipeline_id = ps.pipeline_id
-- LEFT JOIN pipeline_executions pe ON p.pipeline_id = pe.pipeline_id
-- GROUP BY p.pipeline_id;

-- Grant permissions (adjust role name as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ghostpipes_app;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ghostpipes_app;