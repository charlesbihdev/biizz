<?php

namespace App\Enums;

enum OrderSource: string
{
    case Storefront = 'storefront';
    case Whatsapp = 'whatsapp';
    case Instagram = 'instagram';

    public function label(): string
    {
        return match ($this) {
            self::Storefront => 'Storefront',
            self::Whatsapp => 'WhatsApp',
            self::Instagram => 'Instagram',
        };
    }
}
