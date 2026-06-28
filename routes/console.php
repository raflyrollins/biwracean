<?php

use App\Console\Commands\CancelPendingOrders;
use Illuminate\Support\Facades\Schedule;

Schedule::command(CancelPendingOrders::class)->hourly();
