-- =============================================
-- PAYMENT METHODS TABLE
-- =============================================
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    authorization_code VARCHAR(255),
    card_type VARCHAR(20),
    last_four VARCHAR(4),
    bin VARCHAR(6),
    exp_month VARCHAR(2),
    exp_year VARCHAR(4),
    bank_name VARCHAR(100),
    account_number VARCHAR(50),
    account_name VARCHAR(255),
    mobile_money_provider VARCHAR(50),
    phone_number VARCHAR(20),
    is_default BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    external_id VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ
);

CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX idx_payment_methods_type ON payment_methods(type);
CREATE INDEX idx_payment_methods_is_default ON payment_methods(is_default);

-- =============================================
-- TRANSACTIONS TABLE
-- =============================================
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    amount DECIMAL(20, 2) NOT NULL,
    fee DECIMAL(20, 2) DEFAULT 0.00,
    net_amount DECIMAL(20, 2) NOT NULL,
    balance_before DECIMAL(20, 2) NOT NULL,
    balance_after DECIMAL(20, 2) NOT NULL,
    balance_type VARCHAR(20) DEFAULT 'available',
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'pending',
    reference_id UUID,
    reference_type VARCHAR(50),
    payment_provider VARCHAR(50),
    provider_transaction_id VARCHAR(255),
    provider_reference VARCHAR(255),
    provider_response JSONB,
    description TEXT,
    notes TEXT,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    reversed_at TIMESTAMPTZ,
    reversal_reason TEXT,
    original_transaction_id UUID REFERENCES transactions(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_reference ON transactions(reference_id, reference_type);
CREATE INDEX idx_transactions_provider_ref ON transactions(provider_reference);

-- =============================================
-- DEPOSITS TABLE
-- =============================================
CREATE TABLE deposits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
    amount DECIMAL(20, 2) NOT NULL CHECK (amount > 0),
    fee DECIMAL(20, 2) DEFAULT 0.00,
    net_amount DECIMAL(20, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    exchange_rate DECIMAL(10, 6),
    original_currency VARCHAR(3),
    original_amount DECIMAL(20, 2),
    status VARCHAR(20) DEFAULT 'pending',
    payment_method VARCHAR(50) NOT NULL,
    payment_provider VARCHAR(50) DEFAULT 'paystack',
    provider_reference VARCHAR(255) UNIQUE,
    authorization_url TEXT,
    access_code VARCHAR(255),
    provider_response JSONB,
    failure_reason TEXT,
    failure_code VARCHAR(50),
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
);

CREATE INDEX idx_deposits_user_id ON deposits(user_id);
CREATE INDEX idx_deposits_status ON deposits(status);
CREATE INDEX idx_deposits_provider_ref ON deposits(provider_reference);
CREATE INDEX idx_deposits_created_at ON deposits(created_at DESC);

-- =============================================
-- WITHDRAWALS TABLE
-- =============================================
CREATE TABLE withdrawals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
    amount DECIMAL(20, 2) NOT NULL CHECK (amount > 0),
    fee DECIMAL(20, 2) DEFAULT 0.00,
    net_amount DECIMAL(20, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'pending',
    withdrawal_method VARCHAR(50) NOT NULL,
    bank_name VARCHAR(100),
    account_number VARCHAR(50),
    account_name VARCHAR(255),
    bank_code VARCHAR(20),
    mobile_money_provider VARCHAR(50),
    phone_number VARCHAR(20),
    payment_provider VARCHAR(50) DEFAULT 'paystack',
    provider_reference VARCHAR(255) UNIQUE,
    transfer_code VARCHAR(255),
    recipient_code VARCHAR(255),
    provider_response JSONB,
    requires_approval BOOLEAN DEFAULT FALSE,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    failure_reason TEXT,
    failure_code VARCHAR(50),
    kyc_verified BOOLEAN DEFAULT FALSE,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    processed_at TIMESTAMPTZ
);

CREATE INDEX idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);
CREATE INDEX idx_withdrawals_provider_ref ON withdrawals(provider_reference);
CREATE INDEX idx_withdrawals_created_at ON withdrawals(created_at DESC);
CREATE INDEX idx_withdrawals_approval ON withdrawals(status, requires_approval);

