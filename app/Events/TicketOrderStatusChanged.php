<?php

namespace App\Events;

use App\Models\TicketOrder;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TicketOrderStatusChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $uuid;

    public string $bookingCode;

    public string $oldStatus;

    public string $newStatus;

    public function __construct(TicketOrder $ticketOrder, string $oldStatus)
    {
        $this->uuid = $ticketOrder->uuid;
        $this->bookingCode = $ticketOrder->booking_code;
        $this->oldStatus = $oldStatus;
        $this->newStatus = $ticketOrder->status;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('admin.ticket-orders'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'ticket-order.status-changed';
    }
}
