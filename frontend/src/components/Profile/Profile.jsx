import React, { useContext, useEffect, useState } from 'react';
import { Container, Form, Button, Row, Col, Image } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import { DataContext } from '../../context/dataContext';
import sortObject from '../../utils/sortObject'

export default function Profile() {
  const navigator = useNavigate();
  const dataContext = useContext(DataContext);

  const [fields, setFields] = useState({
    id: dataContext.data?.profile?.id,
    fullname: dataContext.data?.profile?.fullname,
    email: dataContext.data?.profile?.email,
    role: dataContext.data?.profile?.role,
    password: '',
    repeatPassword: ''
  });
  const [errors, setErrors] = useState({
    fullname: [],
    password: [],
    repeatPassword: [],
  });

  useEffect(() => {
    if (dataContext.data?.profile === null) {
      navigator('/login');
    }
  }, [dataContext.data?.profile])

  const updateProfile = async (e) => {
    e.preventDefault();
    if (fields.password !== fields.repeatPassword ||
        (dataContext.data?.profile?.patronymic !== "" && fields.patronymic === "")) {
      setErrors({
        fullname: [],
        password: [],
        repeatPassword: fields.password !== fields.repeatPassword ? ["Пароли не совпадают."] : [],
      });
      return;
    }
    try {
      let jsonData = {
        fullname: fields.fullname,
      };
      if (fields.password !== "") {
        jsonData.password = fields.password;
      }
      let data = await fetch(`${import.meta.env.VITE_API_URL}/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(jsonData)
      });
      if (data.status === 422) {
        let response = await data.json();
        setErrors({
          fullname: [],
          password: [],
          repeatPassword: [],
          ...response.errors});
      } else {
        let response = await data.json();
        dataContext.setData({
          ...dataContext.data,
          profile: {
            ...dataContext.data?.profile,
            ...response.data,
          }
        })
        setFields({
          ...fields,
          password: "",
          repeatPassword: "",
        })
        setErrors({
          fullname: [],
          password: [],
          repeatPassword: [],
        })
      }
    } catch (e) {

    }
  }

  return (<>
    {dataContext.data?.profile !== null &&
      <Container style={{ maxWidth: '600px' }} className="mt-4">
        <h2>Профиль</h2>
        <Form onSubmit={updateProfile}>
          <Row className="mb-3 align-items-center row-gap-1">
            <Col md={3}>
              <Form.Label style={{margin: 0}}>ФИО</Form.Label>
            </Col>
            <Col md={9} s>
              <Form.Control
                type="text"
                value={fields.fullname}
                onChange={(e) => setFields({...fields, fullname: e.target.value})}
                isInvalid={errors.fullname.length > 0}
                required
              />
              {errors.fullname.map((item, index) =>
                <Form.Control.Feedback type="invalid" key={index}>
                  {item}
                </Form.Control.Feedback>
              )}
            </Col>
          </Row>
          <Row className="mb-3 align-items-center row-gap-1">
            <Col md={3}>
              <Form.Label style={{margin: 0}}>Электронная почта</Form.Label>
            </Col>
            <Col md={9} s>
              <Form.Control
                type="text"
                value={fields.email}
                readOnly
              />
            </Col>
          </Row>
          <Row className="mb-3 align-items-center row-gap-1">
            <Col md={3}>
              <Form.Label style={{margin: 0}}>Пароль</Form.Label>
            </Col>
            <Col md={9} s>
              <Form.Control
                type="password"
                value={fields.password}
                onChange={(e) => setFields({...fields, password: e.target.value})}
                isInvalid={errors.password.length > 0 || errors.repeatPassword.length > 0}
              />
              {errors.password.map((item, index) =>
                <Form.Control.Feedback type="invalid" key={index}>
                  {item}
                </Form.Control.Feedback>
              )}
            </Col>
          </Row>
          <Row className="mb-3 align-items-center row-gap-1">
            <Col md={3}>
              <Form.Label style={{margin: 0}}>Повтор пароля</Form.Label>
            </Col>
            <Col md={9} s>
              <Form.Control
                type="password"
                value={fields.repeatPassword}
                onChange={(e) => setFields({...fields, repeatPassword: e.target.value})}
                isInvalid={errors.repeatPassword.length > 0}
              />
              {errors.repeatPassword.map((item, index) =>
                <Form.Control.Feedback type="invalid" key={index}>
                  {item}
                </Form.Control.Feedback>
              )}
            </Col>
          </Row>
          {(JSON.stringify(sortObject(fields)) !==
            JSON.stringify(sortObject({...dataContext.data?.profile, password: "", repeatPassword: ""}))) &&
            <Button
              variant="outline-primary"
              size="sm"
              className='w-100'
              type='submit'
            >
              Изменить
            </Button>
          }
        </Form>
      </Container>
    }
  </>);
}