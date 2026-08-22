-- Minimal SQL Migration for fcm_tokens table
CREATE TABLE IF NOT EXISTS public.fcm_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    fcm_token TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fetching all tokens by user_id
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_user_id ON public.fcm_tokens(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.fcm_tokens ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own tokens
CREATE POLICY "Users can view their own fcm tokens"
ON public.fcm_tokens FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own fcm tokens"
ON public.fcm_tokens FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fcm tokens"
ON public.fcm_tokens FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fcm tokens"
ON public.fcm_tokens FOR DELETE
USING (auth.uid() = user_id);
