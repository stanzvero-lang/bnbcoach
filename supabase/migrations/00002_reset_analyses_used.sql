-- Reset analyses_used counter for all users (dev period)
-- and increase free tier limit from 3 to 10
UPDATE profiles SET analyses_used = 0;
