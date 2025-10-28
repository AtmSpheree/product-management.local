<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSaleRequest;
use App\Http\Requests\UpdateSaleRequest;
use App\Http\Resources\SaleResource;
use App\Models\Sale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SaleController extends Controller
{
    public function index(Request $request) {
        $sales = Sale::all();
        return SaleResource::collection($sales);
    }

    public function store(StoreSaleRequest $request) {
        $user = Auth::user();
        $sale = new Sale($request->only(['date']));
        $sale->save();
        if ($request->has('products')) {
            foreach ($request->input('products') as $product) {
                $sale->products()->attach($product['id'], ['count' => $product['count'], 'price' => $product['price']]);
            }
        }
        return response()->json(['data' => new SaleResource($sale)], 201);
    }

    public function get_sale(Request $request, $sale_id) {
        $user = Auth::user();
        $sale = Sale::where('id', $sale_id)->first();
        if ($sale) {
            return response()->json(['data' => new SaleResource($sale)]);
        }
        return response()->json(['message' => 'Not found.'], 404);
    }

    public function update(UpdateSaleRequest $request, $sale_id) {
        $user = Auth::user();
        $sale = Sale::where('id', $sale_id);
        if ($sale->first()) {
            $sale->update($request->only(['date']));
            if ($request->has('products')) {
                $sale->first()->products()->detach();
                foreach ($request->input('products') as $product) {
                    $sale->first()->products()->attach($product['id'], ['count' => $product['count'], 'price' => $product['price']]);
                }
            }
            return response()->json(['data' => new SaleResource($sale->first())]);
        }
        return response()->json(['message' => 'Not found.'], 404);
    }

    public function destroy(Request $request, $sale_id) {
        $user = Auth::user();
        $sale = Sale::where('id', $sale_id);
        if ($sale->first()) {
            $sale->delete();
            return response()->noContent();
        }
        return response()->json(['message' => 'Not found.'], 404);
    }
}
