<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: sans-serif; font-size: 11px; }
        h2 { margin-bottom: 4px; }
        .subtitle { color: #666; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
        th { background-color: #f3f4f6; }
        .text-right { text-align: right; }
        .in { color: #16a34a; }
        .out { color: #dc2626; }
    </style>
</head>
<body>
    <h2>Laporan Stock Movement</h2>
    <p class="subtitle">Dicetak pada: {{ now()->format('d M Y H:i') }}</p>

    <table>
        <thead>
            <tr>
                <th>Tanggal</th>
                <th>Material</th>
                <th>Gudang</th>
                <th>Tipe</th>
                <th class="text-right">Qty</th>
                <th>Dibuat Oleh</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($movements as $movement)
                <tr>
                    <td>{{ $movement->created_at->format('Y-m-d H:i') }}</td>
                    <td>{{ $movement->material?->name }}</td>
                    <td>{{ $movement->warehouse?->name }}</td>
                    <td class="{{ $movement->type }}">{{ ucfirst($movement->type) }}</td>
                    <td class="text-right">{{ $movement->qty }}</td>
                    <td>{{ $movement->creator?->name }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>