-- =============================================
-- BONUS WALLETS TABLE
-- =============================================
CREATE TABLE bonus_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    bonus_type VARCHAR(50) NOT NULL,
    amount DECIMAL(20, 2) NOT NULL CHECK (amount > 0),
    wagering_requirement DECIMAL(20, 2) DEFAULT 0.00,
    wagering_completed DECIMAL(20, 2) DEFAULT 0.00,
    wagering_progress DECIMAL(5, 2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'active',
    expires_at TIMESTAMPTZ,
    converted_to_cash DECIMAL(20, 2) DEFAULT 0.00,
    converted_at TIMESTAMPTZ,
    reference_id UUID,
    reference_type VARCHAR(50),
    conditions JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bonus_wallets_user_id ON bonus_wallets(user_id);
CREATE INDEX idx_bonus_wallets_status ON bonus_wallets(status);
CREATE INDEX idx_bonus_wallets_type ON bonus_wallets(bonus_type);
CREATE INDEX idx_bonus_wallets_expires ON bonus_wallets(expires_at);

-- =============================================
-- WITHDRAWAL LIMITS TRACKING TABLE
-- =============================================
CREATE TABLE withdrawal_limits_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tier VARCHAR(20) NOT NULL,
    daily_withdrawn DECIMAL(20, 2) DEFAULT 0.00,
    daily_limit DECIMAL(20, 2) NOT NULL,
    daily_reset_at TIMESTAMPTZ NOT NULL,
    monthly_withdrawn DECIMAL(20, 2) DEFAULT 0.00,
    monthly_limit DECIMAL(20, 2) NOT NULL,
    monthly_reset_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_withdrawal_limits_user ON withdrawal_limits_tracking(user_id);

-- =============================================
-- WALLETS VERSION TRIGGER
-- =============================================
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 0;

CREATE OR REPLACE FUNCTION increment_wallet_version()
RETURNS TRIGGER AS $$
BEGIN
    NEW.version = OLD.version + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_wallet_version
    BEFORE UPDATE ON wallets
    FOR EACH ROW
    EXECUTE FUNCTION increment_wallet_version();

-- =============================================
-- UPDATED_AT TRIGGERS
-- =============================================
CREATE TRIGGER update_payment_methods_updated_at 
    BEFORE UPDATE ON payment_methods
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON transactions
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deposits_updated_at 
    BEFORE UPDATE ON deposits
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_withdrawals_updated_at 
    BEFORE UPDATE ON withdrawals
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bonus_wallets_updated_at 
    BEFORE UPDATE ON bonus_wallets
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_withdrawal_limits_updated_at 
    BEFORE UPDATE ON withdrawal_limits_tracking
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- WITHDRAWAL LIMITS FUNCTIONS
-- =============================================
CREATE OR REPLACE FUNCTION create_withdrawal_limits_for_user()
RETURNS TRIGGER AS $$
DECLARE
    user_tier VARCHAR(20);
    daily_limit DECIMAL(20, 2);
    monthly_limit DECIMAL(20, 2);
BEGIN
    SELECT tier INTO user_tier FROM users WHERE id = NEW.user_id;

    CASE user_tier
        WHEN 'bronze' THEN
            daily_limit := 1000;
            monthly_limit := 5000;
        WHEN 'silver' THEN
            daily_limit := 2500;
            monthly_limit := 15000;
        WHEN 'gold' THEN
            daily_limit := 5000;
            monthly_limit := 50000;
        WHEN 'platinum' THEN
            daily_limit := 10000;
            monthly_limit := 100000;
        WHEN 'diamond' THEN
            daily_limit := 25000;
            monthly_limit := 250000;
        ELSE
            daily_limit := 1000;
            monthly_limit := 5000;
    END CASE;

    INSERT INTO withdrawal_limits_tracking (
        user_id,
        tier,
        daily_limit,
        monthly_limit,
        daily_reset_at,
        monthly_reset_at
    ) VALUES (
        NEW.user_id,
        user_tier,
        daily_limit,
        monthly_limit,
        NOW() + INTERVAL '1 day',
        NOW() + INTERVAL '1 month'
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_withdrawal_limits
    AFTER INSERT ON wallets
    FOR EACH ROW
    EXECUTE FUNCTION create_withdrawal_limits_for_user();

CREATE OR REPLACE FUNCTION update_withdrawal_limits_on_tier_change()
RETURNS TRIGGER AS $$
DECLARE
    daily_limit DECIMAL(20, 2);
    monthly_limit DECIMAL(20, 2);
BEGIN
    IF NEW.tier != OLD.tier THEN
        CASE NEW.tier
            WHEN 'bronze' THEN
                daily_limit := 1000;
                monthly_limit := 5000;
            WHEN 'silver' THEN
                daily_limit := 2500;
                monthly_limit := 15000;
            WHEN 'gold' THEN
                daily_limit := 5000;
                monthly_limit := 50000;
            WHEN 'platinum' THEN
                daily_limit := 10000;
                monthly_limit := 100000;
            WHEN 'diamond' THEN
                daily_limit := 25000;
                monthly_limit := 250000;
        END CASE;

        UPDATE withdrawal_limits_tracking
        SET 
            tier = NEW.tier,
            daily_limit = daily_limit,
            monthly_limit = monthly_limit
        WHERE user_id = NEW.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_withdrawal_limits_on_tier_change
    AFTER UPDATE ON users
    FOR EACH ROW
    WHEN (OLD.tier IS DISTINCT FROM NEW.tier)
    EXECUTE FUNCTION update_withdrawal_limits_on_tier_change();
