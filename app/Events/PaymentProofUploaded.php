<?php

namespace App\Events;

use App\Models\TicketOrder;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PaymentProofUploaded implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $uuid;

    public string $bookingCode;

    public string $customerName;

    public string $paymentProof;

    public ?string $origin;

    public ?string $destination;

    public function __construct(TicketOrder $ticketOrder)
    {
        $ticketOrder->load([
            'sailingLeg.originPort:id,name',
            'sailingLeg.destinationPort:id,name',
        ]);

        $this->uuid = $ticketOrder->uuid;
        $this->bookingCode = $ticketOrder->booking_code;
        $this->customerName = $ticketOrder->customer_name;
        $this->paymentProof = $ticketOrder->payment_proof;
        $this->origin = $ticketOrder->sailingLeg->originPort->name;
        $this->destination = $ticketOrder->sailingLeg->destinationPort->name;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('admin.ticket-orders'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'payment-proof.uploaded';
    }
}
