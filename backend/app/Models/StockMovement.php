<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockMovement extends Model
{
    use HasFactory;

    // Pas de softDeletes : les mouvements sont immuables (traçabilité)
    protected $fillable = [
        'product_id',
        'user_id',
        'supplier_id',
        'department_id',
        'type',
        'quantity',
        'reason',
        'movement_date',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'quantity'      => 'integer',
            'movement_date' => 'date',
        ];
    }

    // ── Relations ─────────────────────────────────────────────────────────
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }


}
