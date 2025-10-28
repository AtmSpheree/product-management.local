import { useContext, useEffect, useState } from 'react'
import './App.css'
import { Route, Routes, useNavigate } from 'react-router'
import Header from './components/Header/Header'
import Login from './components/Login/Login'
import Profile from './components/Profile/Profile'
import { DataContext } from './context/dataContext'
import AddProduct from './components/AddProduct/AddProduct'
import Products from './components/Products/Products'
import AddSale from './components/AddSale/AddSale'
import Sales from './components/Sales/Sales'
import AddCategory from './components/AddCategory/AddCategory'
import Categories from './components/Categories/Categories'
import Reports from './components/Reports/Reports'

function App() {
  const navigator = useNavigate();
  const dataContext = useContext(DataContext);

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', dataContext.data?.theme)
  }, [dataContext.data?.theme])

  async function getProfile() {
    if (localStorage.getItem('token') !== null && localStorage.getItem('token') !== undefined) {
      try {
        let data = await fetch(`${import.meta.env.VITE_API_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (data.status === 401) {
          localStorage.removeItem('token');
          dataContext.setData({
            ...dataContext.data,
            profile: null
          });
        } else {
          let response = await data.json();
          dataContext.setData({
            ...dataContext.data,
            profile: response.data
          })
        }
      } catch (e) {

      }
    } else {
      dataContext.setData({
        ...dataContext.data,
        profile: null
      })
    }
  }

  return (
    <Routes>
      <Route element={<Header getProfile={getProfile}/>}>
        <Route path='/login' element={<Login getProfile={getProfile}/>}/>
        <Route path='/profile' element={<Profile/>}/>
        <Route path='/' element={<Products/>}/>
        <Route path='/add_product' element={<AddProduct/>}/>
        <Route path='/products/:productId' element={<AddProduct/>}/>
        <Route path='/sales' element={<Sales/>}/>
        <Route path='/add_sale' element={<AddSale/>}/>
        <Route path='/sales/:saleId' element={<AddSale/>}/>
        <Route path='/categories' element={<Categories/>}/>
        <Route path='/add_category' element={<AddCategory/>}/>
        <Route path='/categories/:categoryId' element={<AddCategory/>}/>
        <Route path='/reports' element={<Reports/>}/>
      </Route>
    </Routes>
  )
}

export default App
