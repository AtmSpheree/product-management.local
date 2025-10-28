import { useEffect, useState, useContext } from "react";
import { Row, Col, Image, Alert, Form, Button, Container, FormGroup } from "react-bootstrap";
import { useNavigate, useParams, useLocation } from "react-router";
import { DataContext } from '../../context/dataContext';

export default function AddProduct() {
  const navigator = useNavigate();
  const params = useParams();
  const dataContext = useContext(DataContext);
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState(null);
  const location = useLocation();
  const [isFormShown, setIsFormShown] = useState(false);
  const [isAlert, setIsAlert] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const [fields, setFields] = useState({
    name: '',
    description: '',
    image: '',
    categories: []
  });
  const [errors, setErrors] = useState({
    name: [],
    description: [],
    image: [],
    categories: []
  });
  
  useEffect(() => {
    if (dataContext.data?.profile === null) {
      navigator('/login');
    }
  }, [dataContext.data?.profile])

  useEffect(() => {
    async function doActions() {
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

      if (params.productId) {
        try {
          let data = await fetch(`${import.meta.env.VITE_API_URL}/products/${params.productId}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (data.status === 404) {
            setIsFormShown({error: true, message: 'Такого товара не существует.'});
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
            setProduct({
              'name': response.data.name,
              'description': response.data.description,
              'image': response.data.image === null ? "" : response.data.image,
              'categories': response.data.categories
            })
            setFields({
              'name': response.data.name,
              'description': response.data.description,
              'image': response.data.image === null ? "" : response.data.image,
              'categories': response.data.categories.map(item => item.id)
            })
            if (response.data.image !== null) {
              setImagePreview(response.data.image + `?${new Date().getTime()}`);
            }
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
      formData.append('description', fields.description);
      for (let i = 0; i < fields.categories.length; i++) {
        formData.append('categories[]', fields.categories[i]);
      }
      if (fields.image !== "") {
        formData.append('image', fields.image);
      }
      let data = await fetch(`${import.meta.env.VITE_API_URL}/products`, {
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
        setErrors({image: [], name: [], description: [], categories: [], ...response.errors});
      } else {
        navigator('/');
      }
    } catch (e) {

    }
  }

  const checkSimilarity = () => {
    if (product === null) {
      return true;
    }
    if (fields.description === product.description) {
      if (fields.name === product.name) {
        if (fields.image === product.image) {
          if (fields.categories.length === product.categories.length && fields.categories.filter((item, index) => !(
              item === product.categories[index].id
            )).length === 0) {
            return true;
          }
        }
      }
    }
    return false;
  }

  const onChangeFormSubmit = async (e) => {
    e.preventDefault();
    try {
      let formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('name', fields.name);
      formData.append('description', fields.description);
      if (fields.categories.length > 0) {
        for (let i = 0; i < fields.categories.length; i++) {
          formData.append('categories[]', fields.categories[i]);
        }
      }
      if (fields.image !== "" && fields.image !== product.image) {
        formData.append('image', fields.image);
      }
      let data = await fetch(`${import.meta.env.VITE_API_URL}/products/${params.productId}`, {
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
          image: [],
          description: [],
          categories: [],
          ...response.errors});
      } else {
        let response = await data.json();
        setProduct({
          'name': response.data.name,
          'description': response.data.description,
          'image': response.data.image === null ? "" : response.data.image,
          'categories': response.data.categories
        })
        setFields({
          'name': response.data.name,
          'description': response.data.description,
          'image': response.data.image === null ? "" : response.data.image,
          'categories': response.data.categories.map(item => item.id)
        })
        if (response.data.image !== null) {
          setImagePreview(response.data.image + `?${new Date().getTime()}`);
        }
        document.getElementById('image').value = "";
        setIsAlert(true);
        setTimeout(() => setIsAlert(false), 2000)
      }
    } catch (e) {
      console.log(e)
    }
  }

  const addCategory = () => {
    if (categories.length === 0 || (fields.categories.length + 1 > categories.length)) {
      return;
    }
    setFields({
      ...fields,
      categories: [
        ...fields.categories,
        categories[0].id
      ]
    })
  }

  const deleteCategory = (index) => {
    setFields({
      ...fields,
      categories: fields.categories.filter((item, item_index) => item_index !== index)
    })
  }

  const setCategoriesName = (index, val) => {
    console.log(index, val)
    setFields({
      ...fields,
      categories: fields.categories.map((item, item_index) => item_index === index ?
        parseInt(val)
      :
        item
      )
    })
  }

  useEffect(() => {
    console.log(errors)
  }, [errors])

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
    {((params.productId && isFormShown === true) || (!params.productId)) &&
      <Container className="mt-4" style={{ maxWidth: '400px' }}>
        <h2 className="mb-4 text-center">{params.productId ? 'Редактирование товара' : 'Добавление товара'}</h2>
        <Form onSubmit={params.productId ? onChangeFormSubmit : onFormSubmit}>
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
          <Form.Group controlId="description" className="mb-3">
            <Form.Label>Описание</Form.Label>
            <Form.Control
              onChange={(e) => setFields({...fields, description: e.target.value})}
              value={fields.description}
              type="text"
              placeholder="Введите описание"
              required
              isInvalid={errors.description.length > 0}
            />
            {errors.description.map((item, index) =>
              <Form.Control.Feedback type="invalid" key={index}>
                {item}
              </Form.Control.Feedback>
            )}
          </Form.Group>
          <Form.Group controlId="image" className="mb-3">
            <Form.Label style={{margin: 0}}>Изображение</Form.Label>
            <Form.Control
              onChange={(e) => setFields({...fields, image: e.target.files[0]})}
              type="file"
              accept="image/png, image/jpg, image/jpeg"
              placeholder="Выберите изображение..."
              isInvalid={errors.image.length > 0}
            />
            {errors.image.map((item, index) =>
              <Form.Control.Feedback type="invalid" key={index}>
                {item}
              </Form.Control.Feedback>
            )}
          </Form.Group>
          {imagePreview !== null &&
            <Row className="mb-3 align-items-center row-gap-1">
              <Col md={3}>
                <Form.Label style={{margin: 0}}>Текущее изображение</Form.Label>
              </Col>
              <Col md={9} s>
                <Image
                  src={
                    imagePreview
                  }
                  className="rounded mx-auto d-block"
                  style={{maxHeight: '300px', maxWidth: '95%'}}
                  alt="Изображение"
                />
              </Col>
            </Row>
          }
          <Form.Group className="mb-3">
            <Button
              variant="primary"
              size="sl"
              title="Добавить категорию"
              style={{marginBottom: 10}}
              onClick={(e) => addCategory()}
            >Добавить категорию</Button>
            <br/>
            <Form.Label>Категории</Form.Label>
            {categories !== null && fields.categories.map((item, index) => (
              <Row key={index} className="mb-3">
                <Col md={4}>
                  <Form.Group controlId={`categorySelect-${item}`}>
                    <Form.Label>Категория</Form.Label>
                    <Form.Select
                      value={item}
                      onChange={(e) => setCategoriesName(index, e.target.value)}
                    >
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </Form.Select>
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
                      onClick={(e) => deleteCategory(index)}
                    >
                      &#10005;
                    </Button>
                  </Form.Group>
                </Col>
              </Row>
            ))}
            <Form.Control
              isInvalid={errors.categories.length > 0}
              style={{display: 'none'}}
            />
            {errors.categories.map((item, index) =>
              <Form.Control.Feedback type="invalid" key={index}>
                {item}
              </Form.Control.Feedback>
            )}
          </Form.Group>
          {(params.productId && !checkSimilarity()) &&
            <Button variant="primary" type="submit" className="w-100" style={{marginBottom: '10px'}}>
              Редактировать запись
            </Button>
          }

          {isAlert &&
            <Alert variant='success'>
              Запись успешно отредактирована.
            </Alert>
          }
          {!params.productId &&
            <Button variant="primary" type="submit" className="w-100 mb-3">
              Добавить
            </Button>
          }
        </Form>
      </Container>
    }
  </>)
}