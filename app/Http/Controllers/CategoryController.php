<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CategoryController extends Controller
{
    public function index(Request $request) {
        $sales = Category::all();
        return CategoryResource::collection($sales);
    }

    public function store(StoreCategoryRequest $request) {
        $user = Auth::user();
        $category = new Category($request->only(['name']));
        $category->save();
        return response()->json(['data' => new CategoryResource($category)], 201);
    }

    public function get_category(Request $request, $category_id) {
        $user = Auth::user();
        $category = Category::where('id', $category_id)->first();
        if ($category) {
            return response()->json(['data' => new CategoryResource($category)]);
        }
        return response()->json(['message' => 'Not found.'], 404);
    }

    public function update(UpdateCategoryRequest $request, $category_id) {
        $user = Auth::user();
        $category = Category::where('id', $category_id);
        if ($category->first()) {
            $category->update($request->only(['name']));
            return response()->json(['data' => new CategoryResource($category->first())]);
        }
        return response()->json(['message' => 'Not found.'], 404);
    }

    public function destroy(Request $request, $category_id) {
        $user = Auth::user();
        $category = Category::where('id', $category_id);
        if ($category->first()) {
            $category->delete();
            return response()->noContent();
        }
        return response()->json(['message' => 'Not found.'], 404);
    }
}
