<?php

try {
    $pdo = new PDO('pgsql:host=89.117.61.85;port=5432;dbname=biizzdb;sslmode=require', 'karl', '@Charles2004');
    echo "Connection successful!\n";
} catch (PDOException $e) {
    echo 'Connection failed: '.$e->getMessage()."\n";
}
