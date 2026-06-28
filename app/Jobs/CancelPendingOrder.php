<?php

namespace App\Jobs;

use App\Events\TicketOrderStatusChanged;
use App\Models\TicketOrder;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;

class CancelPendingOrder implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable;

    public function __construct(
        public TicketOrder $order,
    ) {}

    public function handle(): void
    {
        $order = $this->order->fresh();

        if (! $order || $order->status !== 'pending') {
            return;
        }

        $oldStatus = $order->status;
        $order->update(['status' => 'cancelled']);
        TicketOrderStatusChanged::dispatch($order, $oldStatus);
    }
}
