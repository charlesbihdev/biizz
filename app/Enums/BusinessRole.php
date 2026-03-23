<?php

namespace App\Enums;

enum BusinessRole: string
{
    case Owner = 'owner';
    // Manager and Staff are reserved for future phases
    // Do not add them until the permission system is built

    public function label(): string
    {
        return match($this) {
            self::Owner => 'Owner',
        };
    }
}
