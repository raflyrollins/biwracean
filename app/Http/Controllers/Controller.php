<?php

namespace App\Http\Controllers;

abstract class Controller
{
    protected function sanitizeSearch(string $search): string
    {
        return trim($search);
    }
}
