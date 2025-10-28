import { useEffect, useState, useContext } from "react";
import { Modal, Image, ListGroup, Button, Container, Row, Col, Form } from "react-bootstrap";
import { useNavigate } from "react-router";
import { DataContext } from '../../context/dataContext';

export default function Sales() {
  const navigator = useNavigate();
  const [sales, setSales] = useState(null);
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
      try {
        let data = await fetch(`${import.meta.env.VITE_API_URL}/sales`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        let response = await data.json();
        setSales(
          response.data.sort((a, b) => {
            let [date_a, date_b] = [new Date(a.date), new Date(b.date)];
            if (sortNumber === 'По убыванию') {
              return date_b - date_a
            } else {
              return date_a - date_b
            }
          })
        );
      } catch (e) {

      }
    }

    getData();
  }, [])

  const deleteSale = async (e) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/sales/${modalShow}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSales(sales.filter(item => item.id !== modalShow))
      setModalShow(false);
    } catch (e) {
      console.log(e)
    }
  }

  const deleteSaleModal = (id) => {
    setModalShow(id);
  }

  useEffect(() => {
    if (sales !== null) {
      setSales(
        sales.sort((a, b) => {
          let [date_a, date_b] = [new Date(a.date), new Date(b.date)];
          if (sortNumber === 'По убыванию') {
            return date_b - date_a
          } else {
            return date_a - date_b
          }
        })
      );
    }
  }, [sortNumber])

  return (<>
    {sales !== null &&
      <Container>
        <h2 className="mb-4">Продажи</h2>
        <Form style={{marginBottom: 10}}>
          <Col md={2}>
            <Form.Label>Сортировка по дате</Form.Label>
            <Form.Select
              value={sortNumber}
              onChange={(e) => {setSortNumber(e.target.value)}}
            >
              <option value='По возрастанию'>По возрастанию</option>
              <option value='По убыванию'>По убыванию</option>
            </Form.Select>
          </Col>
        </Form>
        <Button
          variant="primary"
          size="sl"
          title="Добавить продажу"
          style={{marginBottom: 10}}
          onClick={(e) => navigator(`/add_sale`, {state: {prev: '/sales'}})}
        >Добавить продажу</Button>
        <table class="table">
          <thead>
            <tr>
              <th scope="col">Дата</th>
              <th scope="col">Цена, руб.</th>
              <th scope="col">Товары</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            {sales.map(item => <tr>
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
              <td>
                <Button
                  style={{width: '38px', marginRight: 10, marginLeft: "calc(100% - 86px)"}}
                  variant="outline-secondary"
                  size="sm"
                  title="Редактировать"
                  onClick={(e) => navigator(`/sales/${item.id}`, {state: {prev: '/sales'}})}
                >
                  &#9998;
                </Button>
                <Button
                  style={{width: '38px'}}
                  variant="outline-danger"
                  size="sm"
                  title="Удалить"
                  onClick={(e) => deleteSaleModal(item.id)}
                >
                  &#10005;
                </Button>
              </td>
            </tr>)}
          </tbody>
        </table>
        <Modal show={modalShow !== false} onHide={() => setModalShow(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Удаление продажи</Modal.Title>
          </Modal.Header>
          <Modal.Body>Вы действительно хотите удалить эту продажу?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" onClick={() => deleteSale()}>
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