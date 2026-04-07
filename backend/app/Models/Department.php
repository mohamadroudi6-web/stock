<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Department extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
    ];

    // ── Relations ──────────────────────────────────────────────────────────
    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    // ── Computed stats ────────────────────────────────────────────────────
    public function totalItemsOut(): int
    {
        return (int) $this->stockMovements()
            ->where('type', 'out')
            ->sum('quantity');
    }
}
