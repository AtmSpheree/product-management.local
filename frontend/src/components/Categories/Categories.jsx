import { useEffect, useState, useContext } from "react";
import { Modal, ListGroup, Button, Container, Row, Col, Image, Form } from "react-bootstrap";
import { useNavigate } from "react-router";
import { DataContext } from '../../context/dataContext';
import parseDate from '../../utils/parseDate'

export default function Categories() {
  const navigator = useNavigate();
  const [categories, setCategories] = useState(null);
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
        let data = await fetch(`${import.meta.env.VITE_API_URL}/categories`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        let response = await data.json();
        setCategories(
          response.data.sort((a, b) => {
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
        );
      } catch (e) {
        console.log(e)
      }
    }

    getData();
  }, [])

  const deleteCategory = async (e) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/categories/${modalShow}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setCategories(categories.filter(item => item.id !== modalShow))
      setModalShow(false);
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    if (categories !== null) {
      setCategories(
        JSON.parse(JSON.stringify(categories)).sort((a, b) => {
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

  const deleteCategoryModal = (id) => {
    setModalShow(id);
  }

  return (<>
    {categories !== null &&
      <Container>
        <h2 className="mb-4">Категории</h2>
        {dataContext.data?.profile !== null && <>
          <Form style={{marginBottom: 10}}>
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
          </Form>
          <Button
            variant="primary"
            size="sl"
            title="Добавить категорию"
            style={{marginBottom: 10}}
            onClick={(e) => navigator(`/add_category`, {state: {prev: '/categories'}})}
          >Добавить категорию</Button>
        </>}
        <table class="table">
          <thead>
            <tr>
              <th scope="col">Название</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            {categories.map(item => <tr key={item.id}>
              <td>{item.name}</td>
              <td>
                <div className="d-flex justify-content-end" style={{gap: 10}}>
                  <Button
                    style={{width: '38px'}}
                    variant="outline-secondary"
                    size="sm"
                    title="Редактировать"
                    onClick={(e) => navigator(`/categories/${item.id}`, {state: {prev: '/categories'}})}
                  >
                    &#9998;
                  </Button>
                  <Button
                    style={{width: '38px'}}
                    variant="outline-danger"
                    size="sm"
                    title="Удалить"
                    onClick={(e) => deleteCategoryModal(item.id)}
                  >
                    &#10005;
                  </Button>
                </div>
              </td>
            </tr>)}
          </tbody>
        </table>
        <Modal show={modalShow !== false} onHide={() => setModalShow(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Удаление категории</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Вы действительно хотите удалить эту категорию?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" onClick={() => deleteCategory()}>
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