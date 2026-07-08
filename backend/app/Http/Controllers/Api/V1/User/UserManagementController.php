<?php

namespace App\Http\Controllers\Api\V1\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\User\UserResource;
use App\Models\User;
use App\Services\User\UserService;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

class UserManagementController extends Controller
{
    public function __construct(
        private UserService $service
    ) {}

    public function index(Request $request)
    {
        $users = User::query()
            ->with('roles')
            ->when($request->search, fn($q) => $q->where('name', 'ilike', "%{$request->search}%")
                ->orWhere('email', 'ilike', "%{$request->search}%"))
            ->orderBy('name')
            ->paginate($request->per_page ?? 15);

        return UserResource::collection($users);
    }

    public function store(StoreUserRequest $request)
    {
        $user = $this->service->create($request->validated());

        return new UserResource($user);
    }

    public function show(User $user)
    {
        return new UserResource($user->load('roles'));
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $user = $this->service->update($user, $request->validated());

        return new UserResource($user);
    }

    public function roles()
    {
        abort_unless(request()->user()->can('user.manage'), 403);

        return response()->json(['data' => Role::pluck('name')]);
    }
}
