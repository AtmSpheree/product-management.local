import { useEffect, useState, useContext } from "react";
import { Row, Col, Image, Alert, Form, Button, Container } from "react-bootstrap";
import { useNavigate, useParams, useLocation } from "react-router";
import { DataContext } from '../../context/dataContext';

export default function AddSale() {
  const navigator = useNavigate();
  const params = useParams();
  const dataContext = useContext(DataContext);
  const location = useLocation();
  const [sale, setSale] = useState(null);
  const [products, setProducts] = useState(null);
  const [isFormShown, setIsFormShown] = useState(false);
  const [isAlert, setIsAlert] = useState(false);

  const [fields, setFields] = useState({
    date: '',
    products: []
  });
  const [errors, setErrors] = useState({
    date: [],
    products: []
  });
  
  useEffect(() => {
    if (dataContext.data?.profile === null) {
      navigator('/login');
    }
  }, [dataContext.data?.profile])

  useEffect(() => {
    async function doActions() {
      let data = await fetch(`${import.meta.env.VITE_API_URL}/products`, {
        method: "GET",
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
        navigator('/login')
      } else {
        let response = await data.json();
        setProducts(response.data)
      }

      if (params.saleId) {
        data = await fetch(`${import.meta.env.VITE_API_URL}/sales/${params.saleId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (data.status === 404) {
          setIsFormShown({error: true, message: 'Такой поставки не существует.'});
        } else if (data.status === 401) {
          localStorage.removeItem('token');
          dataContext.setData({
            ...dataContext.data,
            profile: null
          });
          navigator('/login')
        } else {
          setIsFormShown(true);
          let response = await data.json();
          setSale({
            date: response.data.date,
            products: response.data.products,
          })
          setFields({
            date: response.data.date,
            products: response.data.products,
          })
        }
      }

    }

    doActions();
  }, [])

  const onFormSubmit = async (e) => {
    e.preventDefault();
    console.log(fields)
    try {
      let data = await fetch(`${import.meta.env.VITE_API_URL}/sales`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
          date: fields.date,
          products: fields.products
        })
      });
      if (data.status === 401) {
        localStorage.removeItem('token');
        dataContext.setData({
          ...dataContext.data,
          profile: null,
        });
        navigator('/login')
      } else if (data.status === 422) {
        let response = await data.json();
        setErrors({
          date: [],
          products: [],
          ...response.errors
        });
      } else {
        if (location.state && location.state.prev) {
          navigator(location.state.prev);
        } else {
          navigator(`/sales`);
        }
      }
    } catch (e) {

    }
  }

  const checkSimilarity = () => {
    if (sale === null) {
      return true;
    }
    if (fields.date === sale.date) {
      if (fields.products.length === sale.products.length && fields.products.filter((item, index) => !(
          item.id === sale.products[index].id && item.count === sale.products[index].count && item.price === sale.products[index].price
        )).length === 0) {
        return true;
      }
    }
    return false;
  }

  const onChangeFormSubmit = async (e) => {
    e.preventDefault();
    try {
      let data = await fetch(`${import.meta.env.VITE_API_URL}/sales/${params.saleId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
          date: fields.date,
          products: fields.products
        })
      });
      if (data.status === 401) {
        localStorage.removeItem('token');
        dataContext.setData({
          ...dataContext.data,
          profile: null
        });
        navigator('/login')
      } else if (data.status === 422) {
        let response = await data.json();
        setErrors({
          date: [],
          products: [],
          ...response.errors
        });
      } else {
        let response = await data.json();
        setSale({
          date: response.data.date,
          products: response.data.products,
        })
        setFields({
          date: response.data.date,
          products: response.data.products,
        })
        setErrors({
          date: [],
          products: []
        });
        setIsAlert(true);
        setTimeout(() => setIsAlert(false), 2000)
      }
    } catch (e) {

    }
  }

  const setProductsId = (index, val) => {
    setFields({
      ...fields,
      products: fields.products.map((item, item_index) => item_index === index ?
        {
          ...item,
          id: val
        }        
      :
        item
      )
    })
  }

  const setProductsCount = (index, val) => {
    setFields({
      ...fields,
      products: fields.products.map((item, item_index) => item_index === index ?
        {
          ...item,
          count: parseInt(val)
        }        
      :
        item
      )
    })
  }

  const setProductsPrice = (index, val) => {
    setFields({
      ...fields,
      products: fields.products.map((item, item_index) => item_index === index ?
        {
          ...item,
          price: val
        }        
      :
        item
      )
    })
  }

  const getProducts = () => {
    return products;
  }

  const addProduct = () => {
    if (products.length === 0 || (fields.products.length + 1 > products.length)) {
      return;
    }
    setFields({
      ...fields,
      products: [
        ...fields.products,
        {
          id: products[0].id,
          count: 1,
          price: 10
        }
      ]
    })
  }

  const deleteProduct = (index) => {
    console.log(index)
    setFields({
      ...fields,
      products: fields.products.filter((item, item_index) => item_index !== index)
    })
  }

  return (<>
    {isFormShown.error &&
      <Container
        className="d-flex justify-content-center align-items-center"
      >
        <div className="text-center">
          <h1>{isFormShown.message}</h1>
        </div>
      </Container>
    }
    {(((params.saleId && isFormShown === true) || (!params.saleId)) && products !== null) &&
      <Container className="mt-4" style={{ maxWidth: '500px' }}>
        <h2 className="mb-4 text-center">{params.saleId ? 'Редактирование продажи' : 'Добавление продажи'}</h2>
        <Form onSubmit={params.saleId ? onChangeFormSubmit : onFormSubmit}>
          <Form.Group controlId="date" className="mb-3">
            <Form.Label>Дата</Form.Label>
            <Form.Control
              onChange={(e) => setFields({...fields, date: e.target.value})}
              value={fields.date}
              type="date"
              placeholder="Введите дату"
              readOnly={params.supplierId}
              required
              isInvalid={errors.date.length > 0}
            />
            {errors.date.map((item, index) =>
              <Form.Control.Feedback type="invalid" key={index}>
                {item}
              </Form.Control.Feedback>
            )}
          </Form.Group>
          <Form.Group className="mb-3">
            <Button
              variant="primary"
              size="sl"
              title="Добавить товар"
              style={{marginBottom: 10}}
              onClick={(e) => addProduct()}
            >Добавить товар</Button>
            <br/>
            <Form.Label>Товары</Form.Label>
            {fields.products !== null && fields.products.map((item, index) => (
              <Row key={index} className="mb-3">
                <Col md={4}>
                  <Form.Group controlId={`productSelect-${item.id}`}>
                    <Form.Label>Товар</Form.Label>
                    <Form.Select
                      value={item.id}
                      onChange={(e) => setProductsId(index, e.target.value)}
                    >
                      {getProducts().map(prod => (
                        <option key={prod.id} value={prod.id}>
                          {prod.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group controlId={`productCount-${item.id}`}>
                    <Form.Label>Количество</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      value={item.count}
                      required
                      onChange={(e) => setProductsCount(index, e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group controlId={`productPrice-${item.id}`}>
                    <Form.Label>Цена, руб.</Form.Label>
                    <Form.Control
                      type="number"
                      min="10"
                      step="0.01"
                      value={item.price}
                      required
                      onChange={(e) => setProductsPrice(index, e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={1}>
                  <Form.Group>
                    <Form.Label>ㅤ</Form.Label>
                    <Button
                      style={{width: '38px'}}
                      variant="outline-danger"
                      size="sm"
                      title="Удалить"
                      onClick={(e) => deleteProduct(index)}
                    >
                      &#10005;
                    </Button>
                  </Form.Group>
                </Col>
              </Row>
            ))}
            {errors.products.map((item, index) =>
              <Form.Control.Feedback type="invalid" key={index}>
                {item}
              </Form.Control.Feedback>
            )}
          </Form.Group>
          {(params.saleId && !checkSimilarity()) &&
            <Button variant="primary" type="submit" className="w-100" style={{marginBottom: '10px'}}>
              Редактировать запись
            </Button>
          }
          {isAlert &&
            <Alert variant='success'>
              Запись успешно отредактирована.
            </Alert>
          }
          {!params.saleId &&
            <Button variant="primary" type="submit" className="w-100 mb-3">
              Добавить
            </Button>
          }
        </Form>
      </Container>
    }
  </>)
}