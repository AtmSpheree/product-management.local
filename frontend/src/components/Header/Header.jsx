import { useContext, useEffect } from "react";
import { Button, Container, Nav, Navbar } from "react-bootstrap";
import { data, Outlet, useNavigate } from "react-router";
import { DataContext } from "../../context/dataContext";

export default function Header({ getProfile }) {
  const navigator = useNavigate();
  const dataContext = useContext(DataContext);

  useEffect(() => {
    getProfile();
  }, [])

  const changeTheme = () => {
    if (dataContext.data?.theme === 'dark') {
      localStorage.setItem('theme', 'light');
      dataContext.setData({
        ...dataContext.data,
        theme: 'light'
      })
    } else {
      localStorage.setItem('theme', 'dark');
      dataContext.setData({
        ...dataContext.data,
        theme: 'dark'
      })
    }
  }

  const logout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
      });
      localStorage.removeItem('token');
      dataContext.setData({
        ...dataContext.data,
        profile: null,
        posts: null
      })
      navigator('/login')
    } catch (e) {

    }
  }

  return <>
    {dataContext.data?.profile !== undefined &&
      <>
        <Navbar variant={dataContext.data?.theme} expand="lg" className="mb-4">
          <Container>
            <Navbar.Brand onClick={(e) => navigator('/')} style={{cursor: 'pointer'}} className="d-flex align-items-center">
              <img
                alt=""
                style={{height: 40, padding: 5, borderRadius: 5}}
                src="/icon.png"
                className="d-inline-block align-top"
              />
              <p style={{margin: 0, marginLeft: 10, ...((() => {return location.pathname === '/login' ? {color: 'white'} : {}})())}}>
                Управление товарными запасами
              </p>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                {dataContext.data?.profile !== null &&
                  <>
                    <Nav.Link onClick={(e) => navigator('/profile')}>Профиль</Nav.Link>
                    <Nav.Link onClick={(e) => navigator('/')}>Товары</Nav.Link>
                    <Nav.Link onClick={(e) => navigator('/sales')}>Продажи</Nav.Link>
                    <Nav.Link onClick={(e) => navigator('/categories')}>Категории</Nav.Link>
                    <Nav.Link onClick={(e) => navigator('/reports')}>Отчёты</Nav.Link>
                  </>
                }
              </Nav>
              <Nav className="ms-auto">
                {dataContext.data?.profile === null ?
                  <>
                    <Nav.Link style={{...((() => {return location.pathname === '/login' ? {color: 'white'} : {}})())}} onClick={(e) => navigator('/login')}>Вход</Nav.Link>
                  </>
                :
                  <Nav.Link onClick={logout}>Выход</Nav.Link>
                }
                
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
        <Outlet/>
      </>
    }
  </>
}