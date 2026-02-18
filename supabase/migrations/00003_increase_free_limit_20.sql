-- Increase free tier limit from 10 to 20 and reset counter for all users
UPDATE profiles SET analyses_used = 0;
