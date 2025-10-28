<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index(Request $request) {
        $products = Product::all();
        return ProductResource::collection($products);
    }

    public function store(StoreProductRequest $request) {
        $user = Auth::user();
        $product = new Product($request->only(['name', 'description']));
        $image = $request->file('image');
        if ($image) {
            $image_name = uniqid() . '.' . $image->getClientOriginalExtension();
            $product->image = $image_name;
            $image->storeAs('images', $image_name, 'public');
        }
        $product->save();
        if ($request->has('categories')) {
            foreach ($request->input('categories') as $category_id) {
                if ($product->categories->contains('id', $category_id)) {
                    continue;
                }
                $product->categories()->attach($category_id);
            }
        }
        return response()->json(['data' => new ProductResource($product)], 201);
    }

    public function get_product(Request $request, $product_id) {
        $user = Auth::user();
        $product = Product::where('id', $product_id)->first();
        if ($product) {
            return response()->json(['data' => new ProductResource($product)]);
        }
        return response()->json(['message' => 'Not found.'], 404);
    }

    public function update(UpdateProductRequest $request, $product_id) {
        $user = Auth::user();
        $product = Product::where('id', $product_id);
        if ($product->first()) {
            if ($request->has('name')) {
                if (Product::whereNot('id', $product_id)->where('name', $request->input('name'))->first()) {
                    return response()->json(['message' => 'Invalid fields', 'errors' => ['name' => 'Такое значение поля «Название» уже существует.']], 422);
                }
            }
            $product->update($request->only(['name', 'description']));
            if ($request->has('categories')) {
                $product->first()->categories()->detach();
                foreach ($request->input('categories') as $category_id) {
                    if ($product->first()->categories->contains('id', $category_id)) {
                        continue;
                    }
                    $product->first()->categories()->attach($category_id);
                }
            }
            if ($request->has('image')) {
                $image = $request->file('image');
                if ($image) {
                    if ($product->first()->image !== null) {
                        $image->storeAs('images', $product->first()->image, 'public');
                    } else {
                        $image_name = uniqid() . '.' . $image->getClientOriginalExtension();
                        $product->update(['image' => $image_name]);
                        $image->storeAs('images', $image_name, 'public');
                    }
                }
            }
            return response()->json(['data' => new ProductResource($product->first())]);
        }
        return response()->json(['message' => 'Not found.'], 404);
    }

    public function destroy(Request $request, $product_id) {
        $user = Auth::user();
        $product = Product::where('id', $product_id);
        if ($product->first()) {
            if ($product->first()->image) {
                Storage::disk('public')->delete('images/' . $product->first()->image);
            }
            $product->delete();
            return response()->noContent();
        }
        return response()->json(['message' => 'Not found.'], 404);
    }
}
