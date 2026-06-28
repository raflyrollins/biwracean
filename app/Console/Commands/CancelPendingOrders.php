<?php

namespace App\Console\Commands;

use App\Events\TicketOrderStatusChanged;
use App\Models\TicketOrder;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:cancel-pending-orders')]
#[Description('Batalkan otomatis pesanan pending yang sudah >12 jam')]
class CancelPendingOrders extends Command
{
    public function handle(): void
    {
        $cutoff = now()->subHours(12);

        $orders = TicketOrder::where('status', 'pending')
            ->where(function ($q) use ($cutoff) {
                $q->where('created_at', '<=', $cutoff)
                    ->orWhereHas('sailing', function ($q) {
                        $q->whereDate('departure_date', '<', now()->format('Y-m-d'));
                    });
            })
            ->get();

        $count = $orders->count();
        if ($count === 0) {
            return;
        }

        foreach ($orders as $order) {
            $oldStatus = $order->status;
            $order->update(['status' => 'cancelled']);
            TicketOrderStatusChanged::dispatch($order, $oldStatus);
        }

        $this->info("{$count} pesanan pending dibatalkan (kadaluwarsa >12 jam atau jadwal sudah lewat).");
    }
}
