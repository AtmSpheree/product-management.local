<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ProductSaleResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'image' => $this->image === null ? $this->image : env('APP_URL') . Storage::url('images/' . $this->image),
            'count' => $this->pivot->count,
            'price' => $this->pivot->price,
            'categories' => CategoryResource::collection($this->categories)
        ];
    }
}
