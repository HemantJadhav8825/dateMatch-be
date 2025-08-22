CREATE TABLE IF NOT EXISTS transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  type VARCHAR(20) NOT NULL,               -- subscription | reveal | boost | gift
  amount INTEGER NOT NULL,                 -- paise
  currency VARCHAR(10) DEFAULT 'INR',
  status VARCHAR(20) NOT NULL,             -- created | paid | failed | refunded
  gateway_ref VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);
