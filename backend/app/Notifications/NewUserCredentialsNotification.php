<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewUserCredentialsNotification extends Notification implements \Illuminate\Contracts\Queue\ShouldQueue
{
    use Queueable;

    public function __construct(
        private string $email,
        private string $temporaryPassword,
    ) {}

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Akun WMS Coffee Anda Telah Dibuat')
            ->greeting("Halo, {$notifiable->name}!")
            ->line('Akun Anda telah dibuat oleh administrator di sistem WMS Coffee.')
            ->line("Email: {$this->email}")
            ->line("Password sementara: {$this->temporaryPassword}")
            ->line('Demi keamanan, Anda akan diminta mengganti password ini saat pertama kali login.')
            ->action('Masuk ke WMS Coffee', config('app.frontend_url', 'http://localhost:5173') . '/login')
            ->line('Jangan bagikan password ini kepada siapa pun.');
    }
}
