-- Insert default admin user (password: admin123!)
INSERT INTO users (username, email, password_hash, role, first_name, last_name) VALUES 
('admin', 'admin@360gym.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'System', 'Administrator');


-- Insert default gym hours (Monday-Friday: 5:00 AM - 11:00 PM, Saturday-Sunday: 6:00 AM - 10:00 PM)
INSERT INTO gym_hours (day_of_week, open_time, close_time) VALUES 
('monday', '05:00:00', '23:00:00'),
('tuesday', '05:00:00', '23:00:00'),
('wednesday', '05:00:00', '23:00:00'),
('thursday', '05:00:00', '23:00:00'),
('friday', '05:00:00', '23:00:00'),
('saturday', '06:00:00', '22:00:00'),
('sunday', '06:00:00', '22:00:00');

-- Insert sample announcement
INSERT INTO announcements (title, content, type, priority, start_date, created_by) VALUES 
('Welcome to 360 Gym API', 'The gym management API is now live and ready to use!', 'general', 'medium', CURDATE(), 1);