-- Create users table
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    provider VARCHAR(32) NOT NULL,
    provider_user_id VARCHAR(128) NOT NULL,
    email VARCHAR(255),
    display_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(provider, provider_user_id)
);

-- Create categories table
CREATE TABLE categories (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, name)
);

-- Create transactions table
CREATE TABLE transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    category_id TEXT NOT NULL,
    title VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    transaction_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Create monthly_budgets table
CREATE TABLE monthly_budgets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    "year" SMALLINT NOT NULL,
    "month" SMALLINT NOT NULL CHECK ("month" BETWEEN 1 AND 12),
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, "year", "month")
);

-- Create Spring Session tables for session management
CREATE TABLE spring_session (
    primary_id CHAR(36) NOT NULL,
    session_id CHAR(36) NOT NULL,
    creation_time BIGINT NOT NULL,
    last_access_time BIGINT NOT NULL,
    max_inactive_interval INT NOT NULL,
    expiry_time BIGINT NOT NULL,
    principal_name VARCHAR(100),
    PRIMARY KEY (primary_id),
    UNIQUE(session_id)
);

CREATE TABLE spring_session_attributes (
    session_primary_id CHAR(36) NOT NULL,
    attribute_name VARCHAR(200) NOT NULL,
    attribute_bytes BLOB NOT NULL,
    PRIMARY KEY (session_primary_id, attribute_name),
    FOREIGN KEY (session_primary_id) REFERENCES spring_session(primary_id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX idx_transactions_user_category ON transactions(user_id, category_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_categories_user ON categories(user_id);
CREATE INDEX idx_budgets_user ON monthly_budgets(user_id);

-- Full-text search support (for SQLite, we can use FTS5 or simple LIKE searches)
-- Creating a simple index for title and notes search
CREATE INDEX idx_transactions_search ON transactions(user_id, title);
