<?php
/**
 * Database Migration Manager
 * Handles running and tracking database migrations
 */

class Migration {
    private $db;
    private $migrationsPath;

    public function __construct() {
        $this->db = Database::getInstance();
        $this->migrationsPath = __DIR__ . '/../migrations/';
        $this->createMigrationsTable();
    }

    /**
     * Create migrations tracking table
     */
    private function createMigrationsTable() {
        $sql = "CREATE TABLE IF NOT EXISTS migrations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            filename VARCHAR(255) NOT NULL UNIQUE,
            executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )";
        
        $this->db->execute($sql);
    }

    /**
     * Run all pending migrations
     */
    public function runMigrations() {
        $migrationFiles = $this->getMigrationFiles();
        $executedMigrations = $this->getExecutedMigrations();
        
        $pendingMigrations = array_diff($migrationFiles, $executedMigrations);
        
        if (empty($pendingMigrations)) {
            return ['status' => 'success', 'message' => 'No pending migrations'];
        }

        $results = [];
        
        foreach ($pendingMigrations as $migration) {
            try {
                $this->db->beginTransaction();
                
                $this->runMigration($migration);
                $this->markMigrationAsExecuted($migration);
                
                $this->db->commit();
                $results[] = "Executed: $migration";
                
            } catch (Exception $e) {
                $this->db->rollback();
                throw new Exception("Migration failed: $migration - " . $e->getMessage());
            }
        }
        
        return [
            'status' => 'success',
            'message' => 'Migrations completed successfully',
            'executed' => $results
        ];
    }

    /**
     * Get all migration files
     */
    private function getMigrationFiles() {
        $files = glob($this->migrationsPath . '*.sql');
        $migrationFiles = [];
        
        foreach ($files as $file) {
            $migrationFiles[] = basename($file);
        }
        
        sort($migrationFiles);
        return $migrationFiles;
    }

    /**
     * Get executed migrations from database
     */
    private function getExecutedMigrations() {
        $stmt = $this->db->execute("SELECT filename FROM migrations ORDER BY filename");
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    /**
     * Execute a single migration file
     */
    private function runMigration($filename) {
        $filePath = $this->migrationsPath . $filename;
        
        if (!file_exists($filePath)) {
            throw new Exception("Migration file not found: $filename");
        }
        
        $sql = file_get_contents($filePath);
        
        // Split multiple statements
        $statements = array_filter(array_map('trim', explode(';', $sql)));
        
        foreach ($statements as $statement) {
            if (!empty($statement)) {
                $this->db->execute($statement);
            }
        }
    }

    /**
     * Mark migration as executed
     */
    private function markMigrationAsExecuted($filename) {
        $this->db->execute(
            "INSERT INTO migrations (filename) VALUES (?)",
            [$filename]
        );
    }

    /**
     * Check if migrations need to be run
     */
    public function hasPendingMigrations() {
        $migrationFiles = $this->getMigrationFiles();
        $executedMigrations = $this->getExecutedMigrations();
        
        return count(array_diff($migrationFiles, $executedMigrations)) > 0;
    }

    /**
     * Get migration status
     */
    public function getStatus() {
        $migrationFiles = $this->getMigrationFiles();
        $executedMigrations = $this->getExecutedMigrations();
        $pendingMigrations = array_diff($migrationFiles, $executedMigrations);
        
        return [
            'total_migrations' => count($migrationFiles),
            'executed_migrations' => count($executedMigrations),
            'pending_migrations' => count($pendingMigrations),
            'pending_files' => array_values($pendingMigrations)
        ];
    }
}