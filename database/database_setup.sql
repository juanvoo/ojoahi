-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Volunteers table
CREATE TABLE volunteers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    bio TEXT,
    skills TEXT,
    availability TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Reservations table
CREATE TABLE reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    volunteer_id INT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    description TEXT,
    is_video_call BOOLEAN DEFAULT FALSE,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE
);

-- Reviews table
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    volunteer_id INT NOT NULL,
    reservation_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE
);

-- Messages table
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_reservations_user ON reservations(user_id);
CREATE INDEX idx_reservations_volunteer ON reservations(volunteer_id);
CREATE INDEX idx_reviews_volunteer ON reviews(volunteer_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);

-- Create a view for volunteer ratings
CREATE VIEW volunteer_ratings AS
SELECT 
    v.id AS volunteer_id,
    u.username AS volunteer_name,
    AVG(r.rating) AS average_rating,
    COUNT(r.id) AS total_reviews
FROM 
    volunteers v
    JOIN users u ON v.user_id = u.id
    LEFT JOIN reviews r ON v.id = r.volunteer_id
GROUP BY 
    v.id, u.username;

-- Create a stored procedure to get upcoming reservations for a user
DELIMITER //
CREATE PROCEDURE get_upcoming_reservations(IN user_id INT)
BEGIN
    SELECT 
        r.id, 
        r.date, 
        r.time, 
        r.description, 
        r.is_video_call,
        u.username AS volunteer_name
    FROM 
        reservations r
        JOIN volunteers v ON r.volunteer_id = v.id
        JOIN users u ON v.user_id = u.id
    WHERE 
        r.user_id = user_id
        AND r.status = 'confirmed'
        AND r.date >= CURDATE()
    ORDER BY 
        r.date, r.time;
END //
DELIMITER ;

-- Create a trigger to update reservation status when a review is added
DELIMITER //
CREATE TRIGGER after_review_insert
AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
    UPDATE reservations
    SET status = 'completed'
    WHERE id = NEW.reservation_id;
END //
DELIMITER ;