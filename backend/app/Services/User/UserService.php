<?php

namespace App\Services\User;

use App\Models\User;
use App\Notifications\NewUserCredentialsNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class UserService
{
    public function create(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $temporaryPassword = $this->generateTemporaryPassword();

            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $temporaryPassword, // otomatis di-hash lewat cast 'hashed'
                'is_active' => true,
                'must_change_password' => true,
            ]);

            $user->assignRole($data['role']);

            $user->notify(new NewUserCredentialsNotification($data['email'], $temporaryPassword));

            return $user->load('roles');
        });
    }

    public function update(User $user, array $data): User
    {
        $user->update([
            'name' => $data['name'],
            'email' => $data['email'],
            'is_active' => $data['is_active'] ?? $user->is_active,
        ]);

        if (isset($data['role'])) {
            $user->syncRoles([$data['role']]);
        }

        return $user->load('roles');
    }

    private function generateTemporaryPassword(): string
    {
        // 12 karakter acak, kombinasi huruf besar/kecil/angka, mudah dibaca (tanpa karakter ambigu 0/O/l/1)
        $chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';

        return collect(range(1, 12))
            ->map(fn() => $chars[random_int(0, strlen($chars) - 1)])
            ->implode('');
    }
}
