<?php

namespace App\Events;

use App\Models\TicketOrder;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TicketOrderCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $order;

    public function __construct(TicketOrder $ticketOrder)
    {
        $ticketOrder->load([
            'sailing:id,uuid,name,departure_date',
            'sailingLeg.originPort:id,name',
            'sailingLeg.destinationPort:id,name',
            'ticketClass:id,name,code',
        ]);

        $this->order = [
            'id' => $ticketOrder->id,
            'uuid' => $ticketOrder->uuid,
            'booking_code' => $ticketOrder->booking_code,
            'customer_name' => $ticketOrder->customer_name,
            'customer_email' => $ticketOrder->customer_email,
            'quantity' => $ticketOrder->quantity,
            'total_price' => $ticketOrder->total_price,
            'status' => $ticketOrder->status,
            'sailing' => $ticketOrder->sailing ? [
                'name' => $ticketOrder->sailing->name,
                'departure_date' => $ticketOrder->sailing->departure_date,
            ] : null,
            'origin' => $ticketOrder->sailingLeg?->originPort?->name,
            'destination' => $ticketOrder->sailingLeg?->destinationPort?->name,
            'ticket_class' => $ticketOrder->ticketClass?->name,
            'created_at' => $ticketOrder->created_at?->toIso8601String(),
        ];
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('admin.ticket-orders'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'ticket-order.created';
    }
}
