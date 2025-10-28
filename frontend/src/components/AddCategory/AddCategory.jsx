import { useEffect, useState, useContext } from "react";
import { Row, Col, Image, Alert, Form, Button, Container } from "react-bootstrap";
import { useNavigate, useParams, useLocation } from "react-router";
import { DataContext } from '../../context/dataContext';

export default function AddCategory() {
  const navigator = useNavigate();
  const params = useParams();
  const dataContext = useContext(DataContext);
  const [category, setCategory] = useState(null);
  const location = useLocation();
  const [isFormShown, setIsFormShown] = useState(false);
  const [isAlert, setIsAlert] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const [fields, setFields] = useState({
    name: '',
  });
  const [errors, setErrors] = useState({
    name: [],
  });
  
  useEffect(() => {
    if (dataContext.data?.profile === null) {
      navigator('/login');
    }
  }, [dataContext.data?.profile])

  useEffect(() => {
    async function doActions() {
      if (params.categoryId) {
        try {
          let data = await fetch(`${import.meta.env.VITE_API_URL}/categories/${params.categoryId}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (data.status === 404) {
            setIsFormShown({error: true, message: 'Такой категории не существует.'});
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
            setCategory({'name': response.data.name})
            setFields({'name': response.data.name})
          }
        } catch (e) {

        }
      }
    }

    doActions();
  }, [])

  const onFormSubmit = async (e) => {
    e.preventDefault();
    try {
      let formData = new FormData();
      formData.append('name', fields.name);
      let data = await fetch(`${import.meta.env.VITE_API_URL}/categories`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
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
        setErrors({name: []});
      } else {
        navigator('/categories');
      }
    } catch (e) {

    }
  }

  const checkSimilarity = () => {
    if (category === null) {
      return true;
    }
    if (fields.name === category.name) {
        return true;
    }
    return false;
  }

  const onChangeFormSubmit = async (e) => {
    e.preventDefault();
    try {
      let formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('name', fields.name);
      let data = await fetch(`${import.meta.env.VITE_API_URL}/categories/${params.categoryId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
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
          name: [],
          ...response.errors});
      } else {
        let response = await data.json();
        setCategory({'name': response.data.name})
        setIsAlert(true);
        setTimeout(() => setIsAlert(false), 2000)
      }
    } catch (e) {
      console.log(e)
    }
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
    {((params.categoryId && isFormShown === true) || (!params.categoryId)) &&
      <Container className="mt-4" style={{ maxWidth: '400px' }}>
        <h2 className="mb-4 text-center">{params.categoryId ? 'Редактирование товара' : 'Добавление товара'}</h2>
        <Form onSubmit={params.categoryId ? onChangeFormSubmit : onFormSubmit}>
          <Form.Group controlId="name" className="mb-3">
            <Form.Label>Название</Form.Label>
            <Form.Control
              onChange={(e) => setFields({...fields, name: e.target.value})}
              value={fields.name}
              type="text"
              placeholder="Введите название"
              required
              isInvalid={errors.name.length > 0}
            />
            {errors.name.map((item, index) =>
              <Form.Control.Feedback type="invalid" key={index}>
                {item}
              </Form.Control.Feedback>
            )}
          </Form.Group>
          {(params.categoryId && !checkSimilarity()) &&
            <Button variant="primary" type="submit" className="w-100" style={{marginBottom: '10px'}}>
              Редактировать запись
            </Button>
          }

          {isAlert &&
            <Alert variant='success'>
              Запись успешно отредактирована.
            </Alert>
          }
          {!params.categoryId &&
            <Button variant="primary" type="submit" className="w-100 mb-3">
              Добавить
            </Button>
          }
        </Form>
      </Container>
    }
  </>)
}