<?php

namespace App\Models\Scopes;

use App\Services\BusinessContext;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

/**
 * Automatically appends WHERE business_id = ? to every query on scoped models.
 *
 * The isSet() guard ensures this scope is a no-op in seeders and artisan commands
 * where no BusinessContext has been established — preventing RuntimeException
 * while still enforcing isolation on every live HTTP request.
 */
class BusinessScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        if (BusinessContext::isSet()) {
            $builder->where(
                $model->qualifyColumn('business_id'),
                BusinessContext::current()->id
            );
        }
    }
}
