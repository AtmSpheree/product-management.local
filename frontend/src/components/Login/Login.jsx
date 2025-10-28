import { useEffect, useState } from "react";
import { Button, Container, Form } from "react-bootstrap";
import { useNavigate } from "react-router";

export default function Login({ getProfile }) {
  const navigator = useNavigate();

  const [fields, setFields] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    email: [],
    password: [],
    total: []
  });

  const onFormSubmit = async (e) => {
    e.preventDefault();
    try {
      let data = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(fields)
      });
      if (data.status === 422) {
        let response = await data.json();
        setErrors({
          email: [],
          password: [],
          total: [],
          ...response.errors});
      } else {
        let response = await data.json();
        localStorage.setItem('token', response.token);
        await getProfile();
        navigator('/')
      }
    } catch (e) {

    }
  }

  return (
    <Container className="mt-4">
    <div 
      style={{zIndex: -10,
              position: 'absolute',
              width: '100%',
              height: '100%',
              left: 0,
              top: 0,
              objectFit: 'cover',
              backgroundImage: "url(/img/background.png)"}}
    >
    </div>
    <h2 style={{color: 'white'}} className="mb-4 text-center">Авторизация</h2>
    <Form onSubmit={onFormSubmit} style={{maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto'}}>
      <Form.Group controlId="email" className="mb-3">
        <Form.Label style={{color: 'white'}}>Электронная почта</Form.Label>
        <Form.Control
          onChange={(e) => setFields({...fields, email: e.target.value})}
          value={fields.email}
          type="email"
          placeholder="Введите email"
          required
          isInvalid={errors.email.length > 0 || errors.total.length > 0}
        />
        {errors.email.map((item, index) =>
          <Form.Control.Feedback type="invalid" key={index}>
            {item}
          </Form.Control.Feedback>
        )}
      </Form.Group>
      <Form.Group controlId="password" className="mb-3">
        <Form.Label style={{color: 'white'}}>Пароль</Form.Label>
        <Form.Control
          onChange={(e) => setFields({...fields, password: e.target.value})}
          value={fields.password}
          type="password"
          placeholder="Введите пароль"
          required
          isInvalid={errors.password.length > 0 || errors.total.length > 0}
        />
        {errors.password.map((item, index) =>
          <Form.Control.Feedback type="invalid" key={index}>
            {item}
          </Form.Control.Feedback>
        )}
        {errors.total.map((item, index) =>
          <Form.Control.Feedback type="invalid" key={index}>
            {item}
          </Form.Control.Feedback>
        )}
      </Form.Group>
      <Button variant="primary" type="submit" className="w-100 mb-3">
        Войти
      </Button>
    </Form>
  </Container>
  )
}