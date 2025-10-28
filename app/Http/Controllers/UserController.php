<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\ProfileResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function update(UpdateUserRequest $request) {
        $user = Auth::user();
        $user->update($request->only(['fullname']));
        if ($request->has('password')) {
            $user->update(['password' => Hash::make($request->input('password'))]);
        }
        return response()->json(['data' => new ProfileResource($user)]);
    }

    public function get_profile(Request $request) {
        $user = Auth::user();
        return new ProfileResource($user);
    }
}
