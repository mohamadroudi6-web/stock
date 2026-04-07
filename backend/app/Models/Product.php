<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'sku',
        'name',
        'description',
        'category_id',
        'unit',
        'price',
        'min_qty',
        'is_active',
    ];

    protected $appends = ['current_stock'];

    protected function casts(): array
    {
        return [
            'price'     => 'float',
            'min_qty'   => 'integer',
            'is_active' => 'boolean',
        ];
    }

    // ── Relations ─────────────────────────────────────────────────────────
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    // ── Calcul du stock courant ────────────────────────────────────────────
    public function getCurrentStockAttribute(): int
    {
        $in  = $this->stockMovements()->where('type', 'in')->sum('quantity');
        $out = $this->stockMovements()->where('type', 'out')->sum('quantity');
        return (int) ($in - $out);
    }

    public function isLowStock(): bool
    {
        return $this->current_stock <= $this->min_qty;
    }
}
