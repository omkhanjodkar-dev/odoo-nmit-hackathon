-- SQL Migration for Salary Structures & Payslips
-- Compliant with Odoo Excalidraw Reference & Dayflow PRD

-- 1. Salary Structures Table
CREATE TABLE IF NOT EXISTS public.salary_structures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Wages
    monthly_wage NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    yearly_wage NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    
    -- Component Configuration Rates
    basic_pct NUMERIC(5, 2) DEFAULT 50.00,             -- % of monthly wage (Default 50%)
    hra_pct NUMERIC(5, 2) DEFAULT 50.00,               -- % of basic salary (Default 50%)
    standard_allowance NUMERIC(12, 2) DEFAULT 4167.00, -- Fixed amount (Default 4167)
    bonus_pct NUMERIC(5, 2) DEFAULT 8.33,              -- % of basic salary (Default 8.33%)
    lta_pct NUMERIC(5, 2) DEFAULT 8.33,                -- % of basic salary (Default 8.33%)
    pf_pct NUMERIC(5, 2) DEFAULT 12.00,                -- % of basic salary (Default 12.00%)
    professional_tax NUMERIC(12, 2) DEFAULT 200.00,    -- Fixed amount deducted from gross
    
    -- Computed / Stored Amounts
    basic_salary NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    hra NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    performance_bonus NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    lta NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    fixed_allowance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    provident_fund NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    gross_salary NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_deductions NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    net_salary NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    
    currency VARCHAR(10) DEFAULT 'INR',
    effective_from DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Monthly Payslips Table
CREATE TABLE IF NOT EXISTS public.payslips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INT NOT NULL CHECK (year >= 2020),
    
    monthly_wage NUMERIC(12, 2) NOT NULL,
    basic_salary NUMERIC(12, 2) NOT NULL,
    hra NUMERIC(12, 2) NOT NULL,
    standard_allowance NUMERIC(12, 2) NOT NULL,
    performance_bonus NUMERIC(12, 2) NOT NULL,
    lta NUMERIC(12, 2) NOT NULL,
    fixed_allowance NUMERIC(12, 2) NOT NULL,
    gross_salary NUMERIC(12, 2) NOT NULL,
    
    unpaid_leave_days INT DEFAULT 0,
    unpaid_leave_deduction NUMERIC(12, 2) DEFAULT 0.00,
    provident_fund NUMERIC(12, 2) NOT NULL,
    professional_tax NUMERIC(12, 2) NOT NULL,
    total_deductions NUMERIC(12, 2) NOT NULL,
    net_pay NUMERIC(12, 2) NOT NULL,
    
    status VARCHAR(20) DEFAULT 'GENERATED', -- 'DRAFT', 'GENERATED', 'PAID'
    generated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, month, year)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_salary_structures_user_id ON public.salary_structures(user_id);
CREATE INDEX IF NOT EXISTS idx_payslips_user_month_year ON public.payslips(user_id, month, year);

-- Enable RLS
ALTER TABLE public.salary_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Employees can view own salary structure"
ON public.salary_structures FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view and manage all salary structures"
ON public.salary_structures FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE user_id = auth.uid() AND role = 'ADMIN_HR'
    )
);

CREATE POLICY "Employees can view own payslips"
ON public.payslips FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view and manage all payslips"
ON public.payslips FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE user_id = auth.uid() AND role = 'ADMIN_HR'
    )
);
