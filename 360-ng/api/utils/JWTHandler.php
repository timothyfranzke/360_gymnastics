<?php
/**
 * JWT Token Handler
 * Secure JWT token generation and validation with blacklist support
 */

class JWTHandler {
    private $secret;
    private $algorithm;
    private $db;

    public function __construct($database) {
        $this->secret = JWT_SECRET;
        $this->algorithm = JWT_ALGORITHM;
        $this->db = $database;
    }

    /**
     * Generate JWT token
     */
    public function generateToken($userId, $username, $role, $expiresIn = null) {
        $expiresIn = $expiresIn ?: JWT_EXPIRE;
        $issuedAt = time();
        $expiration = $issuedAt + $expiresIn;
        $jti = $this->generateJTI();

        $payload = [
            'iss' => '360gym-api',
            'aud' => '360gym-client',
            'iat' => $issuedAt,
            'exp' => $expiration,
            'jti' => $jti,
            'data' => [
                'user_id' => $userId,
                'username' => $username,
                'role' => $role
            ]
        ];

        return [
            'token' => $this->encode($payload),
            'expires_at' => $expiration,
            'jti' => $jti
        ];
    }

    /**
     * Validate JWT token
     */
    public function validateToken($token) {
        try {
            $payload = $this->decode($token);
            
            // Check if token is blacklisted
            if ($this->isTokenBlacklisted($payload['jti'])) {
                throw new Exception('Token has been revoked');
            }

            // Check expiration
            if ($payload['exp'] < time()) {
                throw new Exception('Token has expired');
            }

            return $payload;
            
        } catch (Exception $e) {
            throw new Exception('Invalid token: ' . $e->getMessage());
        }
    }

    /**
     * Blacklist a token (for logout)
     */
    public function blacklistToken($token) {
        try {
            $payload = $this->decode($token);
            
            $this->db->execute(
                "INSERT INTO jwt_blacklist (token_jti, user_id, expires_at) VALUES (?, ?, ?)",
                [
                    $payload['jti'],
                    $payload['data']['user_id'],
                    date('Y-m-d H:i:s', $payload['exp'])
                ]
            );
            
            return true;
            
        } catch (Exception $e) {
            throw new Exception('Failed to blacklist token: ' . $e->getMessage());
        }
    }

    /**
     * Check if token is blacklisted
     */
    private function isTokenBlacklisted($jti) {
        $stmt = $this->db->execute(
            "SELECT id FROM jwt_blacklist WHERE token_jti = ? AND expires_at > NOW()",
            [$jti]
        );
        
        return $stmt->rowCount() > 0;
    }

    /**
     * Clean expired blacklisted tokens
     */
    public function cleanExpiredTokens() {
        $this->db->execute("DELETE FROM jwt_blacklist WHERE expires_at < NOW()");
    }

    /**
     * Generate unique token identifier
     */
    private function generateJTI() {
        return bin2hex(random_bytes(16));
    }

    /**
     * Encode JWT payload
     */
    private function encode($payload) {
        $header = json_encode(['typ' => 'JWT', 'alg' => $this->algorithm]);
        $payload = json_encode($payload);
        
        $headerEncoded = $this->base64UrlEncode($header);
        $payloadEncoded = $this->base64UrlEncode($payload);
        
        $signature = hash_hmac('sha256', $headerEncoded . '.' . $payloadEncoded, $this->secret, true);
        $signatureEncoded = $this->base64UrlEncode($signature);
        
        return $headerEncoded . '.' . $payloadEncoded . '.' . $signatureEncoded;
    }

    /**
     * Decode JWT token
     */
    private function decode($token) {
        $parts = explode('.', $token);
        
        if (count($parts) !== 3) {
            throw new Exception('Invalid token format');
        }

        list($headerEncoded, $payloadEncoded, $signatureEncoded) = $parts;
        
        $header = json_decode($this->base64UrlDecode($headerEncoded), true);
        $payload = json_decode($this->base64UrlDecode($payloadEncoded), true);
        
        if (!$header || !$payload) {
            throw new Exception('Invalid token data');
        }

        // Verify signature
        $signature = $this->base64UrlDecode($signatureEncoded);
        $expectedSignature = hash_hmac('sha256', $headerEncoded . '.' . $payloadEncoded, $this->secret, true);
        
        if (!hash_equals($signature, $expectedSignature)) {
            throw new Exception('Invalid token signature');
        }

        return $payload;
    }

    /**
     * Base64 URL encode
     */
    private function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    /**
     * Base64 URL decode
     */
    private function base64UrlDecode($data) {
        return base64_decode(str_pad(strtr($data, '-_', '+/'), strlen($data) % 4, '=', STR_PAD_RIGHT));
    }
}