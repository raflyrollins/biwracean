<?php

namespace App\Events;

use App\Models\TicketAvailability;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TicketStockUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $stock;

    public function __construct(TicketAvailability $ticketAvailability)
    {
        $ticketAvailability->load([
            'route.ship:id,name',
            'route.originPort:id,name',
            'route.destinationPort:id,name',
            'ticketClass:id,name,code',
        ]);

        $this->stock = [
            'id' => $ticketAvailability->id,
            'route_id' => $ticketAvailability->route_id,
            'ticket_class_id' => $ticketAvailability->ticket_class_id,
            'date' => $ticketAvailability->date,
            'price' => $ticketAvailability->price,
            'available_stock' => $ticketAvailability->available_stock,
            'sold_stock' => $ticketAvailability->sold_stock,
            'remaining' => $ticketAvailability->remainingStock(),
            'ship_name' => $ticketAvailability->route?->ship?->name,
            'origin' => $ticketAvailability->route?->originPort?->name,
            'destination' => $ticketAvailability->route?->destinationPort?->name,
            'ticket_class' => $ticketAvailability->ticketClass?->name,
        ];
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('admin.ticket-stock'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'ticket-stock.updated';
    }
}
