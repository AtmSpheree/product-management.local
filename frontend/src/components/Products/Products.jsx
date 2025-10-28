import { useEffect, useState, useContext } from "react";
import { Modal, ListGroup, Dropdown, Button, Container, Row, Col, Card, Image, Form } from "react-bootstrap";
import { useNavigate } from "react-router";
import { DataContext } from '../../context/dataContext';
import parseDate from '../../utils/parseDate'

export default function Products() {
  const navigator = useNavigate();
  const [products, setProducts] = useState(null);
  const [showingProducts, setShowingProducts] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [categories, setCategories] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [modalShow, setModalShow] = useState(false);
  const dataContext = useContext(DataContext);
  const [sortNumber, setSortNumber] = useState('По возрастанию');

  useEffect(() => {
    if (dataContext.data?.profile === null) {
      navigator('/login');
    }
  }, [dataContext.data?.profile])

  useEffect(() => {
    async function getData() {
      let data = await fetch(`${import.meta.env.VITE_API_URL}/categories`, {
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
        setCategories(response.data)
      }

      try {
        let data = await fetch(`${import.meta.env.VITE_API_URL}/products`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        let response = await data.json();
        setProducts(response.data);
        setShowingProducts(response.data.sort((a, b) => {
          if (sortNumber === 'По убыванию') {
            if (a.name.toLowerCase() > b.name.toLowerCase()) {
              return -1;
            }
            if (a.name.toLowerCase() < b.name.toLowerCase()) {
              return 1;
            }
            return 0;
          } else {
            if (a.name.toLowerCase() < b.name.toLowerCase()) {
              return -1;
            }
            if (a.name.toLowerCase() > b.name.toLowerCase()) {
              return 1;
            }
            return 0;
          }
        }))
      } catch (e) {
        console.log(e)
      }
    }

    getData();
  }, [])

  const deleteProduct = async (e) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/products/${modalShow}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setProducts(products.filter(item => item.id !== modalShow))
      setShowingProducts(products.filter(item => item.id !== modalShow))
      setModalShow(false);
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    if (products !== null) {
      setShowingProducts(
        JSON.parse(JSON.stringify(products)).sort((a, b) => {
          if (sortNumber === 'По убыванию') {
            if (a.name.toLowerCase() > b.name.toLowerCase()) {
              return -1;
            }
            if (a.name.toLowerCase() < b.name.toLowerCase()) {
              return 1;
            }
            return 0;
          } else {
            if (a.name.toLowerCase() < b.name.toLowerCase()) {
              return -1;
            }
            if (a.name.toLowerCase() > b.name.toLowerCase()) {
              return 1;
            }
            return 0;
          }
        })
      )
    }
  }, [sortNumber])

  const deleteProductModal = (id) => {
    setModalShow(id);
  }

  const handleToggle = (id) => {
    setSelectedCategories((prev) =>
      prev.includes(id)
        ? prev.filter((catId) => catId !== id)
        : [...prev, id]
    );
  };

  useEffect(() => {
    if (products !== null) {
      let new_products = products.filter(item => {
        let cats = new Set(item.categories.map(cat => cat.id));
        return selectedCategories.every(elem => cats.has(elem))
      })
      setShowingProducts(
        JSON.parse(JSON.stringify(new_products)).sort((a, b) => {
          if (sortNumber === 'По убыванию') {
            if (a.name.toLowerCase() > b.name.toLowerCase()) {
              return -1;
            }
            if (a.name.toLowerCase() < b.name.toLowerCase()) {
              return 1;
            }
            return 0;
          } else {
            if (a.name.toLowerCase() < b.name.toLowerCase()) {
              return -1;
            }
            if (a.name.toLowerCase() > b.name.toLowerCase()) {
              return 1;
            }
            return 0;
          }
        })
      )
    }
  }, [selectedCategories])

  return (<>
    {(products !== null && showingProducts !== null) &&
      <Container>
        <h2 className="mb-4">Товары</h2>
        {dataContext.data?.profile !== null && <>
          <Form style={{marginBottom: 10}}>
            <Row className="align-items-end">
              <Col md={2}>
                <Form.Label>Сортировка по названию</Form.Label>
                <Form.Select
                  value={sortNumber}
                  onChange={(e) => {setSortNumber(e.target.value)}}
                >
                  <option value='По возрастанию'>По возрастанию</option>
                  <option value='По убыванию'>По убыванию</option>
                </Form.Select>
              </Col>
              <Col md={2}>
              <Dropdown show={showDropdown} onToggle={() => setShowDropdown(!showDropdown)}>
                <Dropdown.Toggle variant="primary" id="category-filter">
                  Фильтр по категориям
                </Dropdown.Toggle>
                <Dropdown.Menu style={{ padding: '10px', minWidth: '250px' }}>
                  <Form>
                    {categories.map((category) => (
                      <Form.Check
                        key={category.id}
                        type="checkbox"
                        id={`category-${category.id}`} 
                        label={category.name}
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => handleToggle(category.id)}
                      />
                    ))}
                  </Form>
                </Dropdown.Menu>
              </Dropdown>
            </Col>
            </Row>
          </Form>
          <Button
            variant="primary"
            size="sl"
            title="Добавить товар"
            style={{marginBottom: 10}}
            onClick={(e) => navigator(`/add_product`, {state: {prev: '/products'}})}
          >Добавить товар</Button>
        </>}
        <Row>
          {showingProducts.map((item) => (
            <Col md={4} className="mb-4" key={item.id}>
              <Card style={{position: 'relative'}}>
                <Image
                  src={item.image === null ? '/img/image-blank.png' : item.image}
                  style={{maxHeight: "200px", objectFit: "contain", marginTop: 10}}
                  alt="Изображение"
                />
                <Card.Body>
                  <Card.Title>
                    {item.name}
                  </Card.Title>
                  <p style={{color: "#0d6efd"}}>
                    {item.categories.map(category => category.name).join(', ')}
                  </p>
                  <Card.Text>
                    {item.description} <br />
                  </Card.Text>
                  <div className="d-flex justify-content-between align-items-end gap-2">
                    <div className="d-flex gap-2 flex-wrap">
                      <Button
                        style={{width: '38px', marginRight: 10}}
                        variant="outline-secondary"
                        size="sm"
                        title="Редактировать"
                        onClick={(e) => navigator(`/products/${item.id}`, {state: {prev: '/products'}})}
                      >
                        &#9998;
                      </Button>
                      <Button
                        style={{width: '38px'}}
                        variant="outline-danger"
                        size="sm"
                        title="Удалить"
                        onClick={(e) => deleteProductModal(item.id)}
                      >
                        &#10005;
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        <Modal show={modalShow !== false} onHide={() => setModalShow(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Удаление товара</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Вы действительно хотите удалить этот товар?.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" onClick={() => deleteProduct()}>
              Удалить
            </Button>
            <Button variant="secondary" onClick={() => setModalShow(false)}>
              Отмена
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    }
  </>);
}