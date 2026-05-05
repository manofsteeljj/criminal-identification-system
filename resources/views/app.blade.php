<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>{{ config('app.name', 'Laravel') }}</title>

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @if (file_exists(public_path('build/manifest.json')) || file_exists(public_path('hot')))
            @vite(['resources/css/app.css', 'resources/js/app.js'])
        @endif
    </head>
    <body class="min-h-screen font-sans bg-gray-50 text-gray-900">
        <div id="app" class="min-h-screen flex items-center justify-center p-6">
            <div class="max-w-md text-center">
                <h1 class="text-xl font-semibold">Starting...</h1>
                <p class="mt-2 text-sm text-gray-600">
                    If this stays here, run <code>npm run dev</code> (or <code>npm run build</code> for production).
                </p>
            </div>
        </div>
    </body>
</html>
