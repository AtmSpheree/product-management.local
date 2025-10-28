import { useEffect, useState, useContext } from "react";
import { Modal, Image, ListGroup, Button, Container, Row, Col, Form, Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router";
import { DataContext } from '../../context/dataContext';

export default function Reports() {
  const navigator = useNavigate();
  const [sales, setSales] = useState(null);
  const [showingSales, setShowingSales] = useState([]);
  const [products, setProducts] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isDate, setIsDate] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const dataContext = useContext(DataContext);

  const [reportInfo, setReportInfo] = useState({count: null, summary: null})
  const [showDropdown, setShowDropdown] = useState(false);
  const [fields, setFields] = useState({
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    if (dataContext.data?.profile === null) {
      navigator('/login');
    }
  }, [dataContext.data?.profile])

  useEffect(() => {
    async function getData() {
      try {
        let data = await fetch(`${import.meta.env.VITE_API_URL}/products`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        let response = await data.json();
        setProducts(response.data);
      } catch (e) {
        console.log(e)
      }

      try {
        let data = await fetch(`${import.meta.env.VITE_API_URL}/sales`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        let response = await data.json();
        setSales(
          response.data
        );
      } catch (e) {

      }
    }

    getData();
  }, [])

  const makeReport = (e) => {
    e.preventDefault()
    let new_sales = sales.filter((item) => {
      console.log(item.products.filter((prod) => selectedProducts.includes(prod.id)))
      console.log(selectedProducts)
      if (selectedProducts.length === 0 || (selectedProducts.length !== 0 && item.products.length == selectedProducts.length && item.products.filter((prod) => !selectedProducts.includes(prod.id)).length == 0)) {
        if (!isDate || (isDate && ((new Date(fields.start_date)) < (new Date(item.date))) && ((new Date(fields.end_date)) > (new Date(item.date))))) {
          return true;
        }
      }
      return false
    });
    setShowingSales(new_sales);
    setReportInfo({
      count: new_sales.map(item => item.products.map(prod => prod.count).reduce((sum, current) => sum + current, 0)).reduce((sum, current) => sum + current, 0),
      summary: new_sales.map(item => item.products.map(prod => prod.count * prod.price).reduce((sum, current) => sum + current, 0)).reduce((sum, current) => sum + current, 0)
    });
  }

  const handleToggle = (id) => {
    setSelectedProducts((prev) =>
      prev.includes(id)
        ? prev.filter((prodId) => prodId !== id)
        : [...prev, id]
    );
  };

  return (<>
    {(sales !== null && products !== null) &&
      <Container>
        <h2 className="mb-4">Отчёты</h2>
        <Form style={{marginBottom: 10}} onSubmit={makeReport}>
          <Row>
            <Col md={2}>
              <Form.Label></Form.Label>
              <Form.Check
                onChange={(e) => setIsDate(e.target.checked)}
                value={isDate}
                type="checkbox"
                id='id-date-checkbox'
                label='За выбранный период'
              />
            </Col>
            <Col md={2}>
              <Form.Label>Начальная дата</Form.Label>
              <Form.Control
                onChange={(e) => setFields({...fields, start_date: e.target.value})}
                value={fields.start_date}
                type="date"
                placeholder="Введите дату"
                required={isDate}
                disabled={!isDate}
              />
            </Col>
            <Col md={2}>
              <Form.Label>Конечная дата</Form.Label>
              <Form.Control
                onChange={(e) => setFields({...fields, end_date: e.target.value})}
                value={fields.end_date}
                type="date"
                placeholder="Введите дату"
                required={isDate}
                disabled={!isDate}
              />
            </Col>
            <Col md={2}>
              <Form.Label>Товары</Form.Label>
              <Dropdown show={showDropdown} onToggle={() => setShowDropdown(!showDropdown)}>
                <Dropdown.Toggle variant="primary" id="product-selector">
                  Товары
                </Dropdown.Toggle>
                <Dropdown.Menu style={{ padding: '10px', minWidth: '250px' }}>
                  {products.map((product) => (
                    <Form.Check
                      key={product.id}
                      type="checkbox"
                      id={`product-${product.id}`} 
                      label={product.name}
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleToggle(product.id)}
                    />
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </Col>
          </Row>
          <Button
            variant="primary"
            size="sl"
            title="Сформировать отчёт"
            style={{marginBottom: 10, marginTop: 10}}
            type="submit"
          >Сформировать отчёт</Button>
        </Form>
        {showingSales.length > 0 && <>
          <h4>Всего продано товаров - <b>{reportInfo.count}</b></h4>
          <h4>Всего продано товаров на сумму - <b>{reportInfo.summary} руб.</b></h4>
        </>}
        <h3></h3>
        <table class="table">
          <thead>
            <tr>
              <th scope="col">Дата</th>
              <th scope="col">Цена, руб.</th>
              <th scope="col">Товары</th>
            </tr>
          </thead>
          <tbody>
            {showingSales.map(item => <tr>
              <td>{item.date}</td>
              <td>{item.products.map(prod => prod.count * prod.price).reduce((partialSum, a) => partialSum + a, 0)}</td>
              <td>
                {item.products.map((prod, index) => <>
                  <div className="d-flex align-items-center" style={{gap: 5}}>
                    <Image
                      src={prod.image === null ? '/img/image-blank.png' : prod.image}
                      style={{maxHeight: "30px", maxWidth: "30px", borderRadius: 5, objectFit: "contain"}}
                      alt="Изображение"
                    />
                    <p style={{margin: 0}}>{prod.name} ({prod.count})</p>
                  </div>
                  {index !== (item.products.length - 1) && <br/>}
                </>)}
              </td>
            </tr>)}
          </tbody>
        </table>
      </Container>
    }
  </>);
}