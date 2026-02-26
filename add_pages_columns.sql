-- Run this in your Supabase SQL Editor
-- This adds the necessary columns for the About Us and Contact Us pages

ALTER TABLE "public"."stores"
ADD COLUMN IF NOT EXISTS "about_page_text" text,
ADD COLUMN IF NOT EXISTS "contact_page_text" text;

-- Notify Supabase PostgREST schema cache to reload
NOTIFY pgrst, 'reload schema';
