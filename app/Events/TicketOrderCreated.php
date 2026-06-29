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

        $passengers = $ticketOrder->passengers()->get();

        $this->order = [
            'id' => $ticketOrder->id,
            'uuid' => $ticketOrder->uuid,
            'booking_code' => $ticketOrder->booking_code,
            'customer_name' => $ticketOrder->customer_name,
            'customer_email' => $ticketOrder->customer_email,
            'customer_phone' => $ticketOrder->customer_phone,
            'quantity' => $ticketOrder->quantity,
            'total_price' => $ticketOrder->total_price,
            'status' => $ticketOrder->status,
            'notes' => $ticketOrder->notes,
            'payment_proof' => $ticketOrder->payment_proof,
            'origin' => $ticketOrder->sailingLeg?->originPort?->name,
            'destination' => $ticketOrder->sailingLeg?->destinationPort?->name,
            'sailing' => $ticketOrder->sailing ? [
                'name' => $ticketOrder->sailing->name,
                'departure_date' => $ticketOrder->sailing->departure_date,
            ] : null,
            'sailing_leg' => $ticketOrder->sailingLeg ? [
                'id' => $ticketOrder->sailingLeg->id,
                'origin_port_id' => $ticketOrder->sailingLeg->origin_port_id,
                'destination_port_id' => $ticketOrder->sailingLeg->destination_port_id,
                'origin_port' => $ticketOrder->sailingLeg->originPort ? [
                    'id' => $ticketOrder->sailingLeg->originPort->id,
                    'name' => $ticketOrder->sailingLeg->originPort->name,
                ] : null,
                'destination_port' => $ticketOrder->sailingLeg->destinationPort ? [
                    'id' => $ticketOrder->sailingLeg->destinationPort->id,
                    'name' => $ticketOrder->sailingLeg->destinationPort->name,
                ] : null,
            ] : null,
            'ticket_class' => $ticketOrder->ticketClass ? [
                'id' => $ticketOrder->ticketClass->id,
                'name' => $ticketOrder->ticketClass->name,
                'code' => $ticketOrder->ticketClass->code,
            ] : null,
            'passengers' => $passengers->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'nik' => $p->nik,
                'gender' => $p->gender,
                'date_of_birth' => $p->date_of_birth,
            ])->all(),
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
