<?php

namespace App\Events;

use App\Models\TicketOrder;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TicketOrderUserNotification implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $uuid;

    public string $bookingCode;

    public string $oldStatus;

    public string $newStatus;

    public string $customerName;

    public int $userId;

    public function __construct(TicketOrder $ticketOrder, string $oldStatus)
    {
        $this->uuid = $ticketOrder->uuid;
        $this->bookingCode = $ticketOrder->booking_code;
        $this->oldStatus = $oldStatus;
        $this->newStatus = $ticketOrder->status;
        $this->customerName = $ticketOrder->customer_name;
        $this->userId = $ticketOrder->user_id;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.'.$this->userId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'ticket-order.notification';
    }
}
